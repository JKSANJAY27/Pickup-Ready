// Run once with a real key: lists models the key can call (to pick GEMINI_TEXT_MODEL and GEMINI_LIVE_MODEL), then one text turn.
// Usage: GEMINI_API_KEY=... node scripts/spike.js
const key = process.env.GEMINI_API_KEY;
if (!key) { console.log('GEMINI_API_KEY key not set'); process.exit(0); }
const r = await (await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${key}`)).json();
for (const m of r.models || []) console.log(m.name.padEnd(60), (m.supportedGenerationMethods || []).join(','));
if (r.error) console.log('error:', r.error.message);
