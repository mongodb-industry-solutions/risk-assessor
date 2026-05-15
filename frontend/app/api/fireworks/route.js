// frontend/app/api/fireworks/route.js

export async function POST(request) {
  try {
    // Get request body (JSON)
    const body = await request.json();
    const { prompt } = body;
    const model = process.env.FIREWORKS_MODEL || "accounts/fireworks/models/llama-v3p1-70b-instruct";

    if (!prompt) {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get Fireworks API key from server-side environment (NOT exposed to browser)
    // Use FIREWORKS_API_KEY (server-side only)
    const apiKey = process.env.FIREWORKS_API_KEY;

    if (!apiKey) {
      console.error('❌ Fireworks API key not configured');
      return Response.json(
        { error: 'Fireworks API key not configured' },
        { status: 500 }
      );
    }

    const fireworksUrl = 'https://api.fireworks.ai/inference/v1/chat/completions';

    console.log(`🔗 Proxying POST request to Fireworks AI`);

    // Forward request to Fireworks AI
    const response = await fetch(fireworksUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 3072,
        top_p: 0.9,
        top_k: 40,
        presence_penalty: 0.3,
        frequency_penalty: 0.4,
        temperature: 0.3,
        messages: [{ content: prompt, role: "user" }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Fireworks AI error:', errorData);
      const message =
        (typeof errorData.error === 'string' && errorData.error) ||
        errorData.error?.message ||
        'Fireworks AI request failed';
      return Response.json(
        { error: message, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from Fireworks AI:', data);
      return Response.json(
        { error: 'Invalid response from Fireworks AI' },
        { status: 500 }
      );
    }

    return Response.json({
      content: data.choices[0].message.content,
      usage: data.usage,
    });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return Response.json(
      { error: 'Failed to connect to Fireworks AI', details: error.message },
      { status: 500 }
    );
  }
}

