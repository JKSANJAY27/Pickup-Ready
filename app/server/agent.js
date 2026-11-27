// Path A conversation layer: the model converses in Tamil, and reaches inventory and orders only through runTool.
import { TOOL_DECLARATIONS, newSession, startTurn, runTool } from './tools.js';

export const SYSTEM_PROMPT = `You are the voice of a wholesale provisions shop's order desk in Tamil Nadu. A retailer is speaking to you on the phone.
Speak natural, warm, SHORT spoken Tamil (Tamil script), one or two sentences per turn. Keep English brand names and product names in English letters. No lists, no markdown, no emojis.
You have tools. You never know stock, prices, totals or what an item means except from tool results. Never state a number a tool did not give you.
Flow: for each item the retailer names call lookup_item. If ambiguous, ask which one (offer the options) and wait. If unknown, ask what they mean; if they name a product, ask whether to save their word as that product, and call save_word only after they say aama. If they say we don't carry it, call report_not_carried.
If out of stock, call find_alternative and offer exactly ONE alternative with its price. Then call propose_order and read back the lines and the exact total, and ask them to say aama to confirm. Call confirm_order only in the turn after they said aama. If they say illa, call cancel_order.
If the retailer says something that is not an order, answer briefly and steer back to the order. If you did not understand, ask them to repeat; do not guess.
When a tool returns an error, follow it. Never claim an order is reserved unless confirm_order returned reserved.`;

export class Agent {
  constructor(desk, llm) { this.desk = desk; this.llm = llm; this.sessions = new Map(); }
  session(retailerId) { if (!this.sessions.has(retailerId)) this.sessions.set(retailerId, newSession(retailerId)); return this.sessions.get(retailerId); }
  reset() { this.sessions.clear(); }

  async turn(retailerId, text) {
    const s = this.session(retailerId);
    const trace = [];
    startTurn(s, text);
    this.log(retailerId, 'retailer', text);
    s.contents.push({ role: 'user', parts: [{ text }] });
    let reply = '', orderId = null;
    for (let round = 0; round < 6; round++) {
      const content = await this.llm.generate({ system: SYSTEM_PROMPT, contents: s.contents, tools: TOOL_DECLARATIONS });
      s.contents.push(content);
      const calls = (content.parts || []).filter((p) => p.functionCall);
      const said = (content.parts || []).filter((p) => p.text).map((p) => p.text).join(' ').trim();
      if (!calls.length) { reply = said; break; }
      const responses = [];
      for (const { functionCall: fc } of calls) {
        trace.push({ who: 'ai', text: `AI asked the desk: ${fc.name}(${JSON.stringify(fc.args || {})})` });
        const result = runTool(this.desk, s, fc.name, fc.args || {}, trace);
        if (result.order_id) orderId = result.order_id;
        responses.push({ functionResponse: { name: fc.name, response: result } });
      }
      s.contents.push({ role: 'user', parts: responses });
    }
    if (!reply) reply = 'மன்னிக்கவும், மறுபடியும் சொல்லுங்க.';
    this.log(retailerId, 'desk', reply);
    if (s.contents.length > 40) s.contents.splice(0, s.contents.length - 40);
    return { reply, sentences: reply.split(/(?<=[.?!।])\s+/).filter(Boolean), trace, order_id: orderId, pending: s.pending ? { total: s.pending.total } : null };
  }

  log(retailerId, role, text) {
    this.desk.db.prepare('INSERT INTO call_transcripts (retailer_id, role, text, created_at) VALUES (?,?,?,?)').run(retailerId, role, text, new Date().toISOString());
  }
  transcripts() {
    return this.desk.db.prepare('SELECT t.*, r.name retailer FROM call_transcripts t JOIN retailers r ON r.id=t.retailer_id ORDER BY t.id DESC LIMIT 200').all().reverse();
  }
}
