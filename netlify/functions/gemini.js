exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  
    try {
      const { message, history } = JSON.parse(event.body);
      const key = process.env.GEMINI_KEY;
  
      const systemPrompt = 'Jestes profesjonalnym asystentem firmy budowlanej Koziol z Krakowa. Firma istnieje od 1994 roku - trzy pokolenia rodziny Koziol. Dzialamy na terenie Krakowa i calej Malopolski. Telefon: +48 123 456 789, Email: biuro@firmakoziol.pl. Godziny: Pn-Pt 7:00-17:00, Sob 8:00-13:00. USLUGI I CENY: Fundamenty: 900-1100 zl/m2. Stan surowy: 2800-3500 zl/m2. Dachy: 500-700 zl/m2. Zelbet: 700-900 zl/m2. Remonty: wycena indywidualna. Posiadamy wlasne ladownarki teleskopowe. Kadra inzynierska z wyzszym wyksztalceniem. Gwarancja na kazda realizacje. ZASADY: Odpowiadaj WYLACZNIE po polsku. Max 3-4 zdania. Badz przyjazny i konkretny. Jesli klient pyta o wycene zapytaj o imie i telefon.';
  
      const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: history || [{ role: 'user', parts: [{ text: message }] }]
      };
  
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
  
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        },
        body: text
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: 'Error: ' + e.message
      };
    }
  };