// Nitro Prompts Debug Script
// Run this in the browser console to diagnose issues

console.log('🔍 === NITRO PROMPTS DEBUG SCRIPT ===');

// Function to check if extension is loaded
function checkExtensionLoaded() {
  console.log('🔍 Check 1: Extension Loading');
  
  // Check if content script is loaded
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('✅ Chrome extension API available');
    
    // Check if our content script is running
    if (window.nitroPromptsModule) {
      console.log('✅ Nitro Prompts module found in window');
      return true;
    } else {
      console.log('❌ Nitro Prompts module not found in window');
      return false;
    }
  } else {
    console.log('❌ Chrome extension API not available');
    return false;
  }
}

// Function to check module visibility
function checkModuleVisibility() {
  console.log('🔍 Check 2: Module Visibility');
  
  const module = document.getElementById('nitro-prompts-module');
  if (module) {
    console.log('✅ Module element found in DOM');
    console.log('📊 Module display style:', module.style.display);
    console.log('📊 Module visibility:', module.style.visibility);
    console.log('📊 Module opacity:', module.style.opacity);
    console.log('📊 Module position:', module.style.position);
    console.log('📊 Module z-index:', module.style.zIndex);
    console.log('📊 Module classes:', module.className);
    
    const rect = module.getBoundingClientRect();
    console.log('📊 Module position (rect):', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    });
    
    // Check if module is actually visible
    const isActuallyVisible = rect.width > 0 && rect.height > 0 && 
                             module.style.display !== 'none' && 
                             module.style.visibility !== 'hidden' &&
                             parseFloat(module.style.opacity) > 0;
    
    console.log('📊 Module actually visible:', isActuallyVisible);
    
    return true;
  } else {
    console.log('❌ Module element not found in DOM');
    return false;
  }
}

// Function to force create module
function forceCreateModule() {
  console.log('🔧 Force creating module...');
  
  // Remove existing module if any
  const existingModule = document.getElementById('nitro-prompts-module');
  if (existingModule) {
    existingModule.remove();
    console.log('🗑️ Removed existing module');
  }
  
  // Create new module
  const module = document.createElement('div');
  module.id = 'nitro-prompts-module';
  module.className = 'nitro-prompts-module size-medium';
  module.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 300px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: block;
    opacity: 0.8;
  `;
  
  module.innerHTML = `
    <div style="padding: 12px; background: #f8f9fa; border-bottom: 1px solid #eee; border-radius: 8px 8px 0 0;">
      <strong>🚀 Nitro Prompts</strong>
    </div>
    <div style="padding: 12px;">
      <p>Module created successfully!</p>
      <p>If you can see this, the module is working.</p>
    </div>
  `;
  
  document.body.appendChild(module);
  console.log('✅ Module force created and added to DOM');
  
  return module;
}

// Function to force create and show module
function forceCreateAndShowModule() {
  console.log('🔧 Force creating and showing module...');
  
  // Remove existing module if any
  const existingModule = document.getElementById('nitro-prompts-module');
  if (existingModule) {
    existingModule.remove();
    console.log('🗑️ Removed existing module');
  }
  
  // Create new module with forced visibility
  const module = document.createElement('div');
  module.id = 'nitro-prompts-module';
  module.className = 'nitro-prompts-module size-medium show';
  module.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    left: 20px !important;
    width: 320px !important;
    height: 400px !important;
    background: white !important;
    border: 2px solid #667eea !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    z-index: 10000 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  `;
  
  module.innerHTML = `
    <div style="padding: 12px; background: #667eea; color: white; border-radius: 8px 8px 0 0; font-weight: bold;">
      🚀 Nitro Prompts - FORCE CREATED
    </div>
    <div style="padding: 12px;">
      <p><strong>Module force created successfully!</strong></p>
      <p>If you can see this, the module system is working.</p>
      <p>This means the issue is with the normal initialization process.</p>
      <hr style="margin: 10px 0;">
      <p><strong>Next steps:</strong></p>
      <ul>
        <li>Check the extension popup toggle</li>
        <li>Try the "Fix Toggle" button</li>
        <li>Refresh the page to test normal initialization</li>
      </ul>
    </div>
  `;
  
  document.body.appendChild(module);
  console.log('✅ Module force created and added to DOM with forced visibility');
  
  return module;
}

// Function to force create module with tabs
function forceCreateModuleWithTabs() {
  console.log('🔧 Force creating module with tabs...');
  
  // Remove existing module if any
  const existingModule = document.getElementById('nitro-prompts-module');
  if (existingModule) {
    existingModule.remove();
    console.log('🗑️ Removed existing module');
  }
  
  // Create new module with tabs
  const module = document.createElement('div');
  module.id = 'nitro-prompts-module';
  module.className = 'nitro-prompts-module size-medium show';
  module.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    left: 20px !important;
    width: 320px !important;
    height: 400px !important;
    background: white !important;
    border: 2px solid #667eea !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    z-index: 10000 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  `;
  
  module.innerHTML = `
    <div class="module-header">
      <div class="module-title">🚀 Nitro Prompts</div>
      <div class="module-controls">
        <button class="control-btn minimize-btn" title="Minimize">−</button>
        <button class="control-btn close-btn" title="Close">×</button>
      </div>
    </div>
    <div class="module-content">
      <div class="tab-navigation">
        <button class="tab-btn active" data-tab="prompts">💬 Prompts</button>
        <button class="tab-btn" data-tab="summary">📝 AI Summary</button>
      </div>
      
      <div class="tab-content">
        <!-- Prompts Tab -->
        <div class="tab-pane active" id="prompts-tab">
          <div class="prompt-section">
            <div class="prompt-header">
              <span class="prompt-label">Context-Aware Prompt:</span>
              <button class="refresh-btn" title="Refresh">🔄</button>
            </div>
            <div class="prompt-text" id="promptText">
              Test prompt content...
            </div>
          </div>
          <div class="context-details">
            <div class="context-item">
              <span class="context-label">Type:</span>
              <span class="context-value" id="contextType">Test</span>
            </div>
          </div>
          <div class="actions-section">
            <button class="action-btn copy-btn">📋 Copy</button>
            <button class="action-btn customize-btn">⚙️ Customize</button>
          </div>
        </div>
        
        <!-- AI Summary Tab -->
        <div class="tab-pane" id="summary-tab">
          <div class="summary-section">
            <div class="summary-header">
              <span class="summary-label">AI Summary:</span>
              <button class="refresh-btn summary-refresh-btn" title="Refresh Summary">🔄</button>
            </div>
            <div class="summary-text" id="summaryText">
              Test summary content...
            </div>
          </div>
          <div class="summary-details">
            <div class="summary-item">
              <span class="summary-label">Length:</span>
              <span class="summary-value" id="summaryLength">-</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Focus:</span>
              <span class="summary-value" id="summaryFocus">-</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Generated:</span>
              <span class="summary-value" id="summaryGenerated">-</span>
            </div>
          </div>
          <div class="actions-section">
            <button class="action-btn copy-summary-btn">📋 Copy</button>
            <button class="action-btn regenerate-btn">🔄 Regenerate</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(module);
  console.log('✅ Module with tabs force created and added to DOM');
  
  // Add tab functionality
  const tabButtons = module.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      console.log('🔄 Switching to tab:', targetTab);
      
      // Remove active class from all tabs and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      module.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding pane
      button.classList.add('active');
      const targetPane = module.querySelector(`#${targetTab}-tab`);
      if (targetPane) {
        targetPane.classList.add('active');
        console.log('✅ Tab switched to:', targetTab);
      } else {
        console.error('❌ Target pane not found:', targetTab);
      }
    });
  });
  
  return module;
}

// Function to check settings
async function checkSettings() {
  console.log('🔍 Check 3: Settings');
  
  try {
    const result = await chrome.storage.sync.get('nitroPromptsSettings');
    const settings = result.nitroPromptsSettings;
    
    if (settings) {
      console.log('✅ Settings found:', settings);
      console.log('📊 Enabled state:', settings.enabled);
      console.log('📊 Transparency:', settings.transparency);
      console.log('📊 Module size:', settings.moduleSize);
      console.log('📊 Position:', settings.position);
    } else {
      console.log('❌ No settings found in storage');
    }
    
    return settings;
  } catch (error) {
    console.error('❌ Error checking settings:', error);
    return null;
  }
}

// Function to check if NitroPromptsModule class is running
function checkNitroPromptsModule() {
  console.log('🔍 Check 6: NitroPromptsModule Class');
  
  // Check if the class instance exists
  if (window.nitroPromptsModule) {
    console.log('✅ NitroPromptsModule instance found in window');
    console.log('📊 Module instance:', window.nitroPromptsModule);
    console.log('📊 Is initialized:', window.nitroPromptsModule.isInitialized);
    console.log('📊 Is visible:', window.nitroPromptsModule.isVisible);
    console.log('📊 Module element:', window.nitroPromptsModule.module);
    return true;
  } else {
    console.log('❌ NitroPromptsModule instance not found in window');
    
    // Check if the class is defined
    if (typeof NitroPromptsModule !== 'undefined') {
      console.log('✅ NitroPromptsModule class is defined');
      console.log('💡 Try creating a new instance: new NitroPromptsModule()');
    } else {
      console.log('❌ NitroPromptsModule class is not defined');
    }
    
    return false;
  }
}

// Function to manually initialize the module
function manualInitialize() {
  console.log('🔧 Manually initializing NitroPromptsModule...');
  
  try {
    if (typeof NitroPromptsModule !== 'undefined') {
      const instance = new NitroPromptsModule();
      console.log('✅ Manual initialization successful');
      console.log('📊 Instance:', instance);
      return instance;
    } else {
      console.log('❌ NitroPromptsModule class not available');
      return null;
    }
  } catch (error) {
    console.error('❌ Manual initialization failed:', error);
    return null;
  }
}

// Function to test communication with popup
async function testPopupCommunication() {
  console.log('🔍 Check 4: Popup Communication');
  
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
      
      // Test forceEnable
      try {
        const forceResponse = await chrome.tabs.sendMessage(tab.id, { action: 'forceEnable' });
        console.log('✅ Force enable response:', forceResponse);
      } catch (forceError) {
        console.log('❌ Force enable failed:', forceError.message);
      }
      
    } else {
      console.log('❌ No valid tab found');
    }
  } catch (error) {
    console.error('❌ Tab query error:', error);
  }
}

// Function to check CSS
function checkCSS() {
  console.log('🔍 Check 5: CSS Loading');
  
  // Check if our CSS is loaded
  const styles = Array.from(document.styleSheets);
  const ourCSS = styles.find(sheet => 
    sheet.href && sheet.href.includes('content.css')
  );
  
  if (ourCSS) {
    console.log('✅ Content CSS found');
  } else {
    console.log('❌ Content CSS not found');
  }
  
  // Check for nitro-prompts styles
  const nitroStyles = document.querySelectorAll('[class*="nitro-prompts"]');
  console.log('📊 Elements with nitro-prompts classes:', nitroStyles.length);
}

// Main diagnostic function
async function runFullDiagnostic() {
  console.log('🔍 === RUNNING FULL DIAGNOSTIC ===');
  
  // Check 1: Extension loading
  const extensionLoaded = checkExtensionLoaded();
  
  // Check 2: Module visibility
  const moduleVisible = checkModuleVisibility();
  
  // Check 3: Settings
  const settings = await checkSettings();
  
  // Check 4: Popup communication
  await testPopupCommunication();
  
  // Check 5: CSS
  checkCSS();
  
  // Check 6: NitroPromptsModule class
  const moduleClassExists = checkNitroPromptsModule();
  
  // Summary
  console.log('🔍 === DIAGNOSTIC SUMMARY ===');
  console.log('Extension loaded:', extensionLoaded);
  console.log('Module visible:', moduleVisible);
  console.log('Settings found:', !!settings);
  console.log('Settings enabled:', settings?.enabled);
  console.log('Module class exists:', moduleClassExists);
  
  // Recommendations
  if (!extensionLoaded) {
    console.log('💡 RECOMMENDATION: Extension not loaded. Try refreshing the page.');
  } else if (!moduleClassExists) {
    console.log('💡 RECOMMENDATION: Module class not running. Try manual initialization.');
  } else if (!moduleVisible) {
    console.log('💡 RECOMMENDATION: Module not visible. Try force creating it.');
  } else if (!settings?.enabled) {
    console.log('💡 RECOMMENDATION: Module disabled in settings. Enable it in popup.');
  } else {
    console.log('💡 RECOMMENDATION: Everything looks good. Module should be visible.');
  }
  
  // Quick actions
  console.log('🔧 === QUICK ACTIONS ===');
  console.log('1. Run: nitroPromptsDebug.quickFix() - Enhanced quick fix');
  console.log('2. Run: nitroPromptsDebug.forceCreateAndShowModule() - Force create module');
  console.log('3. Run: nitroPromptsDebug.manualInitialize() - Manual initialization');
  console.log('4. Check extension popup and use "Fix Toggle" button');
}

// Enhanced quick fix function
function quickFix() {
  console.log('🔧 Running enhanced quick fix...');
  
  // Step 1: Force create module
  const module = forceCreateAndShowModule();
  
  // Step 2: Try to initialize the real module
  const instance = manualInitialize();
  
  // Step 3: Force enable if instance exists
  if (instance && instance.showModule) {
    console.log('🔄 Calling showModule on instance...');
    instance.showModule();
  }
  
  // Step 4: Check settings and force enable
  checkSettings().then(settings => {
    if (settings && !settings.enabled) {
      console.log('🔄 Settings show disabled, forcing enable...');
      chrome.storage.sync.set({
        nitroPromptsSettings: { ...settings, enabled: true }
      });
    }
  });
  
  console.log('✅ Enhanced quick fix applied. Module should be visible now.');
}

// Export enhanced functions to global scope
window.nitroPromptsDebug = {
  checkExtensionLoaded,
  checkModuleVisibility,
  checkSettings,
  forceCreateModule,
  forceCreateAndShowModule,
  forceCreateModuleWithTabs,
  testPopupCommunication,
  checkCSS,
  checkNitroPromptsModule,
  manualInitialize,
  runFullDiagnostic,
  quickFix
};

console.log('🔍 Enhanced debug functions available:');
console.log('- nitroPromptsDebug.runFullDiagnostic() - Run complete diagnostic');
console.log('- nitroPromptsDebug.quickFix() - Enhanced quick fix');
console.log('- nitroPromptsDebug.forceCreateAndShowModule() - Force create with visibility');
console.log('- nitroPromptsDebug.manualInitialize() - Manually initialize module');
console.log('- nitroPromptsDebug.checkNitroPromptsModule() - Check module class');

// Auto-run diagnostic
console.log('🔍 Auto-running enhanced diagnostic...');
runFullDiagnostic(); 