// Path B browser side: mic -> 16kHz PCM -> server (/api/live) -> Gemini Live -> 24kHz PCM back. Needs a key and a real browser mic.
(() => {
  let ctx, stream, node, es, sid, playCtx, nextT = 0, sources = [], active = false;
  const WORKLET = `class P extends AudioWorkletProcessor{process(i){const c=i[0][0];if(c)this.port.postMessage(c.slice(0));return true}}registerProcessor('pcm',P)`;
  const b64ToBytes = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  function toPcm16(f32, inRate) { // downsample to 16k with simple averaging, then int16
    const ratio = inRate / 16000, n = Math.floor(f32.length / ratio), out = new Int16Array(n);
    for (let i = 0; i < n; i++) { let s = 0, c = 0; for (let j = Math.floor(i * ratio); j < Math.floor((i + 1) * ratio) && j < f32.length; j++) { s += f32[j]; c++; } out[i] = Math.max(-1, Math.min(1, s / (c || 1))) * 32767; }
    return out;
  }
  function play(b64) {
    const pcm = new Int16Array(b64ToBytes(b64).buffer), buf = playCtx.createBuffer(1, pcm.length, 24000), ch = buf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 32768;
    const src = playCtx.createBufferSource(); src.buffer = buf; src.connect(playCtx.destination);
    nextT = Math.max(nextT, playCtx.currentTime); src.start(nextT); nextT += buf.duration; sources.push(src); src.onended = () => (sources = sources.filter((x) => x !== src));
  }
  const stopPlayback = () => { sources.forEach((s) => { try { s.stop(); } catch {} }); sources = []; nextT = 0; };

  window.startLive = async (retailerId, hooks) => {
    const r = await fetch('/api/live/start', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ retailer_id: retailerId }) });
    if (!r.ok) throw new Error((await r.json()).message || 'could not start');
    sid = (await r.json()).session; active = true;
    playCtx = new AudioContext({ sampleRate: 24000 });
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    ctx = new AudioContext(); const url = URL.createObjectURL(new Blob([WORKLET], { type: 'text/javascript' }));
    await ctx.audioWorklet.addModule(url);
    node = new AudioWorkletNode(ctx, 'pcm'); ctx.createMediaStreamSource(stream).connect(node);
    let queue = [], qlen = 0;
    node.port.onmessage = (e) => { // batch ~100ms of audio per POST
      const pcm = toPcm16(e.data, ctx.sampleRate); queue.push(pcm); qlen += pcm.length;
      if (qlen >= 1600 && active) { const all = new Int16Array(qlen); let o = 0; queue.forEach((q) => { all.set(q, o); o += q.length; }); queue = []; qlen = 0;
        fetch(`/api/live/audio?session=${sid}`, { method: 'POST', body: all.buffer }).catch(() => {}); }
    };
    es = new EventSource(`/api/live/events?session=${sid}`);
    es.onmessage = (m) => { const ev = JSON.parse(m.data);
      if (ev.type === 'audio') play(ev.data);
      else if (ev.type === 'interrupted') stopPlayback();
      hooks(ev); };
  };
  window.liveDrainMs = () => Math.max(0, (nextT - (playCtx?.currentTime || 0)) * 1000);
  window.stopLive = async () => {
    active = false; es?.close(); node?.disconnect(); stream?.getTracks().forEach((t) => t.stop()); stopPlayback();
    ctx?.close(); playCtx?.close(); if (sid) await fetch(`/api/live/stop?session=${sid}`, { method: 'POST' }); sid = null;
  };
})();
