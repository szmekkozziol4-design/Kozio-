const https = require('https');

exports.handler = async function(event) {
  const { message, history } = JSON.parse(event.body || '{}');
  const key = process.env.GEMINI_KEY;
  
  const prompt = 'Jestes asystentem firmy budowlanej Koziol z Krakowa. Tel: +48 123 456 789. Fundamenty: 900-1100zl/m2, stan surowy: 2800-3500zl/m2, dachy: 500-700zl/m2, zelbet: 700-900zl/m2. Odpowiadaj po polsku, max 3 zdania.';
  
  const contents = (history && history.length > 0) ? history : [{role:'user', parts:[{text: message || 'czesc'}]}];
  
  const postData = JSON.stringify({
    system_instruction: {parts:[{text: prompt}]},
    contents: contents
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/gemini-2.5-flash:generateContent?key=' + key,
      method: 'POST',
      headers: {'Content-Type':'application/json','Content-Length':Buffer.byteLength(postData)}
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const text = json.candidates[0].content.parts[0].text;
          resolve({statusCode:200, headers:{'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'}, body: text});
        } catch(e) {
          resolve({statusCode:200, headers:{'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'}, body: 'Blad parsowania: ' + body.substring(0,200)});
        }
      });
    });
    req.on('error', e => resolve({statusCode:500, body: e.message}));
    req.write(postData);
    req.end();
  });
};
