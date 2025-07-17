// AI Service for Nitro Prompts Extension
// Using Google Gemini API (free tier: 60 requests/minute)

class AIService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.isEnabled = false;
  }

  // Initialize AI service with API key
  async initialize(apiKey) {
    this.apiKey = apiKey;
    this.isEnabled = !!apiKey;
    
    if (this.isEnabled) {
      console.log('🤖 AI Service initialized with Gemini API');
    } else {
      console.log('⚠️ AI Service disabled - no API key provided');
    }
  }

  // Get AI response for a prompt
  async getResponse(prompt, intelligenceLevel = 'intermediate') {
    if (!this.isEnabled || !this.apiKey) {
      throw new Error('AI Service not initialized. Please add your Gemini API key in settings.');
    }

    try {
      // Enhance prompt based on intelligence level
      const enhancedPrompt = this.enhancePrompt(prompt, intelligenceLevel);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: this.getTemperature(intelligenceLevel),
            maxOutputTokens: this.getMaxTokens(intelligenceLevel),
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Gemini API Response:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }

    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  // Enhance prompt based on intelligence level
  enhancePrompt(prompt, intelligenceLevel) {
    const enhancements = {
      basic: 'Provide a clear, simple explanation suitable for beginners. Keep it concise and easy to understand.',
      intermediate: 'Include technical details and practical insights. Provide actionable advice.',
      advanced: 'Provide deep technical analysis with implementation strategies. Include best practices and advanced concepts.',
      expert: 'Include industry best practices, advanced concepts, and expert-level insights. Consider edge cases and optimization.'
    };

    return `${prompt}\n\n${enhancements[intelligenceLevel] || enhancements.intermediate}`;
  }

  // Get temperature based on intelligence level
  getTemperature(intelligenceLevel) {
    const temperatures = {
      basic: 0.3,      // More focused, consistent
      intermediate: 0.5, // Balanced
      advanced: 0.7,   // More creative
      expert: 0.8      // Most creative
    };
    return temperatures[intelligenceLevel] || 0.5;
  }

  // Get max tokens based on intelligence level
  getMaxTokens(intelligenceLevel) {
    const tokens = {
      basic: 300,      // Shorter responses
      intermediate: 500, // Medium responses
      advanced: 800,   // Longer, detailed responses
      expert: 1000     // Comprehensive responses
    };
    return tokens[intelligenceLevel] || 500;
  }

  // Test API connection
  async testConnection() {
    if (!this.isEnabled) {
      return { success: false, error: 'AI Service not enabled' };
    }

    try {
      const response = await this.getResponse('Hello! Please respond with "AI Service is working correctly."', 'basic');
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get usage statistics (if available)
  async getUsageStats() {
    // Note: Gemini API doesn't provide usage stats in the free tier
    // This is a placeholder for future implementation
    return {
      requestsToday: 'N/A',
      requestsThisMonth: 'N/A',
      remainingRequests: '60/minute (free tier)'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIService;
} else {
  window.AIService = AIService;
} 