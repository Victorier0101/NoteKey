// Gemini API Service for AI explanations

const GeminiService = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  endpoint: 'https://generativelanguage.googleapis.com/v1/',

  // Initialize with API key
  init(apiKey) {
    this.apiKey = apiKey;
  },

  // Get explanation for highlighted text
  async getExplanation(text) {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const prompt = `You are an academic assistant helping a student understand concepts. 
Provide a SHORT and CONCISE explanation (2-3 sentences maximum) of the following text:

"${text}"

Keep your response brief, clear, and educational. Focus on the key concept.`;

    try {
      const url = `${this.endpoint}models/${this.model}:generateContent?key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error:', JSON.stringify(errorData, null, 2));
        
        if (response.status === 429) {
          throw new Error('RATE_LIMIT');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('INVALID_API_KEY');
        } else {
          throw new Error('API_ERROR');
        }
      }

      const data = await response.json();
      console.log('Full Gemini response:', JSON.stringify(data, null, 2));
      
      // Check if content was blocked by safety filters
      if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        console.log('Candidate:', JSON.stringify(candidate, null, 2));
        
        // Check for content filtering
        if (candidate.finishReason === 'SAFETY') {
          console.warn('Content blocked by Gemini safety filters');
          throw new Error('SAFETY_FILTER');
        }
        
        // Check for MAX_TOKENS (response was cut off)
        if (candidate.finishReason === 'MAX_TOKENS') {
          console.warn('Response hit max tokens limit - may be incomplete');
          // Continue anyway - we'll try to get what we have
        }
        
        // Check for other unusual finish reasons
        if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
          console.warn('Unusual finish reason:', candidate.finishReason);
        }
        
        // Get the content - check if parts array exists
        if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
          const explanation = candidate.content.parts[0].text;
          console.log('Successfully extracted explanation');
          return explanation.trim();
        } else {
          console.error('Content exists but no parts array:', JSON.stringify(candidate.content, null, 2));
          throw new Error('No explanation text in response - try simpler text');
        }
      }
      
      // Check for error in response
      if (data.error) {
        console.error('API returned error:', JSON.stringify(data.error, null, 2));
        throw new Error('API_ERROR');
      }
      
      // If we get here, response format was unexpected
      console.error('Unexpected response format:', JSON.stringify(data, null, 2));
      console.error('Could not find explanation in response structure');
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'NetworkError') {
        throw new Error('NETWORK_ERROR');
      }
      throw error;
    }
  },

  // Format error messages for display
  getErrorMessage(error) {
    if (error.message === 'NETWORK_ERROR') {
      return 'No internet connection. Please check your network and try again.';
    } else if (error.message === 'RATE_LIMIT') {
      return 'Too many requests. Please wait a moment and try again.';
    } else if (error.message === 'INVALID_API_KEY') {
      return 'Invalid API key. Please check your configuration.';
    } else if (error.message === 'API key not configured') {
      return 'API key not configured. Please add your Gemini API key.';
    } else if (error.message === 'SAFETY_FILTER') {
      return 'Content blocked by safety filters. Try different text or simplify your selection.';
    } else if (error.message === 'API_ERROR') {
      return 'AI request failed. Please try again later.';
    } else if (error.message && error.message.includes('No explanation text')) {
      return 'Could not generate explanation. Try selecting more meaningful text (not just codes/numbers).';
    } else {
      return 'An unexpected error occurred. Try selecting different text.';
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.GeminiService = GeminiService;
}

