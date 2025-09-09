const Groq = require('groq-sdk');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: 'GROQ_API_KEY missing' }),
      };
    }

    const groq = new Groq({ apiKey: groqApiKey });
    const models = await groq.models.list();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        ok: true, 
        models: models.data?.map(m => m.id) || [] 
      }),
    };
  } catch (error) {
    console.error('Health error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        ok: false, 
        error: error.message || 'Unknown error' 
      }),
    };
  }
};
