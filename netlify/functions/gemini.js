const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, history } = JSON.parse(event.body);
    const key = process.env.GEMINI_KEY;

    const systemPrompt = 'Jestes profesjonalnym asystentem firmy budowlanej Koziol z Krakowa. Firma istnieje od 1994 roku. Telefon: +48 123 456 789. Uslugi: fundamenty 900-1100 zl/m2, stan surowy 2800-3500 zl/m2, dachy 500-700 zl/m2, zelbet 700-900 zl/m2, remonty wycena indywidualna. Odpowiadaj po polsku, max 3 zdania, badz przyjazny.';

    const requestBody = JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: history && history.length > 0 ? history : [{ role: 'user', parts: [{ text: message }] }]
    });

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });

      req.on('error', reject);
      req.write(requestBody);
      req.end();
    });

    const data = JSON.parse(response.body);
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
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Blad: ' + e.message
    };
  }
};
