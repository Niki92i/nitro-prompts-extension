// Popup script for Nitro Prompts extension
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const enableToggle = document.getElementById('enableToggle');
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
  const forceEnableBtn = document.getElementById('forceEnableBtn');
  const diagnosticBtn = document.getElementById('diagnosticBtn');
  const fixToggleBtn = document.getElementById('fixToggleBtn');

  // Default settings
  const defaultSettings = {
    enabled: true, // Enabled by default
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
      let settings = result.nitroPromptsSettings;
      
      // Migration logic: Ensure module is enabled by default
      if (!settings) {
        // New installation: use default settings
        settings = { ...defaultSettings };
        console.log('🆕 New installation detected, using default settings');
      } else {
        // Existing installation: migrate if needed
        if (settings.enabled === false) {
          console.log('🔄 Migrating existing settings: enabling module by default');
          settings.enabled = true;
          // Save the migrated settings
          await chrome.storage.sync.set({ nitroPromptsSettings: settings });
        }
        console.log('📋 Existing settings loaded and migrated if needed');
      }
      
      // Update UI with settings
      enableToggle.checked = settings.enabled;
      intelligenceLevel.value = settings.intelligenceLevel;
      transparency.value = settings.transparency;
      transparencyValue.textContent = `${settings.transparency}%`;
      moduleSize.value = settings.moduleSize;
      geminiApiKey.value = settings.geminiApiKey || '';
      
      // Set initial border color for API key field
      geminiApiKey.style.borderColor = settings.geminiApiKey ? '#28a745' : '#ddd';
      
      console.log('📋 Settings loaded and UI updated:', settings);
      return settings;
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      return defaultSettings;
    }
  }

  // Save settings to storage
  async function saveSettings(settings) {
    try {
      console.log('💾 Saving settings:', settings);
      await chrome.storage.sync.set({ nitroPromptsSettings: settings });
      console.log('✅ Settings saved to storage');
      
      // Send message to content script to update module
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        try {
          console.log('🔄 Sending settings update to content script');
          const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: settings
          });
          
          if (response && response.success) {
            console.log('✅ Settings update successful:', response);
          } else {
            console.warn('⚠️ Settings update failed:', response);
          }
        } catch (error) {
          console.log('⚠️ Content script not ready yet, settings will be applied on next page load:', error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      throw error;
    }
  }

  // Event listeners
  enableToggle.addEventListener('change', async function() {
    console.log('🔄 Toggle changed to:', this.checked);
    
    // Force the toggle to the correct state
    const newState = this.checked;
    
    // Update settings immediately
    const settings = await loadSettings();
    settings.enabled = newState;
    
    // Force save with the new state
    await chrome.storage.sync.set({ nitroPromptsSettings: settings });
    console.log('💾 Settings saved with enabled:', newState);
    
    // Force update the UI to reflect the change
    enableToggle.checked = newState;
    
    // Send immediate message to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        if (newState) {
          // Force enable
          console.log('🔄 Sending force enable message...');
          await chrome.tabs.sendMessage(tab.id, { action: 'forceEnable' });
        } else {
          // Force disable
          console.log('🔄 Sending force disable message...');
          await chrome.tabs.sendMessage(tab.id, { action: 'forceDisable' });
        }
      }
    } catch (error) {
      console.log('⚠️ Could not send message to content script:', error.message);
    }
    
    const status = newState ? 'enabled' : 'disabled';
    showNotification(`Prompt module ${status}!`, 'success');
    
    // Force enable the module if toggle is checked
    if (newState) {
      await forceEnableModule();
    }
  });

  // Force enable module function
  async function forceEnableModule() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        console.log('🔄 Force enabling module...');
        
        // Send multiple messages to ensure it works
        const messages = [
          { action: 'forceEnable' },
          { action: 'showModule' },
          { action: 'updateSettings', settings: { enabled: true } }
        ];
        
        for (const message of messages) {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, message);
            console.log('✅ Message sent successfully:', message.action, response);
          } catch (error) {
            console.log('⚠️ Message failed:', message.action, error.message);
          }
        }
        
        console.log('✅ Force enable sequence completed');
      }
    } catch (error) {
      console.log('⚠️ Could not force enable module:', error.message);
    }
  }

  // Add a function to fix toggle state
  async function fixToggleState() {
    console.log('🔧 Fixing toggle state...');
    
    // Get current settings
    const settings = await loadSettings();
    
    // Force enable if settings say it should be enabled
    if (settings.enabled) {
      console.log('🔧 Settings say enabled, forcing enable...');
      enableToggle.checked = true;
      await forceEnableModule();
    } else {
      console.log('🔧 Settings say disabled, ensuring toggle is off...');
      enableToggle.checked = false;
    }
    
    showNotification('Toggle state fixed!', 'success');
  }

  intelligenceLevel.addEventListener('change', async function() {
    const settings = await loadSettings();
    settings.intelligenceLevel = this.value;
    await saveSettings(settings);
    showNotification('Intelligence level updated!', 'success');
  });

  transparency.addEventListener('input', async function() {
    const value = this.value;
    transparencyValue.textContent = `${value}%`;
    
    // Apply transparency change in real-time without saving to storage
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        console.log('🔄 Applying transparency change in real-time:', value + '%');
        
        // Send the transparency update with timeout
        const response = await Promise.race([
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateTransparency',
            transparency: parseInt(value)
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]);
        
        if (response && response.success) {
          console.log('✅ Transparency updated successfully:', response.transparency + '%');
        } else {
          console.warn('⚠️ Transparency update failed:', response);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not apply transparency in real-time:', error.message);
    }
  });

  // Add change event for when user finishes adjusting
  transparency.addEventListener('change', async function() {
    const value = this.value;
    console.log('💾 Saving transparency setting:', value + '%');
    
    // Update settings and save to storage
    const settings = await loadSettings();
    settings.transparency = parseInt(value);
    await saveSettings(settings);
    
    showNotification(`Transparency set to ${value}%`, 'success');
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
      // Test AI connection by sending message to background Gemini proxy
      const response = await chrome.runtime.sendMessage({
        action: 'geminiAI',
        prompt: 'Hello! Please respond with "AI Service is working correctly."',
        intelligenceLevel: 'basic',
        apiKey: settings.geminiApiKey
      });
      if (response && response.success) {
        aiStatus.textContent = '✅ AI connection successful!';
        aiStatus.className = 'status-indicator success';
      } else {
        aiStatus.textContent = '❌ AI connection failed: ' + (response?.error || 'Unknown error');
        aiStatus.className = 'status-indicator error';
      }
    } catch (error) {
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

  // Debug button event listeners
  forceEnableBtn.addEventListener('click', async function() {
    await forceEnable();
  });

  diagnosticBtn.addEventListener('click', async function() {
    await runDiagnostic();
  });

  fixToggleBtn.addEventListener('click', async function() {
    await fixToggleState();
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
  loadSettings().then(() => {
    console.log('✅ Popup initialized with settings');
  });
  
  // Add diagnostic function
  window.runDiagnostic = async function() {
    console.log('🔍 === NITRO PROMPTS DIAGNOSTIC ===');
    
    // Check 1: Storage
    console.log('💾 Check 1: Storage');
    try {
      const result = await chrome.storage.sync.get('nitroPromptsSettings');
      console.log('📊 Storage result:', result);
      const settings = result.nitroPromptsSettings;
      if (settings) {
        console.log('✅ Settings found in storage');
        console.log('📊 Enabled state in storage:', settings.enabled);
        console.log('📊 API key in storage:', settings.geminiApiKey ? 'Present (' + settings.geminiApiKey.length + ' chars)' : 'Not found');
        console.log('📊 Full settings:', settings);
      } else {
        console.log('❌ No settings found in storage');
      }
    } catch (error) {
      console.error('❌ Storage error:', error);
    }
    
    // Check 2: Content Script Communication
    console.log('🔄 Check 2: Content Script Communication');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith('http')) {
        console.log('✅ Valid tab found:', tab.url);
        
        // Test ping
        try {
          const pingResponse = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
          console.log('✅ Ping successful:', pingResponse);
        } catch (pingError) {
          console.log('❌ Ping failed:', pingError.message);
        }
        
        // Test getModuleState
        try {
          const stateResponse = await chrome.tabs.sendMessage(tab.id, { action: 'getModuleState' });
          console.log('✅ Module state response:', stateResponse);
        } catch (stateError) {
          console.log('❌ Get module state failed:', stateError.message);
        }
        
        // Test AI service state
        try {
          const aiStateResponse = await chrome.tabs.sendMessage(tab.id, { action: 'getAIState' });
          console.log('✅ AI state response:', aiStateResponse);
        } catch (aiStateError) {
          console.log('❌ Get AI state failed:', aiStateError.message);
        }
      } else {
        console.log('❌ No valid tab found');
      }
    } catch (error) {
      console.error('❌ Tab query error:', error);
    }
    
    // Check 3: Extension Permissions
    console.log('🔐 Check 3: Extension Permissions');
    try {
      const permissions = await chrome.permissions.getAll();
      console.log('📊 Current permissions:', permissions);
    } catch (error) {
      console.log('❌ Could not check permissions:', error.message);
    }
    
    // Check 4: API Key Input
    console.log('🔑 Check 4: API Key Input');
    const apiKeyInput = document.getElementById('geminiApiKey');
    if (apiKeyInput) {
      console.log('✅ API key input found');
      console.log('📊 Current value length:', apiKeyInput.value.length);
      console.log('📊 Value starts with:', apiKeyInput.value.substring(0, 10) + '...');
    } else {
      console.log('❌ API key input not found');
    }
    
    console.log('🔍 === DIAGNOSTIC COMPLETE ===');
  };

  // Add force enable function for debugging
  window.forceEnable = async function() {
    console.log('🔄 Force enabling module via debug function...');
    await forceEnableModule();
    
    // Also update settings
    const settings = await loadSettings();
    settings.enabled = true;
    await saveSettings(settings);
    enableToggle.checked = true;
    
    showNotification('Module force enabled!', 'success');
  };

  // Add fix toggle function for debugging
  window.fixToggle = async function() {
    await fixToggleState();
  };
  
  console.log('💡 Use runDiagnostic() to diagnose extension issues');
  console.log('💡 Use forceEnable() to force enable the module');
  console.log('💡 Use fixToggle() to fix toggle state');
}); 