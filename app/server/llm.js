// Gemini text client with function calling (REST). Isolated so tests can swap in a mock with the same generate() shape.
export const textModel = () => process.env.GEMINI_TEXT_MODEL || 'gemini-2.0-flash';
export const keySet = () => Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_'));

export const geminiClient = {
  async generate({ system, contents, tools }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${textModel()}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        tools: [{ functionDeclarations: tools }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      }),
    });
    if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const content = data.candidates?.[0]?.content;
    if (!content) throw new Error('gemini returned no content');
    return content; // { role: 'model', parts: [{text}|{functionCall:{name,args}}] }
  },
};
