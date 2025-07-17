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