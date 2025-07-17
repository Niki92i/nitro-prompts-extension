// Debug script for Nitro Prompts extension
// Add this to the browser console to test the extension

console.log('🔍 Nitro Prompts Debug Script Loaded');

// Function to check extension status
function checkExtensionStatus() {
  console.log('=== Nitro Prompts Extension Status ===');
  
  // Check if module exists
  const module = document.getElementById('nitro-prompts-module');
  console.log('Module exists:', !!module);
  
  if (module) {
    console.log('Module display style:', module.style.display);
    console.log('Module classes:', module.className);
    console.log('Module opacity:', module.style.opacity);
  }
  
  // Check chrome API availability
  console.log('Chrome API available:', typeof chrome !== 'undefined');
  console.log('Chrome runtime available:', typeof chrome !== 'undefined' && !!chrome.runtime);
  
  // Try to get settings
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get('nitroPromptsSettings', (result) => {
      console.log('Current settings:', result.nitroPromptsSettings);
    });
  }
  
  console.log('=====================================');
}

// Function to test toggle
function testToggle() {
  console.log('🔄 Testing toggle...');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({action: 'toggleModule'}, (response) => {
      console.log('Toggle response:', response);
      setTimeout(checkExtensionStatus, 500);
    });
  } else {
    console.log('❌ Chrome API not available');
  }
}

// Function to test settings update
function testSettingsUpdate(enabled) {
  console.log(`⚙️ Testing settings update (enabled: ${enabled})...`);
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: {
        enabled: enabled,
        intelligenceLevel: 'intermediate',
        transparency: 80,
        moduleSize: 'medium',
        position: { x: 20, y: 20 },
        customPrompts: []
      }
    }, (response) => {
      console.log('Settings update response:', response);
      setTimeout(checkExtensionStatus, 500);
    });
  } else {
    console.log('❌ Chrome API not available');
  }
}

// Function to manually show/hide module
function manualToggle() {
  const module = document.getElementById('nitro-prompts-module');
  if (module) {
    if (module.style.display === 'none') {
      module.style.display = 'block';
      module.classList.add('show');
      console.log('✅ Module manually shown');
    } else {
      module.style.display = 'none';
      module.classList.remove('show');
      console.log('✅ Module manually hidden');
    }
  } else {
    console.log('❌ Module not found');
  }
}

// Function to reset module state
function resetModuleState() {
  console.log('🔄 Resetting module state...');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: {
        enabled: false,
        intelligenceLevel: 'intermediate',
        transparency: 80,
        moduleSize: 'medium',
        position: { x: 20, y: 20 },
        customPrompts: []
      }
    }, (response) => {
      console.log('Reset response:', response);
      setTimeout(checkExtensionStatus, 500);
    });
  } else {
    console.log('❌ Chrome API not available');
  }
}

// Function to force sync popup state
function forceSyncPopup() {
  console.log('🔄 Forcing popup state sync...');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({action: 'getModuleState'}, (response) => {
      console.log('Module state:', response);
      if (response && response.success) {
        console.log('Current module visible:', response.visible);
        console.log('To fix popup, set checkbox to:', response.visible);
      }
    });
  } else {
    console.log('❌ Chrome API not available');
  }
}

// Function to test transparency
function testTransparency(value) {
  console.log(`🎨 Testing transparency: ${value}%`);
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: 'updateTransparency',
      transparency: value
    }, (response) => {
      console.log('Transparency update response:', response);
      setTimeout(checkExtensionStatus, 500);
    });
  } else {
    console.log('❌ Chrome API not available');
  }
}

// Function to check current transparency
function checkTransparency() {
  const module = document.getElementById('nitro-prompts-module');
  if (module) {
    const opacity = parseFloat(module.style.opacity);
    const transparency = Math.round(opacity * 100);
    console.log(`🎨 Current transparency: ${transparency}% (opacity: ${opacity})`);
    return transparency;
  } else {
    console.log('❌ Module not found');
    return null;
  }
}

// Function to test API key input
function testApiKeyInput() {
  console.log('🔑 Testing API key input...');
  
  // Try to find the API key input in the popup
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({action: 'getSettings'}, (response) => {
      if (response && response.geminiApiKey) {
        console.log('✅ API key found in settings:', response.geminiApiKey.substring(0, 10) + '...');
      } else {
        console.log('❌ No API key found in settings');
      }
    });
  } else {
    console.log('❌ Chrome API not available');
  }
}

// Function to simulate API key paste
function simulateApiKeyPaste(apiKey) {
  console.log('📋 Simulating API key paste...');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: {
        geminiApiKey: apiKey
      }
    }, (response) => {
      if (response && response.success) {
        console.log('✅ API key saved successfully');
      } else {
        console.log('❌ Failed to save API key');
      }
    });
  } else {
    console.log('❌ Chrome API not available');
  }
}

// Function to test API key input field
function testApiKeyField() {
  console.log('🔑 Testing API key input field...');
  
  // Check if the popup is open and has the API key field
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({action: 'getSettings'}, (response) => {
      if (response && response.geminiApiKey) {
        console.log('✅ API key found in settings:', response.geminiApiKey.substring(0, 10) + '...');
        console.log('📝 API key length:', response.geminiApiKey.length);
      } else {
        console.log('❌ No API key found in settings');
      }
    });
  } else {
    console.log('❌ Chrome API not available');
  }
  
  // Try to find the input field in the current page (if popup is open)
  const apiKeyField = document.getElementById('geminiApiKey');
  if (apiKeyField) {
    console.log('✅ API key field found in DOM');
    console.log('📝 Field type:', apiKeyField.type);
    console.log('📝 Field value length:', apiKeyField.value.length);
    console.log('📝 Field placeholder:', apiKeyField.placeholder);
    console.log('📝 Field is focused:', document.activeElement === apiKeyField);
  } else {
    console.log('❌ API key field not found in DOM');
  }
}

// Function to simulate typing in API key field
function simulateApiKeyTyping(text) {
  console.log('⌨️ Simulating typing in API key field...');
  
  const apiKeyField = document.getElementById('geminiApiKey');
  if (apiKeyField) {
    apiKeyField.focus();
    apiKeyField.value = text;
    apiKeyField.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Simulated typing:', text.substring(0, 10) + '...');
  } else {
    console.log('❌ API key field not found');
  }
}

// Function to test paste functionality
function simulateApiKeyPasteField(text) {
  console.log('📋 Simulating paste in API key field...');
  
  const apiKeyField = document.getElementById('geminiApiKey');
  if (apiKeyField) {
    apiKeyField.focus();
    
    // Create a paste event
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: new DataTransfer()
    });
    
    // Simulate the paste
    apiKeyField.dispatchEvent(pasteEvent);
    
    // Set the value after paste
    setTimeout(() => {
      apiKeyField.value = text;
      apiKeyField.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('✅ Simulated paste:', text.substring(0, 10) + '...');
    }, 10);
  } else {
    console.log('❌ API key field not found');
  }
}

// Function to test clipboard API paste
async function testClipboardPaste() {
  console.log('📋 Testing clipboard API paste...');
  
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      console.log('✅ Clipboard content:', text.substring(0, 20) + '...');
      
      const apiKeyField = document.getElementById('geminiApiKey');
      if (apiKeyField) {
        apiKeyField.value = text;
        apiKeyField.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Pasted via clipboard API');
        return true;
      } else {
        console.log('❌ API key field not found');
        return false;
      }
    } else {
      console.log('❌ Clipboard is empty');
      return false;
    }
  } catch (error) {
    console.error('❌ Clipboard API failed:', error);
    return false;
  }
}

// Function to test all paste methods
async function testAllPasteMethods() {
  console.log('🧪 Testing all paste methods...');
  
  const testKey = 'test-api-key-12345';
  
  // Test 1: Direct value assignment
  console.log('1. Testing direct value assignment...');
  const apiKeyField = document.getElementById('geminiApiKey');
  if (apiKeyField) {
    apiKeyField.value = testKey;
    apiKeyField.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Direct assignment successful');
  }
  
  // Test 2: Simulate paste event
  console.log('2. Testing paste event simulation...');
  simulateApiKeyPasteField(testKey);
  
  // Test 3: Test clipboard API
  console.log('3. Testing clipboard API...');
  await testClipboardPaste();
  
  // Test 4: Test keyboard shortcut
  console.log('4. Testing keyboard shortcut...');
  if (apiKeyField) {
    apiKeyField.focus();
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'v',
      ctrlKey: true,
      bubbles: true
    });
    apiKeyField.dispatchEvent(keyEvent);
  }
  
  console.log('🧪 All paste method tests completed');
}

// Auto-run status check
setTimeout(checkExtensionStatus, 1000);

// Make functions available globally
window.nitroDebug = {
  checkStatus: checkExtensionStatus,
  testToggle: testToggle,
  testSettingsUpdate: testSettingsUpdate,
  manualToggle: manualToggle,
  resetModuleState: resetModuleState,
  forceSyncPopup: forceSyncPopup,
  testTransparency: testTransparency,
  checkTransparency: checkTransparency,
  testApiKeyInput: testApiKeyInput,
  simulateApiKeyPaste: simulateApiKeyPaste,
  testApiKeyField: testApiKeyField,
  simulateApiKeyTyping: simulateApiKeyTyping,
  simulateApiKeyPasteField: simulateApiKeyPasteField,
  testClipboardPaste: testClipboardPaste,
  testAllPasteMethods: testAllPasteMethods
};

console.log('💡 Use nitroDebug.checkStatus() to check extension status');
console.log('💡 Use nitroDebug.testToggle() to test toggle functionality');
console.log('💡 Use nitroDebug.testSettingsUpdate(true/false) to test settings');
console.log('💡 Use nitroDebug.manualToggle() to manually toggle module');
console.log('💡 Use nitroDebug.resetModuleState() to reset module to disabled state');
console.log('💡 Use nitroDebug.forceSyncPopup() to check current module state');
console.log('💡 Use nitroDebug.testTransparency(50) to test transparency (0-100)');
console.log('💡 Use nitroDebug.checkTransparency() to check current transparency');
console.log('💡 Use nitroDebug.testApiKeyInput() to test API key input');
console.log('💡 Use nitroDebug.simulateApiKeyPaste("your-api-key") to set API key');
console.log('💡 Use nitroDebug.testApiKeyField() to test API key field');
console.log('💡 Use nitroDebug.simulateApiKeyTyping("text") to simulate typing');
console.log('💡 Use nitroDebug.simulateApiKeyPasteField("text") to simulate paste');
console.log('💡 Use nitroDebug.testClipboardPaste() to test clipboard API');
console.log('💡 Use nitroDebug.testAllPasteMethods() to test all paste methods'); 

// Debug function to test toggle functionality
function debugToggle() {
  console.log('🔧 === TOGGLE DEBUG START ===');
  
  // Test 1: Check popup state
  console.log('📋 Testing popup state...');
  const enableModule = document.getElementById('enableModule');
  if (enableModule) {
    console.log('✅ Enable module checkbox found');
    console.log('📊 Checkbox checked state:', enableModule.checked);
  } else {
    console.log('❌ Enable module checkbox not found');
  }
  
  // Test 2: Check storage
  console.log('💾 Testing storage...');
  chrome.storage.sync.get('nitroPromptsSettings', (result) => {
    console.log('📊 Storage result:', result);
    const settings = result.nitroPromptsSettings;
    if (settings) {
      console.log('✅ Settings found in storage');
      console.log('📊 Enabled state in storage:', settings.enabled);
    } else {
      console.log('❌ No settings found in storage');
    }
  });
  
  // Test 3: Check content script communication
  console.log('🔄 Testing content script communication...');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.startsWith('http')) {
      console.log('✅ Valid tab found:', tabs[0].url);
      
      // Test getModuleState
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getModuleState' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('❌ Content script communication error:', chrome.runtime.lastError.message);
        } else if (response) {
          console.log('✅ Content script responded');
          console.log('📊 Module state:', response);
        } else {
          console.log('❌ No response from content script');
        }
      });
      
      // Test ping
      chrome.tabs.sendMessage(tabs[0].id, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('❌ Ping failed:', chrome.runtime.lastError.message);
        } else if (response) {
          console.log('✅ Ping successful:', response);
        } else {
          console.log('❌ No ping response');
        }
      });
    } else {
      console.log('❌ No valid tab found');
    }
  });
  
  console.log('🔧 === TOGGLE DEBUG END ===');
}

// Add debug toggle function to global scope
window.debugToggle = debugToggle; 

// Function to force re-enable the module
function forceEnableModule() {
  console.log('🔧 === FORCE ENABLE MODULE ===');
  
  // Step 1: Force update settings to enabled
  console.log('📝 Step 1: Updating settings to enabled...');
  chrome.storage.sync.set({
    nitroPromptsSettings: {
      enabled: true,
      intelligenceLevel: 'intermediate',
      transparency: 80,
      moduleSize: 'medium',
      position: { x: 20, y: 20 },
      customPrompts: [],
      geminiApiKey: ''
    }
  }, () => {
    console.log('✅ Settings updated to enabled');
    
    // Step 2: Send message to content script
    console.log('🔄 Step 2: Sending enable message to content script...');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.startsWith('http')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'showModule' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('❌ Content script error:', chrome.runtime.lastError.message);
          } else if (response) {
            console.log('✅ Content script responded:', response);
          } else {
            console.log('❌ No response from content script');
          }
          
          // Step 3: Verify the change
          setTimeout(() => {
            console.log('🔍 Step 3: Verifying module state...');
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getModuleState' }, (stateResponse) => {
              if (stateResponse && stateResponse.success) {
                console.log('📊 Final module state:', stateResponse);
                if (stateResponse.visible) {
                  console.log('✅ Module successfully enabled!');
                } else {
                  console.log('❌ Module still not visible');
                }
              } else {
                console.log('❌ Could not verify module state');
              }
            });
          }, 500);
        });
      } else {
        console.log('❌ No valid tab found');
      }
    });
  });
}

// Function to completely reset and reinitialize
function resetAndReinitialize() {
  console.log('🔄 === RESET AND REINITIALIZE ===');
  
  // Step 1: Clear all settings
  console.log('🗑️ Step 1: Clearing all settings...');
  chrome.storage.sync.clear(() => {
    console.log('✅ Settings cleared');
    
    // Step 2: Reload the page to reinitialize
    console.log('🔄 Step 2: Reloading page...');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id, () => {
          console.log('✅ Page reloaded');
          
          // Step 3: Wait and then enable
          setTimeout(() => {
            console.log('⏳ Step 3: Waiting for page to load...');
            setTimeout(() => {
              console.log('👁️ Step 4: Enabling module...');
              forceEnableModule();
            }, 2000);
          }, 1000);
        });
      }
    });
  });
}

// Add new functions to global scope
window.forceEnableModule = forceEnableModule;
window.resetAndReinitialize = resetAndReinitialize;

// Add to nitroDebug object
window.nitroDebug.forceEnable = forceEnableModule;
window.nitroDebug.resetAndReinit = resetAndReinitialize;

console.log('💡 Use forceEnableModule() to force enable the module');
console.log('💡 Use resetAndReinitialize() to completely reset and reinitialize');
console.log('💡 Use nitroDebug.forceEnable() to force enable the module');
console.log('💡 Use nitroDebug.resetAndReinit() to completely reset and reinitialize'); 