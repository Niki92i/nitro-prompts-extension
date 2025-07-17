// Content script for Nitro Prompts extension
class NitroPromptsModule {
  constructor() {
    this.module = null;
    this.settings = null;
    this.isVisible = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.aiService = null;
    
    this.init();
  }

  async init() {
    // Load settings
    await this.loadSettings();
    
    // Initialize AI service
    this.initAIService();
    
    // Create and inject module
    this.createModule();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Show module if enabled in settings
    if (this.settings.enabled) {
      this.showModule();
      console.log('Module initialized and shown (enabled in settings)');
    } else {
      console.log('Module initialized but hidden (disabled in settings)');
    }
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
      this.settings = result.nitroPromptsSettings || {
        enabled: false,
        intelligenceLevel: 'intermediate',
        transparency: 80,
        moduleSize: 'medium',
        position: { x: 20, y: 20 },
        customPrompts: [],
        geminiApiKey: '' // Added for Gemini API key
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = {
        enabled: false,
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
      return;
    }

    // Create module container
    this.module = document.createElement('div');
    this.module.id = 'nitro-prompts-module';
    this.module.className = 'nitro-prompts-module';
    
    // Set initial position
    this.module.style.left = `${this.settings.position.x}px`;
    this.module.style.top = `${this.settings.position.y}px`;
    
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
    `;
    
    // Append to body
    document.body.appendChild(this.module);
    
    // Set up module event listeners
    this.setupModuleEventListeners();
    
    // Apply initial settings
    this.applySettings();
  }

  setupEventListeners() {
    // Keyboard shortcut (Ctrl+Shift+P)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.toggleModule();
      }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Content script received message:', message);
      console.log('📨 Message action:', message.action);
      
      switch (message.action) {
        case 'showModule':
          this.showModule();
          sendResponse({ success: true, action: 'showModule' });
          break;
        case 'hideModule':
          this.hideModule();
          sendResponse({ success: true, action: 'hideModule' });
          break;
        case 'toggleModule':
          this.toggleModule();
          sendResponse({ success: true, action: 'toggleModule', visible: this.isVisible });
          break;
        case 'updateSettings':
          this.settings = message.settings;
          this.applySettings();
          // Show/hide module based on new settings
          if (this.settings.enabled) {
            this.showModule();
          } else {
            this.hideModule();
          }
          sendResponse({ success: true, action: 'updateSettings' });
          break;
        case 'resetSettings':
          this.loadSettings().then(() => {
            this.applySettings();
            sendResponse({ success: true, action: 'resetSettings' });
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
          sendResponse({ success: true, visible: this.isVisible, moduleExists: !!this.module });
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
          if (message.transparency !== undefined) {
            this.settings.transparency = message.transparency;
            this.applyTransparency(message.transparency);
            sendResponse({ success: true, transparency: message.transparency });
          } else {
            sendResponse({ success: false, error: 'No transparency value provided' });
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

    // Action buttons
    const copyBtn = this.module.querySelector('.copy-btn');
    const customizeBtn = this.module.querySelector('.customize-btn');
    const refreshBtn = this.module.querySelector('.refresh-btn');

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
    if (!this.module) return;
    
    const opacity = transparency / 100;
    this.module.style.opacity = opacity;
    console.log('Transparency updated to:', transparency + '%', 'opacity:', opacity);
  }

  showModule() {
    if (this.module) {
      this.module.style.display = 'block';
      this.module.classList.add('show');
      this.isVisible = true;
      console.log('Module shown - isVisible:', this.isVisible);
    }
  }

  hideModule() {
    if (this.module) {
      this.module.style.display = 'none';
      this.module.classList.remove('show');
      this.isVisible = false;
      console.log('Module hidden - isVisible:', this.isVisible);
    }
  }

  toggleModule() {
    if (this.isVisible) {
      this.hideModule();
    } else {
      this.showModule();
    }
    console.log('Module toggled, visible:', this.isVisible);
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

  openCustomizeDialog() {
    // Open advanced settings page
    chrome.runtime.sendMessage({ action: 'openSettings' });
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