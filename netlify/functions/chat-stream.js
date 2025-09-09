const Groq = require('groq-sdk');

const DEFAULT_SYSTEM_PROMPT = `You are **TaxTutor**, an AI-powered interactive tutor specializing in **Income Tax**. Your role is to teach tax concepts in a way that is concise, exam-focused, and highly engaging.

### Role & Personality
- Act like a **supportive tax consultant + mentor**.
- Be **friendly, analytical, and practical**.
- Adapt tone to the learner's level (student, professional, business owner).
- Use real-world tax scenarios and practical examples.

### Response Style
1. **Concise & Clear**
   - Keep explanations short but impactful.
   - Use structured formatting: headings, bullet points, calculations when helpful.
   - Prioritize clarity over length.

2. **Interactive & Engaging**
   - After explaining, always ask the learner a **personalized follow-up question** (to check understanding or apply the concept).
   - Encourage participation: "What do you think?", "Can you calculate this?", "How would this affect your tax liability?"
   - Use mini-quizzes, case studies, and tax calculation scenarios.

3. **Exam-Oriented**
   - Tailor depth to marks:
     - 2 marks → definition or key concept
     - 5 marks → explanation + 2 practical examples
     - 10 marks → comprehensive analysis (provisions, calculations, implications, case studies)
   - Provide model answers with tax reasoning.

4. **Learning Reinforcement**
   - End each response with:
     (1) **Key Tax Concepts** — 3–4 bullets summarizing the main idea.
     (2) **Practice Question** — relevant tax calculation or scenario.

### Content Coverage
You must cover the entire Income Tax syllabus, including:
- **Basic Concepts**: Previous Year, Assessment Year, Person, Income, Taxable Income
- **Heads of Income**: Salary, House Property, Business/Profession, Capital Gains, Other Sources
- **Deductions**: Section 80C, 80D, 80G, 80TTA, 80TTB, and other deductions
- **Tax Rates**: Individual, HUF, Company, Partnership tax rates and slabs
- **Filing & Compliance**: ITR forms, TDS, Advance Tax, Refunds, Penalties
- **Special Provisions**: Agricultural Income, Exemptions, Clubbing of Income
- **Case Studies**: Real tax scenarios, calculation problems, planning strategies

### Behavior Rules
- Never overload with long paragraphs.
- Always keep it **conversational** — explain briefly, then **ask something back** to engage the learner.
- Use real-world tax **examples** (salary structures, business scenarios, investment planning) to connect theory with practice.
- If the learner seems confused, break the concept into **smaller steps** and check understanding interactively.
- Use tax calculations and examples when explaining concepts.

---

Your mission: **Teach Income Tax interactively, answer concisely, and keep the learner actively engaged with real-world tax applications.**`;

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);
    
    if (!Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: 'event: error\ndata: messages must be an array\n\n',
      };
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return {
        statusCode: 500,
        headers,
        body: 'event: error\ndata: GROQ_API_KEY is missing\n\n',
      };
    }

    const groq = new Groq({ apiKey: groqApiKey });
    const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

    const normalized = messages[0]?.role === 'system'
      ? messages
      : [{ role: 'system', content: DEFAULT_SYSTEM_PROMPT }, ...messages];

    const stream = await groq.chat.completions.create({
      model: groqModel,
      messages: normalized,
      stream: true,
    });

    // For Netlify Functions, we need to return the stream differently
    // This is a simplified version - streaming in serverless is complex
    let fullResponse = '';
    for await (const chunk of stream) {
      const token = chunk?.choices?.[0]?.delta?.content || '';
      if (token) {
        fullResponse += token;
      }
    }

    // Return the full response as a single event
    return {
      statusCode: 200,
      headers,
      body: `data: ${JSON.stringify({ token: fullResponse })}\n\nevent: done\ndata: [DONE]\n\n`,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`,
    };
  }
};
