// frontend/clients/fireworks-api-client.js

// IMPORTANT: Use /api as base URL (Next.js proxy pattern)
// This points to Next.js API routes, NOT Fireworks AI directly
const API_BASE_URL = '/api';

class FireworksAPIClient {
  /**
   * Send a prompt to Fireworks AI and get a response
   * @param {Object} params - Request parameters
   * @param {string} params.prompt - The prompt to send to Fireworks AI
   * @param {string} [params.model] - Optional model name (defaults to llama4-maverick-instruct-basic)
   * @returns {Promise<string>} The AI-generated response content
   */
  static async sendPrompt({ prompt, model }) {
    try {
      // Call Next.js proxy route
      // Browser calls: /api/fireworks
      // Next.js proxies to: https://api.fireworks.ai/inference/v1/chat/completions
      const response = await fetch(`${API_BASE_URL}/fireworks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `Fireworks AI request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.content) {
        throw new Error('Invalid response structure from Fireworks AI');
      }

      return data.content;
    } catch (error) {
      console.error('Error calling Fireworks AI:', error);
      throw error;
    }
  }
}

export default FireworksAPIClient;

