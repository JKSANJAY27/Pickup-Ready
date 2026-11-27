// The interpreter PROPOSES order lines from a transcript. It never touches stock or money.
// Live mode: Gemini (if GEMINI_API_KEY is set). Otherwise a rule-based parser, labelled "Scripted sample, not live AI".
const NUM_WORDS = { onnu: 1, oru: 1, rendu: 2, moonu: 3, naalu: 4, anju: 5, aaru: 6, ezhu: 7, ettu: 8, onbadhu: 9, pathu: 10,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const YES = ['aama', 'aam', 'yes', 'ok', 'sari', 'seri', 'confirm', 'ஆமா', 'ஆம்', 'சரி'];
const NO = ['illa', 'venam', 'no', 'vendam', 'இல்ல', 'வேண்டாம்'];

export const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
export const isYes = (t) => norm(t).split(' ').some((w) => YES.includes(w));
export const isNo = (t) => norm(t).split(' ').some((w) => NO.includes(w));

export const liveAiAvailable = () => Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_'));

export function scriptedParse(text) {
  const segments = text.toLowerCase().split(/\s*(?:[,;]|\band\b|\bmattrum\b|\baprom\b|\baprm\b|\bplus\b)\s*/).map(norm).filter(Boolean);
  const lines = [];
  for (const seg of segments) {
    const words = seg.split(' ');
    let qty = null;
    const rest = [];
    for (const w of words) {
      if (qty === null && /^\d+$/.test(w)) qty = Number(w);
      else if (qty === null && NUM_WORDS[w]) qty = NUM_WORDS[w];
      else rest.push(w);
    }
    const term = rest.join(' ').replace(/\b(venum|vendum|venumnga|pannunga|kudunga|please)\b/g, '').trim();
    if (term.length > 1) lines.push({ term, qty: qty ?? 1 });
  }
  return lines;
}

async function geminiParse(text, vocabulary) {
  const prompt = `You read a Tamil/English code-mixed wholesale order. Return ONLY JSON: {"lines":[{"term":"<product words as spoken>","qty":<integer>}]}. Return {"lines":[]} if it is not an order. Known catalogue words: ${vocabulary.join(', ')}.\nOrder: ${text}`;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
  return parsed.lines.map((l) => ({ term: norm(String(l.term)), qty: Math.max(1, Number(l.qty) || 1) }));
}

export async function interpret(text, vocabulary = []) {
  if (liveAiAvailable()) {
    try { return { lines: await geminiParse(text, vocabulary), mode: 'live_ai' }; } catch { /* fall through to scripted */ }
  }
  return { lines: scriptedParse(text), mode: 'scripted' };
}
