// Popup script for Nitro Prompts extension
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const enableModule = document.getElementById('enableModule');
  const intelligenceLevel = document.getElementById('intelligenceLevel');
  const transparency = document.getElementById('transparency');
  const transparencyValue = document.getElementById('transparencyValue');
  const moduleSize = document.getElementById('moduleSize');
  const geminiApiKey = document.getElementById('geminiApiKey');
  const testAI = document.getElementById('testAI');
  const aiStatus = document.getElementById('aiStatus');
  const clearApiKey = document.getElementById('clearApiKey');
  const openSettings = document.getElementById('openSettings');
  const resetSettings = document.getElementById('resetSettings');

  // Default settings
  const defaultSettings = {
    enabled: false,
    intelligenceLevel: 'intermediate',
    transparency: 80,
    moduleSize: 'medium',
    position: { x: 20, y: 20 },
    customPrompts: [],
    geminiApiKey: ''
  };

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get('nitroPromptsSettings');
      const settings = result.nitroPromptsSettings || defaultSettings;
      
      // Get the current module state from the active tab
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.startsWith('http')) {
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'getModuleState' });
          if (response && response.success) {
            // Sync the checkbox with the actual module state
            settings.enabled = response.visible;
            console.log('Synced with actual module state:', response.visible);
          }
        }
      } catch (error) {
        console.log('Could not sync with content script, using stored settings');
      }
      
      enableModule.checked = settings.enabled;
      intelligenceLevel.value = settings.intelligenceLevel;
      transparency.value = settings.transparency;
      transparencyValue.textContent = `${settings.transparency}%`;
      moduleSize.value = settings.moduleSize;
      geminiApiKey.value = settings.geminiApiKey || '';
      
      // Set initial border color for API key field
      geminiApiKey.style.borderColor = settings.geminiApiKey ? '#28a745' : '#ddd';
      
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  }

  // Save settings to storage
  async function saveSettings(settings) {
    try {
      await chrome.storage.sync.set({ nitroPromptsSettings: settings });
      
      // Send message to content script to update module
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: settings
          });
        } catch (error) {
          console.log('Content script not ready yet, settings will be applied on next page load');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Toggle module visibility
  async function toggleModule(show) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: show ? 'showModule' : 'hideModule'
          });
        } catch (error) {
          console.log('Content script not ready, module will be toggled on next page load');
        }
      }
    } catch (error) {
      console.error('Error toggling module:', error);
    }
  }

  // Event listeners
  enableModule.addEventListener('change', async function() {
    console.log('Toggle clicked, checked state:', this.checked);
    
    // Load current settings
    const settings = await loadSettings();
    console.log('Current settings:', settings);
    
    // Update the enabled state based on the checkbox
    settings.enabled = this.checked;
    console.log('Updated settings:', settings);
    
    // Save the updated settings
    await saveSettings(settings);
    
    // Toggle module visibility based on the new state
    await toggleModule(this.checked);
    
    // Show feedback to user
    const status = this.checked ? 'enabled' : 'disabled';
    console.log('Showing notification:', status);
    showNotification(`Prompt module ${status}!`, 'success');
    
    // Verify the change was applied
    setTimeout(async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.startsWith('http')) {
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'getModuleState' });
          if (response && response.success) {
            console.log('Module state after toggle:', response.visible, 'Expected:', this.checked);
            if (response.visible !== this.checked) {
              console.warn('Module state mismatch detected!');
            }
          }
        }
      } catch (error) {
        console.log('Could not verify module state');
      }
    }, 100);
  });

  intelligenceLevel.addEventListener('change', async function() {
    const settings = await loadSettings();
    settings.intelligenceLevel = this.value;
    await saveSettings(settings);
    showNotification('Intelligence level updated!', 'success');
  });

  transparency.addEventListener('input', async function() {
    const value = this.value;
    transparencyValue.textContent = `${value}%`;
    
    // Update settings immediately
    const settings = await loadSettings();
    settings.transparency = parseInt(value);
    
    // Apply transparency change in real-time
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateTransparency',
          transparency: parseInt(value)
        });
      }
    } catch (error) {
      console.log('Could not apply transparency in real-time');
    }
    
    // Save settings
    await saveSettings(settings);
  });

  // Add change event for when user finishes adjusting
  transparency.addEventListener('change', async function() {
    showNotification(`Transparency set to ${this.value}%`, 'success');
  });

  moduleSize.addEventListener('change', async function() {
    const settings = await loadSettings();
    settings.moduleSize = this.value;
    await saveSettings(settings);
    showNotification('Module size updated!', 'success');
  });

  geminiApiKey.addEventListener('input', async function() {
    // Just update the visual feedback, don't save yet
    this.style.borderColor = this.value.trim() ? '#28a745' : '#ddd';
    console.log('Textarea input, value length:', this.value.length);
  });

  // Save API key button
  const saveApiKey = document.getElementById('saveApiKey');
  saveApiKey.addEventListener('click', async function() {
    const apiKey = geminiApiKey.value.trim();
    if (apiKey) {
      const settings = await loadSettings();
      settings.geminiApiKey = apiKey;
      await saveSettings(settings);
      
      geminiApiKey.style.borderColor = '#28a745';
      showNotification('API key saved successfully!', 'success');
      console.log('API key saved via save button');
    } else {
      showNotification('Please enter an API key first', 'error');
    }
  });

  // Test API key field button
  const testApiKey = document.getElementById('testApiKey');
  testApiKey.addEventListener('click', function() {
    const testKey = 'test-api-key-' + Date.now();
    geminiApiKey.value = testKey;
    geminiApiKey.style.borderColor = '#28a745';
    showNotification('Test key set! Click "Save Key" to save it.', 'success');
    console.log('Test key set in textarea');
  });

  // Clear API key button
  clearApiKey.addEventListener('click', async function() {
    geminiApiKey.value = '';
    geminiApiKey.style.borderColor = '#ddd';
    const settings = await loadSettings();
    settings.geminiApiKey = '';
    await saveSettings(settings);
    showNotification('API key cleared!', 'success');
  });

  // Focus event for textarea
  geminiApiKey.addEventListener('focus', function() {
    this.style.borderColor = '#667eea';
    this.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.3)';
    console.log('Textarea focused');
  });

  // Blur event for textarea
  geminiApiKey.addEventListener('blur', function() {
    this.style.boxShadow = 'none';
    this.style.borderColor = this.value.trim() ? '#28a745' : '#ddd';
    console.log('Textarea blurred, value length:', this.value.length);
  });

  // Add right-click context menu paste handler
  geminiApiKey.addEventListener('contextmenu', function(e) {
    // Don't prevent default - let the context menu show
    console.log('Right-click on API key field');
  });

  testAI.addEventListener('click', async function() {
    const settings = await loadSettings();
    if (!settings.geminiApiKey) {
      aiStatus.textContent = '❌ No API key provided';
      aiStatus.className = 'status-indicator error';
      return;
    }

    aiStatus.textContent = '🔄 Testing connection...';
    aiStatus.className = 'status-indicator loading';

    try {
      // Test AI connection by sending message to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        console.log('🔄 Sending testAI message to tab:', tab.id);
        
        // First, test basic communication with a ping
        try {
          console.log('🏓 Testing basic communication...');
          const pingResponse = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
          console.log('🏓 Ping response:', pingResponse);
        } catch (pingError) {
          console.error('🏓 Ping failed:', pingError);
          aiStatus.textContent = '❌ Content script not responding. Please refresh the page.';
          aiStatus.className = 'status-indicator error';
          return;
        }
        
        // Add timeout to the message sending
        const response = await Promise.race([
          chrome.tabs.sendMessage(tab.id, {
            action: 'testAI',
            apiKey: settings.geminiApiKey
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Content script did not respond')), 10000)
          )
        ]);
        
        console.log('TestAI response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');
        
        if (response && response.success) {
          aiStatus.textContent = '✅ AI connection successful!';
          aiStatus.className = 'status-indicator success';
        } else {
          // Handle different types of error responses
          let errorMessage = 'Unknown error';
          if (response && response.error) {
            errorMessage = response.error;
          } else if (response && response.message) {
            errorMessage = response.message;
          } else if (typeof response === 'string') {
            errorMessage = response;
          } else if (!response) {
            errorMessage = 'No response from content script';
          }
          
          aiStatus.textContent = '❌ AI connection failed: ' + errorMessage;
          aiStatus.className = 'status-indicator error';
        }
      } else {
        aiStatus.textContent = '❌ No active tab found';
        aiStatus.className = 'status-indicator error';
      }
    } catch (error) {
      console.error('Test AI error:', error);
      aiStatus.textContent = '❌ Test failed: ' + (error.message || 'Unknown error');
      aiStatus.className = 'status-indicator error';
    }
  });

  openSettings.addEventListener('click', function() {
    chrome.tabs.create({ url: 'settings.html' });
  });

  resetSettings.addEventListener('click', async function() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      await saveSettings(defaultSettings);
      await loadSettings();
      
      // Notify content script
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.startsWith('http')) {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'resetSettings'
          });
        }
      } catch (error) {
        console.log('Content script not ready');
      }
      
      showNotification('Settings reset to default!', 'success');
    }
  });

  // Show notification function
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: ${type === 'success' ? '#28a745' : '#667eea'};
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  // Initialize popup
  loadSettings();
}); 