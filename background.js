// Background service worker for Nitro Prompts extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    const defaultSettings = {
      enabled: false,
      intelligenceLevel: 'intermediate',
      transparency: 80,
      moduleSize: 'medium',
      position: { x: 20, y: 20 },
      customPrompts: []
    };
    
    chrome.storage.sync.set({ nitroPromptsSettings: defaultSettings });
    
    // Open welcome page
    chrome.tabs.create({ url: 'welcome.html' });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'openSettings':
      chrome.tabs.create({ url: 'settings.html' });
      break;
      
    case 'getSettings':
      chrome.storage.sync.get('nitroPromptsSettings', (result) => {
        sendResponse(result.nitroPromptsSettings);
      });
      return true; // Keep message channel open for async response
      
    case 'updateSettings':
      chrome.storage.sync.set({ nitroPromptsSettings: message.settings });
      break;
      
    case 'notifyContentScript':
      // Forward message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, message.data);
        }
      });
      break;
      
    case 'toggleModule':
      // Forward toggle command to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleModule' }, (response) => {
            sendResponse(response);
          });
        } else {
          sendResponse({ success: false, error: 'No active tab' });
        }
      });
      return true; // Keep message channel open for async response
      
    case 'getModuleState':
      // Forward getModuleState command to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getModuleState' }, (response) => {
            sendResponse(response);
          });
        } else {
          sendResponse({ success: false, error: 'No active tab' });
        }
      });
      return true; // Keep message channel open for async response
      
    case 'updateTransparency':
      // Forward transparency update to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'updateTransparency', 
            transparency: message.transparency 
          }, (response) => {
            sendResponse(response);
          });
        } else {
          sendResponse({ success: false, error: 'No active tab' });
        }
      });
      return true; // Keep message channel open for async response
      
    case 'test':
      // Test message for debugging
      sendResponse({ status: 'ok', message: 'Extension is working!' });
      break;

    case 'geminiAI':
      (async () => {
        try {
          const { prompt, intelligenceLevel, apiKey } = message;
          const aiService = new AIService();
          await aiService.initialize(apiKey);
          const response = await aiService.getResponse(prompt, intelligenceLevel);
          sendResponse({ success: true, response });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-module') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleModule' });
      }
    });
  }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Script might already be injected, ignore error
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Toggle the module when extension icon is clicked
  chrome.tabs.sendMessage(tab.id, { action: 'toggleModule' });
}); 

// Gemini AI Service (moved from ai-service.js)
class AIService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.isEnabled = false;
  }

  async initialize(apiKey) {
    this.apiKey = apiKey;
    this.isEnabled = !!apiKey;
  }

  async getResponse(prompt, intelligenceLevel = 'intermediate') {
    if (!this.isEnabled || !this.apiKey) {
      throw new Error('AI Service not initialized. Please add your Gemini API key in settings.');
    }
    
    const enhancedPrompt = this.enhancePrompt(prompt, intelligenceLevel);
    
    try {
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

  enhancePrompt(prompt, intelligenceLevel) {
    const enhancements = {
      basic: 'Provide a clear, simple explanation suitable for beginners. Keep it concise and easy to understand.',
      intermediate: 'Include technical details and practical insights. Provide actionable advice.',
      advanced: 'Provide deep technical analysis with implementation strategies. Include best practices and advanced concepts.',
      expert: 'Include industry best practices, advanced concepts, and expert-level insights. Consider edge cases and optimization.'
    };
    return `${prompt}\n\n${enhancements[intelligenceLevel] || enhancements.intermediate}`;
  }

  getTemperature(intelligenceLevel) {
    const temperatures = { basic: 0.3, intermediate: 0.5, advanced: 0.7, expert: 0.8 };
    return temperatures[intelligenceLevel] || 0.5;
  }

  getMaxTokens(intelligenceLevel) {
    const tokens = { basic: 300, intermediate: 500, advanced: 800, expert: 1000 };
    return tokens[intelligenceLevel] || 500;
  }

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
} 