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
  checkTransparency: checkTransparency
};

console.log('💡 Use nitroDebug.checkStatus() to check extension status');
console.log('💡 Use nitroDebug.testToggle() to test toggle functionality');
console.log('💡 Use nitroDebug.testSettingsUpdate(true/false) to test settings');
console.log('💡 Use nitroDebug.manualToggle() to manually toggle module');
console.log('💡 Use nitroDebug.resetModuleState() to reset module to disabled state');
console.log('💡 Use nitroDebug.forceSyncPopup() to check current module state');
console.log('💡 Use nitroDebug.testTransparency(50) to test transparency (0-100)');
console.log('💡 Use nitroDebug.checkTransparency() to check current transparency'); 