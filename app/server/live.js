// Path B: Gemini Live (native speech-to-speech). The browser sends 16kHz PCM mic audio to this server; the server relays it
// to a Gemini Live WebSocket and streams 24kHz PCM replies back. The model's tool calls run through the SAME runTool gates as Path A.
// No npm dependency: uses Node 22's built-in WebSocket client. Browser <-> server uses plain HTTP (POST audio, SSE events).
import { TOOL_DECLARATIONS, newSession, startTurn, runTool } from './tools.js';
import { SYSTEM_PROMPT } from './agent.js';

export const liveModel = () => process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview'; // verified with a real AI Studio key on Nov 27
const URL_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

export class LiveSession {
  // connect(url) must return a WebSocket-like object (tests pass a fake).
  constructor({ agent, retailerId, key, emit, connect = (u) => new WebSocket(u) }) {
    Object.assign(this, { agent, retailerId, emit });
    this.desk = agent.desk;
    this.s = newSession(retailerId);
    this.inBuf = ''; this.outBuf = ''; this.endAfterGoodbye = false; this.trace = []; this.ready = false; this.closed = false;
    this.ws = connect(`${URL_BASE}?key=${encodeURIComponent(key)}`);
    this.ws.onopen = () => this.send({ setup: {
      model: `models/${liveModel()}`,
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { languageCode: 'ta-IN' } },
      systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n${agent.context(retailerId)}` }] },
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      inputAudioTranscription: {}, outputAudioTranscription: {} } });
    this.ws.onmessage = (ev) => this.onMessage(ev.data);
    this.ws.onerror = () => { this.emit({ type: 'error', message: 'live connection error' }); };
    this.ws.onclose = (ev) => { this.closed = true; this.flush(); this.emit({ type: 'closed', reason: ev?.reason || '' }); };
  }
  send(o) { try { this.ws.send(JSON.stringify(o)); } catch { /* socket closed */ } }
  audio(buf) { if (this.ready && !this.closed) this.send({ realtimeInput: { audio: { data: Buffer.from(buf).toString('base64'), mimeType: 'audio/pcm;rate=16000' } } }); }
  // Each retailer utterance (Gemini's input transcription) counts as a new turn. confirm_order needs a turn after the read-back.
  armGate() {
    if (!this.inBuf.trim()) return;
    startTurn(this.s, this.inBuf.trim());
    this.agent.log(this.retailerId, 'retailer', this.inBuf.trim());
    this.inBuf = '';
  }
  flush() { if (this.outBuf.trim()) this.agent.log(this.retailerId, 'desk', this.outBuf.trim()); this.outBuf = ''; }
  async onMessage(raw) {
    // Gemini sends JSON in binary frames; Node's WebSocket delivers those as Blob.
    if (typeof raw !== 'string') raw = typeof raw.text === 'function' ? await raw.text() : Buffer.from(raw).toString('utf8');
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.setupComplete) { this.ready = true; return this.emit({ type: 'ready' }); }
    const sc = m.serverContent;
    if (sc) {
      if (sc.inputTranscription?.text) { this.inBuf += sc.inputTranscription.text; this.emit({ type: 'retailer_text', text: this.inBuf }); }
      if (sc.outputTranscription?.text) { this.armGate(); this.outBuf += sc.outputTranscription.text; this.emit({ type: 'desk_text', text: this.outBuf }); }
      for (const p of sc.modelTurn?.parts || []) if (p.inlineData?.data) { this.armGate(); this.emit({ type: 'audio', data: p.inlineData.data, mime: p.inlineData.mimeType }); }
      if (sc.interrupted) { this.flush(); this.emit({ type: 'interrupted' }); }
      if (sc.turnComplete) {
        this.flush(); this.emit({ type: 'turn_complete' });
        if (this.endAfterGoodbye) { this.emit({ type: 'call_ended' }); this.close(); }
      }
    }
    if (m.toolCall) {
      this.armGate();
      const responses = [];
      for (const fc of m.toolCall.functionCalls || []) {
        this.trace.push({ who: 'ai', text: `AI asked the desk: ${fc.name}(${JSON.stringify(fc.args || {})})` });
        const result = runTool(this.desk, this.s, fc.name, fc.args || {}, this.trace);
        responses.push({ id: fc.id, name: fc.name, response: result });
      }
      this.emit({ type: 'trace', trace: this.trace.splice(0) });
      this.send({ toolResponse: { functionResponses: responses } });
      if (this.s.ended) { this.endAfterGoodbye = true; setTimeout(() => { if (!this.closed) { this.emit({ type: 'call_ended' }); this.close(); } }, 10000).unref?.(); } // close after the goodbye turn completes (10 s fallback)
    }
  }
  close() { this.closed = true; try { this.ws.close(); } catch { /* already closed */ } }
}

// Registry of live sessions and their SSE listeners (one active session per browser tab, keyed by id).
export class LiveHub {
  constructor(agent, key, connect) { Object.assign(this, { agent, key, connect }); this.sessions = new Map(); this.n = 0; }
  start(retailerId) {
    const id = `live${++this.n}`;
    const entry = { listeners: new Set(), queue: [] };
    const emit = (e) => { entry.queue.push(e); for (const l of entry.listeners) l(e); if (entry.queue.length > 500) entry.queue.shift(); };
    entry.session = new LiveSession({ agent: this.agent, retailerId, key: this.key(), emit, connect: this.connect });
    this.sessions.set(id, entry);
    return id;
  }
  get(id) { return this.sessions.get(id); }
  stop(id) { this.get(id)?.session.close(); this.sessions.delete(id); }
}
