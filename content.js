// Content script for Nitro Prompts extension
class NitroPromptsModule {
  constructor() {
    this.module = null;
    this.settings = null;
    this.isVisible = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.aiService = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing Nitro Prompts Module...');
      
      // Load settings first
      await this.loadSettings();
      console.log('📋 Settings loaded:', this.settings);
      console.log('📊 Enabled state in settings:', this.settings.enabled);
      
      // Initialize AI service
      await this.initAIService();
      
      // Create and inject module
      this.createModule();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Force set initial visibility based on settings
      this.forceSetVisibility();
      
      this.isInitialized = true;
      console.log('✅ Module initialization complete. Module enabled:', this.settings.enabled);
      console.log('✅ Module visible:', this.isVisible);
      
    } catch (error) {
      console.error('❌ Error during initialization:', error);
      // Even if there's an error, try to show the module if enabled
      if (this.settings && this.settings.enabled) {
        console.log('🔄 Attempting to show module despite initialization error...');
        this.forceSetVisibility();
      }
    }
  }

  forceSetVisibility() {
    console.log('🔧 Force setting visibility...');
    console.log('📊 Settings enabled:', this.settings.enabled);
    console.log('📊 Module exists:', !!this.module);
    
    if (!this.module) {
      console.warn('⚠️ Module not created yet, creating it now...');
      this.createModule();
    }
    
    if (this.settings.enabled) {
      console.log('👁️ Forcing module to visible state...');
      this.module.style.display = 'block';
      this.module.style.visibility = 'visible';
      this.module.style.opacity = this.settings.transparency / 100;
      this.module.classList.add('show');
      this.isVisible = true;
      
      // Double-check the module is actually visible
      setTimeout(() => {
        const rect = this.module.getBoundingClientRect();
        console.log('📊 Module visibility check:', {
          display: this.module.style.display,
          visibility: this.module.style.visibility,
          opacity: this.module.style.opacity,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        });
        
        if (rect.width === 0 || rect.height === 0) {
          console.warn('⚠️ Module has zero dimensions, forcing size...');
          this.module.style.width = '320px';
          this.module.style.height = '400px';
        }
      }, 100);
      
      console.log('✅ Module forced to visible');
    } else {
      console.log('🙈 Forcing module to hidden state...');
      this.module.style.display = 'none';
      this.module.classList.remove('show');
      this.isVisible = false;
      console.log('✅ Module forced to hidden');
    }
  }

  setInitialVisibility() {
    console.log('🔧 Setting initial visibility...');
    this.forceSetVisibility();
  }

  async initAIService() {
    // Load AI service script
    console.log('🔄 Loading AI Service script...');
    await this.loadScript('ai-service.js');
    console.log('✅ AI Service script loaded successfully');
    
    // Initialize AI service with API key from settings
    console.log('🔄 Creating AI Service instance...');
    this.aiService = new AIService();
    console.log('✅ AI Service instance created');
    
    if (this.settings.geminiApiKey) {
      console.log('🔄 Initializing AI Service with API key...');
      await this.aiService.initialize(this.settings.geminiApiKey);
      console.log('✅ AI Service initialized with API key');
    } else {
      console.log('⚠️ No API key found in settings');
    }
  }

  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(src);
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get('nitroPromptsSettings');
      const existingSettings = result.nitroPromptsSettings;
      
      if (existingSettings) {
        // Migration: If settings exist but enabled is explicitly false, update to true
        if (existingSettings.enabled === false) {
          console.log('🔄 Migrating existing settings: enabling module by default');
          existingSettings.enabled = true;
          await chrome.storage.sync.set({ nitroPromptsSettings: existingSettings });
        }
        this.settings = existingSettings;
      } else {
        // New installation: use default settings
        this.settings = {
          enabled: true, // Enabled by default
          intelligenceLevel: 'intermediate',
          transparency: 80,
          moduleSize: 'medium',
          position: { x: 20, y: 20 },
          customPrompts: [],
          geminiApiKey: '' // Added for Gemini API key
        };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = {
        enabled: true, // Enabled by default
        intelligenceLevel: 'intermediate',
        transparency: 80,
        moduleSize: 'medium',
        position: { x: 20, y: 20 },
        customPrompts: [],
        geminiApiKey: ''
      };
    }
  }

  createModule() {
    // Check if module already exists
    if (document.getElementById('nitro-prompts-module')) {
      this.module = document.getElementById('nitro-prompts-module');
      console.log('🔄 Found existing module, reusing it');
      return;
    }

    console.log('🏗️ Creating new module...');

    // Create module container
    this.module = document.createElement('div');
    this.module.id = 'nitro-prompts-module';
    this.module.className = `nitro-prompts-module size-${this.settings.moduleSize}`;
    
    // Set initial position
    this.module.style.left = `${this.settings.position.x}px`;
    this.module.style.top = `${this.settings.position.y}px`;
    
    // Set initial visibility state
    if (this.settings.enabled) {
      this.module.style.display = 'block';
      this.module.classList.add('show');
      this.isVisible = true;
    } else {
      this.module.style.display = 'none';
      this.module.classList.remove('show');
      this.isVisible = false;
    }
    
    // Apply transparency
    const opacity = this.settings.transparency / 100;
    this.module.style.opacity = opacity;
    
    // Create module content
    this.module.innerHTML = `
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
                Analyzing page content...
              </div>
            </div>
            <div class="context-details">
              <div class="context-item">
                <span class="context-label">Type:</span>
                <span class="context-value" id="contextType">Analyzing...</span>
              </div>
              <div class="context-item">
                <span class="context-label">Category:</span>
                <span class="context-value" id="contextCategory">Analyzing...</span>
              </div>
              <div class="context-item">
                <span class="context-label">Intelligence:</span>
                <span class="context-value" id="contextIntelligence">Analyzing...</span>
              </div>
            </div>
            <div class="actions-section">
              <button class="action-btn copy-btn">📋 Copy</button>
              <button class="action-btn customize-btn">⚙️ Customize</button>
            </div>
            <div class="context-info">
              <small>Based on: <span id="contextInfo">Current page</span></small>
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
                Click refresh to generate AI summary...
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
            <div class="context-info">
              <small>AI-powered summary of: <span id="summaryContextInfo">Current page</span></small>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Append to body
    document.body.appendChild(this.module);
    console.log('📦 Module appended to DOM');
    
    // Set up module event listeners
    this.setupModuleEventListeners();
    
    // Generate initial prompt if visible
    if (this.isVisible) {
      this.generatePrompt();
    }
  }

  setupEventListeners() {
    // Keyboard shortcut (Ctrl+Shift+P)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.toggleModule();
      }
    });

    // Listen for storage changes (fallback for real-time updates)
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.nitroPromptsSettings) {
        const newSettings = changes.nitroPromptsSettings.newValue;
        const oldSettings = changes.nitroPromptsSettings.oldValue;
        
        if (newSettings && oldSettings) {
          // Only handle enabled state changes from storage
          // Transparency is handled via real-time messages to avoid conflicts
          if (newSettings.enabled !== oldSettings.enabled) {
            console.log('🔄 Storage change detected: enabled changed from', oldSettings.enabled, 'to', newSettings.enabled);
            this.settings.enabled = newSettings.enabled;
            if (newSettings.enabled) {
              this.showModule();
            } else {
              this.hideModule();
            }
          }
        }
      }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Content script received message:', message);
      console.log('📨 Message action:', message.action);
      
      switch (message.action) {
        case 'showModule':
          console.log('👁️ Show module requested');
          this.showModule();
          sendResponse({ success: true, action: 'showModule', visible: this.isVisible });
          break;
        case 'hideModule':
          console.log('🙈 Hide module requested');
          this.hideModule();
          sendResponse({ success: true, action: 'hideModule', visible: this.isVisible });
          break;
        case 'toggleModule':
          console.log('🔄 Toggle module requested');
          this.toggleModule();
          sendResponse({ success: true, action: 'toggleModule', visible: this.isVisible });
          break;
        case 'updateSettings':
          console.log('⚙️ Update settings requested:', message.settings);
          this.settings = message.settings;
          this.applySettings();
          
          // Show/hide module based on new settings
          if (this.settings.enabled) {
            console.log('👁️ Settings enabled, showing module');
            this.showModule();
          } else {
            console.log('🙈 Settings disabled, hiding module');
            this.hideModule();
          }
          sendResponse({ success: true, action: 'updateSettings', visible: this.isVisible });
          break;
        case 'resetSettings':
          console.log('🔄 Reset settings requested');
          this.loadSettings().then(() => {
            this.applySettings();
            this.setInitialVisibility();
            sendResponse({ success: true, action: 'resetSettings', visible: this.isVisible });
          });
          return true; // Keep message channel open for async response
        case 'test':
          console.log('✅ Basic test case triggered');
          sendResponse({ success: true, message: 'Content script is working!', moduleVisible: this.isVisible });
          break;
        case 'ping':
          console.log('🏓 Ping received, sending pong');
          sendResponse({ success: true, message: 'pong', timestamp: Date.now() });
          break;
        case 'getModuleState':
          console.log('📊 Get module state requested');
          const state = {
            success: true, 
            visible: this.isVisible, 
            moduleExists: !!this.module,
            enabled: this.settings?.enabled || false,
            initialized: this.isInitialized
          };
          console.log('📊 Module state:', state);
          sendResponse(state);
          break;
        case 'forceEnable':
          console.log('🔄 Force enable requested');
          this.settings.enabled = true;
          this.showModule();
          // Save the updated settings
          chrome.storage.sync.set({ nitroPromptsSettings: this.settings });
          sendResponse({ success: true, action: 'forceEnable', visible: this.isVisible });
          break;
        case 'forceDisable':
          console.log('🔄 Force disable requested');
          this.settings.enabled = false;
          this.hideModule();
          // Save the updated settings
          chrome.storage.sync.set({ nitroPromptsSettings: this.settings });
          sendResponse({ success: true, action: 'forceDisable', visible: this.isVisible });
          break;
        case 'testAI':
          console.log('🧪 TestAI case triggered');
          (async () => {
            try {
              console.log('🧪 Starting AI test...');
              if (!this.aiService) {
                console.log('🧪 AI Service not found, initializing...');
                await this.initAIService();
              }
              console.log('🧪 Initializing AI Service with provided API key...');
              await this.aiService.initialize(message.apiKey);
              console.log('🧪 Testing AI connection...');
              const testResult = await this.aiService.testConnection();
              console.log('🧪 Test result:', testResult);
              
              // Ensure we return a proper response object
              if (testResult && typeof testResult === 'object') {
                console.log('🧪 Sending successful test result');
                sendResponse(testResult);
              } else {
                console.log('🧪 Invalid test result format, sending error');
                sendResponse({ success: false, error: 'Invalid test result format' });
              }
            } catch (error) {
              console.error('🧪 TestAI error:', error);
              sendResponse({ 
                success: false, 
                error: error.message || 'Unknown error occurred during AI test' 
              });
            }
          })();
          return true; // Keep message channel open for async response
          break;
        case 'updateTransparency':
          console.log('🔄 UpdateTransparency case triggered with value:', message.transparency);
          if (message.transparency !== undefined && !isNaN(message.transparency)) {
            try {
              const newTransparency = parseInt(message.transparency);
              console.log('🔧 Updating transparency from', this.settings.transparency, 'to', newTransparency);
              
              // Update settings
              this.settings.transparency = newTransparency;
              
              // Apply the transparency change
              const success = this.applyTransparency(newTransparency);
              
              if (success) {
                console.log('✅ Transparency updated successfully to:', newTransparency + '%');
                sendResponse({ success: true, transparency: newTransparency });
              } else {
                console.error('❌ Failed to apply transparency');
                sendResponse({ success: false, error: 'Failed to apply transparency' });
              }
            } catch (error) {
              console.error('❌ Error applying transparency:', error);
              sendResponse({ success: false, error: 'Failed to apply transparency: ' + error.message });
            }
          } else {
            console.warn('⚠️ Invalid transparency value provided:', message.transparency);
            sendResponse({ success: false, error: 'Invalid transparency value provided' });
          }
          break;
      }
    });
  }

  setupModuleEventListeners() {
    if (!this.module) return;

    // Header drag functionality
    const header = this.module.querySelector('.module-header');
    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('control-btn')) return;
      
      this.isDragging = true;
      const rect = this.module.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.handleDragEnd);
    });

    // Control buttons
    const minimizeBtn = this.module.querySelector('.minimize-btn');
    const closeBtn = this.module.querySelector('.close-btn');
    
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        this.toggleMinimize();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideModule();
      });
    }

    // Tab navigation
    const tabButtons = this.module.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        this.activateTab(targetTab);
      });
    });

    // Action buttons
    const copyBtn = this.module.querySelector('.copy-btn');
    const customizeBtn = this.module.querySelector('.customize-btn');
    const refreshBtn = this.module.querySelector('.refresh-btn');
    const copySummaryBtn = this.module.querySelector('.copy-summary-btn');
    const regenerateBtn = this.module.querySelector('.regenerate-btn');
    const summaryRefreshBtn = this.module.querySelector('.summary-refresh-btn');

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.copyPrompt();
      });
    }

    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        this.openCustomizeDialog();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.generatePrompt();
      });
    }

    if (copySummaryBtn) {
      copySummaryBtn.addEventListener('click', () => {
        this.copySummary();
      });
    }

    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', () => {
        this.generateSummary();
      });
    }

    if (summaryRefreshBtn) {
      summaryRefreshBtn.addEventListener('click', () => {
        this.generateSummary();
      });
    }
  }

  handleDrag = (e) => {
    if (!this.isDragging) return;
    
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    
    this.module.style.left = `${x}px`;
    this.module.style.top = `${y}px`;
    
    // Save position
    this.settings.position = { x, y };
    chrome.storage.sync.set({ nitroPromptsSettings: this.settings });
  }

  handleDragEnd = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.handleDragEnd);
  }

  applySettings() {
    if (!this.module) return;
    
    // Apply transparency
    const opacity = this.settings.transparency / 100;
    this.module.style.opacity = opacity;
    
    // Apply size
    this.module.className = `nitro-prompts-module size-${this.settings.moduleSize}`;
    
    // Apply intelligence level
    this.generatePrompt();
  }

  applyTransparency(transparency) {
    console.log('🔧 Applying transparency:', transparency + '%');
    
    if (!this.module) {
      console.warn('⚠️ Cannot apply transparency: module not created');
      return false;
    }
    
    try {
      const opacity = transparency / 100;
      console.log('🔧 Setting opacity to:', opacity);
      
      // Apply the transparency
      this.module.style.opacity = opacity;
      
      // Verify the change was applied
      const appliedOpacity = parseFloat(this.module.style.opacity);
      console.log('🔧 Applied opacity:', appliedOpacity);
      
      // Also update the settings
      this.settings.transparency = transparency;
      
      console.log('✅ Transparency updated successfully to:', transparency + '%', 'opacity:', opacity);
      return true;
    } catch (error) {
      console.error('❌ Error applying transparency:', error);
      return false;
    }
  }

  showModule() {
    console.log('👁️ Showing module...');
    
    if (!this.module) {
      console.warn('⚠️ Cannot show module: module not created, creating it now...');
      this.createModule();
    }
    
    // Force show the module
    this.module.style.display = 'block';
    this.module.style.visibility = 'visible';
    this.module.style.opacity = this.settings.transparency / 100;
    this.module.classList.add('show');
    this.isVisible = true;
    
    // Update settings to reflect the change
    this.settings.enabled = true;
    chrome.storage.sync.set({ nitroPromptsSettings: this.settings }).then(() => {
      console.log('✅ Settings updated after showing module');
    }).catch((error) => {
      console.error('❌ Error updating settings:', error);
    });
    
    // Generate prompt if not already done
    if (this.module.querySelector('#promptText').textContent === 'Analyzing page content...') {
      this.generatePrompt();
    }
    
    // Auto-generate summary when showing module
    this.generateSummary();
    
    console.log('✅ Module shown - isVisible:', this.isVisible, 'enabled:', this.settings.enabled);
  }

  hideModule() {
    console.log('🙈 Hiding module...');
    
    if (!this.module) {
      console.warn('⚠️ Cannot hide module: module not created');
      return;
    }
    
    // Force hide the module
    this.module.style.display = 'none';
    this.module.style.visibility = 'hidden';
    this.module.classList.remove('show');
    this.isVisible = false;
    
    // Update settings to reflect the change
    this.settings.enabled = false;
    chrome.storage.sync.set({ nitroPromptsSettings: this.settings }).then(() => {
      console.log('✅ Settings updated after hiding module');
    }).catch((error) => {
      console.error('❌ Error updating settings:', error);
    });
    
    console.log('✅ Module hidden - isVisible:', this.isVisible, 'enabled:', this.settings.enabled);
  }

  toggleModule() {
    console.log('🔄 Toggling module. Current state - isVisible:', this.isVisible, 'enabled:', this.settings.enabled);
    
    if (this.isVisible) {
      this.hideModule();
    } else {
      this.showModule();
    }
    
    console.log('✅ Module toggled, new state - visible:', this.isVisible, 'enabled:', this.settings.enabled);
  }

  toggleMinimize() {
    const content = this.module.querySelector('.module-content');
    const btn = this.module.querySelector('.minimize-btn');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      btn.textContent = '−';
    } else {
      content.style.display = 'none';
      btn.textContent = '+';
    }
  }

  async generatePrompt() {
    const promptText = this.module.querySelector('#promptText');
    const contextInfo = this.module.querySelector('#contextInfo');
    const contextType = this.module.querySelector('#contextType');
    const contextCategory = this.module.querySelector('#contextCategory');
    const contextIntelligence = this.module.querySelector('#contextIntelligence');
    
    if (!promptText || !contextInfo) return;
    
    promptText.textContent = 'Analyzing page content and generating intelligent response...';
    
    try {
      // Analyze current page
      const pageInfo = this.analyzePage();
      
      // Update context information
      contextInfo.textContent = pageInfo.type;
      contextType.textContent = pageInfo.specificType;
      contextCategory.textContent = pageInfo.category;
      contextIntelligence.textContent = this.settings.intelligenceLevel;
      
      // Generate context-aware prompt
      const prompt = this.createContextPrompt(pageInfo);
      
      // Get AI response if service is available
      if (this.aiService && this.aiService.isEnabled) {
        try {
          promptText.textContent = 'Getting AI response...';
          const aiResponse = await this.aiService.getResponse(prompt, this.settings.intelligenceLevel);
          promptText.textContent = aiResponse;
          console.log('AI response generated for:', pageInfo.type);
        } catch (aiError) {
          console.warn('AI service failed, showing prompt instead:', aiError.message);
          promptText.textContent = prompt + '\n\n[AI Service Error: ' + aiError.message + ']';
        }
      } else {
        // Fallback to showing the prompt
        promptText.textContent = prompt;
        console.log('Generated prompt for:', pageInfo.type, 'with intelligence level:', this.settings.intelligenceLevel);
      }
      
    } catch (error) {
      promptText.textContent = 'Error generating response. Please try refreshing.';
      console.error('Error generating response:', error);
    }
  }

  async generateSummary() {
    const summaryText = this.module.querySelector('#summaryText');
    const summaryContextInfo = this.module.querySelector('#summaryContextInfo');
    const summaryLength = this.module.querySelector('#summaryLength');
    const summaryFocus = this.module.querySelector('#summaryFocus');
    const summaryGenerated = this.module.querySelector('#summaryGenerated');

    if (!summaryText || !summaryContextInfo) {
      console.warn('⚠️ Summary elements not found');
      return;
    }

    // Show loading state
    summaryText.textContent = '🤖 Generating AI summary...';
    summaryLength.textContent = '-';
    summaryFocus.textContent = '-';
    summaryGenerated.textContent = '-';

    try {
      // Analyze current page
      const pageInfo = this.analyzePage();
      summaryContextInfo.textContent = pageInfo.type;

      // Generate context-aware prompt for summary
      const prompt = this.createSummaryPrompt(pageInfo);

      // Get AI response if service is available
      if (this.aiService && this.aiService.isEnabled) {
        try {
          summaryText.textContent = '🤖 Getting AI summary...';
          const aiResponse = await this.aiService.getResponse(prompt, 'basic'); // Summary is typically basic
          
          // Clean up the response and format it nicely
          let formattedResponse = aiResponse.trim();
          
          // If the response is very long, truncate it
          if (formattedResponse.length > 1000) {
            formattedResponse = formattedResponse.substring(0, 1000) + '...';
          }
          
          summaryText.textContent = formattedResponse;
          console.log('✅ AI summary generated for:', pageInfo.type);

          // Update summary details
          summaryLength.textContent = formattedResponse.length + ' chars';
          summaryFocus.textContent = this.getSummaryFocus(formattedResponse);
          summaryGenerated.textContent = new Date().toLocaleTimeString();
          
        } catch (aiError) {
          console.warn('⚠️ AI service failed, showing prompt instead:', aiError.message);
          summaryText.textContent = '❌ AI Service Error: ' + aiError.message + '\n\n' + prompt;
          summaryLength.textContent = 'Error';
          summaryFocus.textContent = 'N/A';
          summaryGenerated.textContent = 'Failed';
        }
      } else {
        // Fallback to showing the prompt
        summaryText.textContent = '⚠️ AI Service not available. Please configure your Gemini API key in the extension popup.\n\n' + prompt;
        summaryLength.textContent = 'N/A';
        summaryFocus.textContent = 'N/A';
        summaryGenerated.textContent = 'No AI';
        console.log('⚠️ No AI service available, showing prompt for:', pageInfo.type);
      }
    } catch (error) {
      summaryText.textContent = '❌ Error generating summary. Please try refreshing the page.';
      summaryLength.textContent = 'Error';
      summaryFocus.textContent = 'N/A';
      summaryGenerated.textContent = 'Failed';
      console.error('❌ Error generating summary:', error);
    }
  }

  createSummaryPrompt(pageInfo) {
    const intelligenceLevel = 'basic'; // Summary is typically basic
    
    // Enhanced summary templates based on page type
    const summaryTemplates = {
      // GitHub specific summaries
      'github-repository': `Provide a concise summary of this GitHub repository: "${pageInfo.title}". Focus on: 1) What this project does, 2) Key technologies used, 3) Main features or purpose. Keep it under 200 words.`,
      'github-issue': `Summarize this GitHub issue: "${pageInfo.title}". Include: 1) The problem described, 2) Current status, 3) Key points or solutions mentioned. Keep it under 150 words.`,
      'github-pull-request': `Summarize this GitHub pull request: "${pageInfo.title}". Include: 1) What changes are being made, 2) Key improvements or fixes, 3) Impact of the changes. Keep it under 150 words.`,
      
      // Stack Overflow summaries
      'stackoverflow-question': `Summarize this Stack Overflow question: "${pageInfo.title}". Include: 1) The problem being asked, 2) Key technical details, 3) What the user is trying to achieve. Keep it under 150 words.`,
      
      // Technical article summaries
      'technical-article': `Summarize this technical article: "${pageInfo.title}". Include: 1) Main topic or concept, 2) Key takeaways, 3) Practical applications. Keep it under 200 words.`,
      
      // YouTube video summaries
      'youtube-video': `Summarize this YouTube video: "${pageInfo.title}". Include: 1) Main topic or content, 2) Key points covered, 3) Value or insights provided. Keep it under 150 words.`,
      
      // Documentation summaries
      'documentation': `Summarize this documentation: "${pageInfo.title}". Include: 1) What this documentation covers, 2) Key concepts or features, 3) Main use cases. Keep it under 200 words.`,
      
      // E-commerce product summaries
      'e-commerce-product': `Summarize this product: "${pageInfo.title}". Include: 1) What this product is, 2) Key features or benefits, 3) Target audience or use case. Keep it under 150 words.`,
      
      // News article summaries
      'news-article': `Summarize this news article: "${pageInfo.title}". Include: 1) Main story or event, 2) Key facts or developments, 3) Impact or significance. Keep it under 200 words.`,
      
      // Learning course summaries
      'learning-course': `Summarize this learning course: "${pageInfo.title}". Include: 1) What you'll learn, 2) Course level and prerequisites, 3) Key topics covered. Keep it under 150 words.`,
      
      // Code playground summaries
      'code-playground': `Summarize this code example: "${pageInfo.title}". Include: 1) What this code demonstrates, 2) Key techniques or concepts, 3) Practical applications. Keep it under 150 words.`,
      
      // Reddit discussion summaries
      'reddit-discussion': `Summarize this Reddit discussion: "${pageInfo.title}". Include: 1) Main topic or question, 2) Key points from the discussion, 3) Community consensus or insights. Keep it under 150 words.`,
      
      // LinkedIn content summaries
      'linkedin-post': `Summarize this LinkedIn post: "${pageInfo.title}". Include: 1) Main message or insight, 2) Professional value, 3) Key takeaways. Keep it under 100 words.`,
      
      // General webpage summaries
      'general-webpage': `Summarize this webpage: "${pageInfo.title}". Include: 1) Main purpose or content, 2) Key information provided, 3) Value or relevance. Keep it under 200 words.`
    };
    
    // Get the appropriate template based on page type
    const templateKey = pageInfo.specificType === 'repository' ? 'github-repository' :
                       pageInfo.specificType === 'issue' ? 'github-issue' :
                       pageInfo.specificType === 'pull-request' ? 'github-pull-request' :
                       pageInfo.specificType === 'question' ? 'stackoverflow-question' :
                       pageInfo.specificType === 'article' ? 'technical-article' :
                       pageInfo.specificType === 'video' ? 'youtube-video' :
                       pageInfo.specificType === 'docs' ? 'documentation' :
                       pageInfo.specificType === 'product' ? 'e-commerce-product' :
                       pageInfo.specificType === 'post' ? 'news-article' :
                       pageInfo.specificType === 'course' ? 'learning-course' :
                       pageInfo.specificType === 'playground' ? 'code-playground' :
                       pageInfo.specificType === 'discussion' ? 'reddit-discussion' :
                       pageInfo.specificType === 'linkedin-post' ? 'linkedin-post' :
                       'general-webpage';
    
    const template = summaryTemplates[templateKey] || summaryTemplates['general-webpage'];
    
    // Add context-specific enhancements
    let prompt = template;
    
    if (pageInfo.keywords.length > 0) {
      prompt += `\n\nKey topics detected: ${pageInfo.keywords.slice(0, 5).join(', ')}`;
    }
    
    if (pageInfo.headings.length > 0) {
      prompt += `\n\nMain sections: ${pageInfo.headings.slice(0, 3).join(' | ')}`;
    }
    
    if (pageInfo.codeBlocks.length > 0) {
      prompt += `\n\nThis page contains code examples that should be considered in the summary.`;
    }
    
    // Add summary-specific instructions
    prompt += `\n\nPlease provide a clear, concise summary that captures the essence of this content. Focus on the most important information that would help someone quickly understand what this page is about.`;
    
    return prompt;
  }

  copyPrompt() {
    const promptText = this.module.querySelector('#promptText');
    if (!promptText) return;
    
    navigator.clipboard.writeText(promptText.textContent).then(() => {
      const btn = this.module.querySelector('.copy-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    });
  }

  copySummary() {
    const summaryText = this.module.querySelector('#summaryText');
    if (!summaryText) return;

    navigator.clipboard.writeText(summaryText.textContent).then(() => {
      const btn = this.module.querySelector('.copy-summary-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    });
  }

  openCustomizeDialog() {
    // Open advanced settings page
    chrome.runtime.sendMessage({ action: 'openSettings' });
  }

  getSummaryFocus(summaryContent) {
    const keywords = summaryContent.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const wordFreq = {};
    keywords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const sortedKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    return sortedKeywords.join(', ');
  }

  analyzePage() {
    const url = window.location.href;
    const title = document.title;
    const domain = window.location.hostname;
    const path = window.location.pathname;
    
    // Enhanced page type detection
    let type = 'General webpage';
    let category = 'general';
    let specificType = 'webpage';
    
    // GitHub detection
    if (domain.includes('github.com')) {
      type = 'GitHub repository';
      category = 'development';
      if (path.includes('/issues/')) {
        specificType = 'issue';
        type = 'GitHub issue';
      } else if (path.includes('/pull/')) {
        specificType = 'pull-request';
        type = 'GitHub pull request';
      } else if (path.includes('/wiki/')) {
        specificType = 'wiki';
        type = 'GitHub wiki';
      } else if (path.includes('/actions/')) {
        specificType = 'workflow';
        type = 'GitHub workflow';
      } else {
        specificType = 'repository';
      }
    }
    // Stack Overflow detection
    else if (domain.includes('stackoverflow.com')) {
      type = 'Stack Overflow question';
      category = 'programming';
      specificType = 'question';
    }
    // Technical articles
    else if (domain.includes('medium.com') || domain.includes('dev.to') || domain.includes('hashnode.dev')) {
      type = 'Technical article';
      category = 'learning';
      specificType = 'article';
    }
    // YouTube
    else if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      type = 'YouTube video';
      category = 'video';
      specificType = 'video';
    }
    // Social media
    else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      type = 'Social media post';
      category = 'social';
      specificType = 'post';
    }
    // Documentation sites
    else if (domain.includes('docs.') || domain.includes('documentation') || 
             domain.includes('developer.mozilla.org') || domain.includes('reactjs.org') ||
             domain.includes('vuejs.org') || domain.includes('angular.io')) {
      type = 'Documentation';
      category = 'reference';
      specificType = 'docs';
    }
    // E-commerce
    else if (domain.includes('amazon.com') || domain.includes('shop.') || domain.includes('store.')) {
      type = 'E-commerce product';
      category = 'shopping';
      specificType = 'product';
    }
    // News sites
    else if (domain.includes('news.') || domain.includes('bbc.com') || domain.includes('cnn.com') ||
             domain.includes('reuters.com') || domain.includes('techcrunch.com')) {
      type = 'News article';
      category = 'news';
      specificType = 'article';
    }
    // Learning platforms
    else if (domain.includes('udemy.com') || domain.includes('coursera.org') || 
             domain.includes('edx.org') || domain.includes('freecodecamp.org')) {
      type = 'Learning course';
      category = 'education';
      specificType = 'course';
    }
    // Code playgrounds
    else if (domain.includes('codepen.io') || domain.includes('jsfiddle.net') || 
             domain.includes('codesandbox.io') || domain.includes('replit.com')) {
      type = 'Code playground';
      category = 'development';
      specificType = 'playground';
    }
    // Reddit
    else if (domain.includes('reddit.com')) {
      type = 'Reddit discussion';
      category = 'community';
      specificType = 'discussion';
    }
    // LinkedIn
    else if (domain.includes('linkedin.com')) {
      type = 'LinkedIn content';
      category = 'professional';
      specificType = 'post';
    }
    
    // Extract key content
    const bodyText = document.body.innerText;
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent.trim());
    const links = Array.from(document.querySelectorAll('a')).map(a => a.textContent.trim()).filter(text => text.length > 10);
    const codeBlocks = Array.from(document.querySelectorAll('code, pre')).map(c => c.textContent.trim());
    
    // Extract keywords from content
    const words = bodyText.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
    
    return {
      url,
      title,
      domain,
      path,
      type,
      category,
      specificType,
      content: bodyText.substring(0, 2000),
      headings: headings.slice(0, 5),
      links: links.slice(0, 5),
      codeBlocks: codeBlocks.slice(0, 3),
      keywords,
      wordCount: bodyText.split(/\s+/).length
    };
  }

  createContextPrompt(pageInfo) {
    const intelligenceLevel = this.settings.intelligenceLevel;
    
    // Enhanced prompt templates based on page type and intelligence level
    const promptTemplates = {
      // GitHub specific prompts
      'github-repository': {
        basic: `Help me understand this GitHub repository: "${pageInfo.title}". What is this project about and how can I get started?`,
        intermediate: `Analyze this GitHub repository "${pageInfo.title}" and provide insights about its purpose, technology stack, and key features.`,
        advanced: `Provide a comprehensive analysis of this GitHub repository "${pageInfo.title}" including architecture, dependencies, contribution guidelines, and potential improvements.`,
        expert: `Conduct an expert-level code review of this GitHub repository "${pageInfo.title}", analyzing code quality, security practices, scalability, and industry best practices.`
      },
      'github-issue': {
        basic: `Help me understand this GitHub issue: "${pageInfo.title}". What's the problem and how can it be solved?`,
        intermediate: `Analyze this GitHub issue "${pageInfo.title}" and provide insights about the problem, potential solutions, and implementation approach.`,
        advanced: `Provide a detailed analysis of this GitHub issue "${pageInfo.title}" including root cause analysis, multiple solution approaches, and implementation strategy.`,
        expert: `Conduct an expert analysis of this GitHub issue "${pageInfo.title}", considering architectural implications, security concerns, and long-term maintenance.`
      },
      'github-pull-request': {
        basic: `Help me understand this GitHub pull request: "${pageInfo.title}". What changes are being made?`,
        intermediate: `Review this GitHub pull request "${pageInfo.title}" and provide feedback on the changes, potential issues, and improvements.`,
        advanced: `Provide a comprehensive code review of this GitHub pull request "${pageInfo.title}" including code quality, testing, documentation, and best practices.`,
        expert: `Conduct an expert-level review of this GitHub pull request "${pageInfo.title}", analyzing architectural impact, performance implications, and security considerations.`
      },
      
      // Stack Overflow prompts
      'stackoverflow-question': {
        basic: `Help me understand this Stack Overflow question: "${pageInfo.title}". What's the problem and how can I solve it?`,
        intermediate: `Analyze this Stack Overflow question "${pageInfo.title}" and provide a comprehensive solution with explanations.`,
        advanced: `Provide an expert solution to this Stack Overflow question "${pageInfo.title}" including best practices, alternative approaches, and performance considerations.`,
        expert: `Conduct an expert analysis of this Stack Overflow question "${pageInfo.title}", providing multiple solution approaches, edge cases, and industry best practices.`
      },
      
      // Technical article prompts
      'technical-article': {
        basic: `Help me understand this technical article: "${pageInfo.title}". What are the key points?`,
        intermediate: `Analyze this technical article "${pageInfo.title}" and provide insights about the concepts, implementation, and practical applications.`,
        advanced: `Provide a comprehensive analysis of this technical article "${pageInfo.title}" including technical depth, practical implications, and advanced concepts.`,
        expert: `Conduct an expert analysis of this technical article "${pageInfo.title}", evaluating technical accuracy, industry relevance, and advanced applications.`
      },
      
      // YouTube video prompts
      'youtube-video': {
        basic: `Help me understand this YouTube video: "${pageInfo.title}". What are the main points?`,
        intermediate: `Analyze this YouTube video "${pageInfo.title}" and provide insights about the content, key takeaways, and practical applications.`,
        advanced: `Provide a comprehensive analysis of this YouTube video "${pageInfo.title}" including technical depth, practical implications, and advanced concepts.`,
        expert: `Conduct an expert analysis of this YouTube video "${pageInfo.title}", evaluating content quality, technical accuracy, and advanced applications.`
      },
      
      // Documentation prompts
      'documentation': {
        basic: `Help me understand this documentation: "${pageInfo.title}". What are the key concepts?`,
        intermediate: `Analyze this documentation "${pageInfo.title}" and provide insights about the features, implementation, and best practices.`,
        advanced: `Provide a comprehensive analysis of this documentation "${pageInfo.title}" including technical depth, implementation strategies, and advanced usage.`,
        expert: `Conduct an expert analysis of this documentation "${pageInfo.title}", evaluating completeness, accuracy, and advanced implementation patterns.`
      },
      
      // E-commerce prompts
      'e-commerce-product': {
        basic: `Help me understand this product: "${pageInfo.title}". What are its features and benefits?`,
        intermediate: `Analyze this product "${pageInfo.title}" and provide insights about features, specifications, and value proposition.`,
        advanced: `Provide a comprehensive analysis of this product "${pageInfo.title}" including technical specifications, market positioning, and competitive analysis.`,
        expert: `Conduct an expert analysis of this product "${pageInfo.title}", evaluating technical capabilities, market fit, and competitive advantages.`
      },
      
      // News article prompts
      'news-article': {
        basic: `Help me understand this news article: "${pageInfo.title}". What are the key points?`,
        intermediate: `Analyze this news article "${pageInfo.title}" and provide insights about the implications and context.`,
        advanced: `Provide a comprehensive analysis of this news article "${pageInfo.title}" including background context, implications, and broader impact.`,
        expert: `Conduct an expert analysis of this news article "${pageInfo.title}", evaluating accuracy, bias, and broader societal implications.`
      },
      
      // Learning course prompts
      'learning-course': {
        basic: `Help me understand this learning course: "${pageInfo.title}". What will I learn?`,
        intermediate: `Analyze this learning course "${pageInfo.title}" and provide insights about the curriculum, difficulty level, and learning outcomes.`,
        advanced: `Provide a comprehensive analysis of this learning course "${pageInfo.title}" including course structure, prerequisites, and advanced applications.`,
        expert: `Conduct an expert analysis of this learning course "${pageInfo.title}", evaluating pedagogical approach, industry relevance, and career impact.`
      },
      
      // Code playground prompts
      'code-playground': {
        basic: `Help me understand this code example: "${pageInfo.title}". What does this code do?`,
        intermediate: `Analyze this code example "${pageInfo.title}" and provide insights about the implementation, best practices, and potential improvements.`,
        advanced: `Provide a comprehensive analysis of this code example "${pageInfo.title}" including architecture, performance considerations, and advanced techniques.`,
        expert: `Conduct an expert code review of this example "${pageInfo.title}", analyzing patterns, security, scalability, and industry best practices.`
      },
      
      // Reddit discussion prompts
      'reddit-discussion': {
        basic: `Help me understand this Reddit discussion: "${pageInfo.title}". What's the main topic?`,
        intermediate: `Analyze this Reddit discussion "${pageInfo.title}" and provide insights about the key points, different perspectives, and community consensus.`,
        advanced: `Provide a comprehensive analysis of this Reddit discussion "${pageInfo.title}" including community dynamics, information quality, and broader implications.`,
        expert: `Conduct an expert analysis of this Reddit discussion "${pageInfo.title}", evaluating information accuracy, community sentiment, and societal impact.`
      },
      
      // LinkedIn content prompts
      'linkedin-post': {
        basic: `Help me understand this LinkedIn post: "${pageInfo.title}". What's the key message?`,
        intermediate: `Analyze this LinkedIn post "${pageInfo.title}" and provide insights about the professional value, networking potential, and industry relevance.`,
        advanced: `Provide a comprehensive analysis of this LinkedIn post "${pageInfo.title}" including professional implications, networking strategies, and career insights.`,
        expert: `Conduct an expert analysis of this LinkedIn post "${pageInfo.title}", evaluating professional credibility, industry positioning, and strategic value.`
      },
      
      // General webpage prompts
      'general-webpage': {
        basic: `Help me understand this webpage: "${pageInfo.title}". What is this about?`,
        intermediate: `Analyze this webpage "${pageInfo.title}" and provide insights about the content, purpose, and key information.`,
        advanced: `Provide a comprehensive analysis of this webpage "${pageInfo.title}" including content quality, structure, and practical applications.`,
        expert: `Conduct an expert analysis of this webpage "${pageInfo.title}", evaluating content quality, accuracy, and broader implications.`
      }
    };
    
    // Get the appropriate template based on page type
    const templateKey = pageInfo.specificType === 'repository' ? 'github-repository' :
                       pageInfo.specificType === 'issue' ? 'github-issue' :
                       pageInfo.specificType === 'pull-request' ? 'github-pull-request' :
                       pageInfo.specificType === 'question' ? 'stackoverflow-question' :
                       pageInfo.specificType === 'article' ? 'technical-article' :
                       pageInfo.specificType === 'video' ? 'youtube-video' :
                       pageInfo.specificType === 'docs' ? 'documentation' :
                       pageInfo.specificType === 'product' ? 'e-commerce-product' :
                       pageInfo.specificType === 'post' ? 'news-article' :
                       pageInfo.specificType === 'course' ? 'learning-course' :
                       pageInfo.specificType === 'playground' ? 'code-playground' :
                       pageInfo.specificType === 'discussion' ? 'reddit-discussion' :
                       pageInfo.specificType === 'linkedin-post' ? 'linkedin-post' :
                       'general-webpage';
    
    const templates = promptTemplates[templateKey] || promptTemplates['general-webpage'];
    
    // Get the base prompt
    let prompt = templates[intelligenceLevel] || templates.intermediate;
    
    // Add context-specific enhancements
    if (pageInfo.keywords.length > 0) {
      prompt += `\n\nKey topics detected: ${pageInfo.keywords.slice(0, 5).join(', ')}`;
    }
    
    if (pageInfo.headings.length > 0) {
      prompt += `\n\nMain sections: ${pageInfo.headings.slice(0, 3).join(' | ')}`;
    }
    
    if (pageInfo.codeBlocks.length > 0) {
      prompt += `\n\nThis page contains code examples that should be considered in the analysis.`;
    }
    
    // Add intelligence level specific instructions
    const levelInstructions = {
      basic: 'Provide a clear, simple explanation suitable for beginners.',
      intermediate: 'Include technical details and practical insights.',
      advanced: 'Provide deep technical analysis with implementation strategies.',
      expert: 'Include industry best practices, advanced concepts, and expert-level insights.'
    };
    
    prompt += `\n\n${levelInstructions[intelligenceLevel] || levelInstructions.intermediate}`;
    
    return prompt;
  }

  activateTab(tabId) {
    const tabButtons = this.module.querySelectorAll('.tab-btn');
    const tabPanes = this.module.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    tabPanes.forEach(pane => {
      pane.classList.remove('active');
    });

    const activeButton = this.module.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const activePane = this.module.querySelector(`#${tabId}-tab`);
    
    if (activeButton) activeButton.classList.add('active');
    if (activePane) activePane.classList.add('active');
    
    // Auto-generate summary when switching to summary tab
    if (tabId === 'summary') {
      console.log('🔄 Auto-generating summary for summary tab...');
      this.generateSummary();
    }
  }
}

// Initialize the module when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NitroPromptsModule();
  });
} else {
  new NitroPromptsModule();
}