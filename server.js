require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

const websiteName = "CyberGuard Solutions";
const websiteDescription = "CyberGuard Solutions is a modern cybersecurity company offering advanced digital protection services like network security, cloud defense, penetration testing, and cyber monitoring. The company also provides an in-house AI assistant for employees and interns, helping them instantly access workflow guidance, HR support, and onboarding help without needing to ask HR manually.";

app.use('/static', express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'CyberguardSolution Website.html'));
});

app.post('/api/assistant', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: `You are CyberGuard Assistant, an AI chatbot for ${websiteName}. You must only answer questions based on the following description of the company and its services. If the answer is not in the description, say 'I can only answer questions about CyberGuard Solutions based on its company description.'.\n\nCompany Description:\n${websiteDescription}` },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      return res.status(response.status).send('Error from Perplexity API');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running on http://localhost:' + port));
