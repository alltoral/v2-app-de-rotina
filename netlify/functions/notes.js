const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    const { getStore } = require('@netlify/blobs');

    const params = event.queryStringParameters || {};
    const code = (params.code || '').trim().toLowerCase();
    const date = (params.date || '').trim();

    const codeOk = /^[a-z0-9]{4,16}$/.test(code);
    const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);

    if (!codeOk || !dateOk) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'código ou data inválidos' })
      };
    }

    const store = getStore('meu-dia-boards');
    const key = code + ':' + date;

    if (event.httpMethod === 'GET') {
      const data = await store.get(key);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: data || JSON.stringify({ notes: [] })
      };
    }

    if (event.httpMethod === 'POST') {
      const parsed = JSON.parse(event.body || '{}');
      if (!Array.isArray(parsed.notes)) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'payload inválido: "notes" precisa ser uma lista' })
        };
      }
      await store.set(key, JSON.stringify(parsed));
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  } catch (err) {
    // Return the real error instead of letting the function crash silently,
    // so it's visible by just hitting the URL in a browser.
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'crash', message: err && err.message, stack: err && err.stack })
    };
  }
};
