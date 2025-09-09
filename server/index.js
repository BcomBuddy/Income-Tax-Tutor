import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const groqApiKey = process.env.GROQ_API_KEY;
const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const DEFAULT_SYSTEM_PROMPT = `You are **BizTutor**, an AI-powered interactive tutor specializing in **Business Organization & Management (B.O.M.)**. Your role is to teach in a way that is concise, exam-focused, and highly engaging.\n\n### Role & Personality\n- Act like a **supportive teacher + coach**.\n- Be **friendly, professional, and interactive**.\n- Adapt tone to the learner’s grade level or preparation goal (e.g., school, college, exam).\n\n### Response Style\n1. **Concise & Clear**\n   - Keep answers short but impactful.\n   - Use structured formatting: headings, bullet points, short paragraphs.\n   - Prioritize clarity over length.\n\n2. **Interactive & Engaging**\n   - After explaining, always ask the learner a **personalized follow-up question** (to check understanding or apply the concept).\n   - Encourage participation: “What do you think?”, “Can you give me an example?”, “Which option would you choose?”\n   - Where appropriate, use mini-quizzes or polls (MCQ-style) inside the conversation.\n\n3. **Exam-Oriented**\n   - Tailor depth to marks:\n     - 2 marks → definition or one-liner\n     - 5 marks → short explanation + 2 examples\n     - 10 marks → structured answer (definition, features, pros/cons, example)\n   - Provide model answers where needed.\n\n4. **Learning Reinforcement**\n   - End each response with:\n     (1) **Key Takeaways** — 3–4 bullets summarizing the main idea.\n     (2) **Practice Question** — small, relevant, and exam-style.\n\n### Content Coverage\nYou must cover the entire Business Organization & Management syllabus, including:\n- Nature & Objectives of Business\n- Forms of Organization (Sole, Partnership, LLP, Joint Stock Company, Cooperative, Public Enterprise)\n- Principles of Management (Fayol, Taylor, modern)\n- Planning, Organizing, Staffing, Directing, Controlling\n- Business Environment, CSR, Ethics, Globalization, Entrepreneurship\n- Case studies, decision-making, and exam prep support\n\n### Behavior Rules\n- Never overload with long paragraphs.\n- Always keep it **conversational** — explain briefly, then **ask something back** to engage the learner.\n- Use real-world business **examples** (shops, startups, companies) to connect theory with practice.\n- If the learner seems confused, break the concept into **smaller steps** and check understanding interactively.\n\n---\n\nYour mission: **Teach interactively, answer concisely, and keep the learner actively engaged in Business Organization & Management.**`;
if (!groqApiKey) {
  console.warn('Warning: GROQ_API_KEY is not set. Create a .env with GROQ_API_KEY=...');
}
const groq = new Groq({ apiKey: groqApiKey });

app.get('/api/health', async (req, res) => {
  try {
    if (!groqApiKey) {
      return res.status(500).json({ ok: false, error: 'GROQ_API_KEY missing' });
    }
    const models = await groq.models.list();
    return res.json({ ok: true, models: models.data?.map(m => m.id) || [] });
  } catch (err) {
    console.error('Health error', err?.response?.data || err?.message || err);
    return res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    if (!groqApiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is missing on server' });
    }

    const normalized = messages[0]?.role === 'system'
      ? messages
      : [{ role: 'system', content: DEFAULT_SYSTEM_PROMPT }, ...messages];

    const completion = await groq.chat.completions.create({
      model: groqModel, // per your sample: "openai/gpt-oss-20b"
      messages: normalized,
    });

    const content = completion.choices?.[0]?.message?.content || '';
    return res.json({ content });
  } catch (err) {
    const details = err?.response?.data || err?.message || err;
    console.error('Groq error', details);
    return res.status(500).json({ error: 'Failed to get response from Groq', details });
  }
});

// Simple test endpoint that mirrors the sample you provided
app.get('/api/test', async (req, res) => {
  try {
    if (!groqApiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is missing on server' });
    }
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Explain the importance of fast language models',
        },
      ],
      model: 'openai/gpt-oss-20b',
    });
    const content = completion.choices?.[0]?.message?.content || '';
    return res.json({ content });
  } catch (err) {
    const details = err?.response?.data || err?.message || err;
    console.error('Groq test error', details);
    return res.status(500).json({ error: 'Groq test failed', details });
  }
});

// Streaming endpoint (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      res.writeHead(400, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write(`event: error\n`);
      res.write(`data: messages must be an array\n\n`);
      return res.end();
    }
    if (!groqApiKey) {
      res.writeHead(500, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write(`event: error\n`);
      res.write(`data: GROQ_API_KEY is missing on server\n\n`);
      return res.end();
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const normalized = messages[0]?.role === 'system'
      ? messages
      : [{ role: 'system', content: DEFAULT_SYSTEM_PROMPT }, ...messages];

    const stream = await groq.chat.completions.create({
      model: groqModel,
      messages: normalized,
      stream: true,
    });

    // Groq JS SDK returns an async iterable when stream: true
    for await (const chunk of stream) {
      const token = chunk?.choices?.[0]?.delta?.content || '';
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write(`event: done\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    const details = err?.response?.data || err?.message || 'Unknown error';
    console.error('Groq stream error', details);
    try {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify(details)}\n\n`);
      res.end();
    } catch {}
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});




