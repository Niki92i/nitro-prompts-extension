// Settings page script for Nitro Prompts extension
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const aiModel = document.getElementById('aiModel');
  const temperature = document.getElementById('temperature');
  const temperatureValue = document.getElementById('temperatureValue');
  const maxTokens = document.getElementById('maxTokens');
  const customPrompt = document.getElementById('customPrompt');
  const defaultPosition = document.getElementById('defaultPosition');
  const autoShow = document.getElementById('autoShow');
  const rememberPosition = document.getElementById('rememberPosition');
  const saveSettings = document.getElementById('saveSettings');
  const resetSettings = document.getElementById('resetSettings');
  const exportSettings = document.getElementById('exportSettings');
  const importSettings = document.getElementById('importSettings');
  const addRule = document.getElementById('addRule');

  // Template buttons
  const templateButtons = document.querySelectorAll('.template-btn');

  // Default settings
  const defaultSettings = {
    enabled: false,
    intelligenceLevel: 'intermediate',
    transparency: 80,
    moduleSize: 'medium',
    position: { x: 20, y: 20 },
    customPrompts: [],
    aiModel: 'gpt-3.5-turbo',
    temperature: 70,
    maxTokens: 250,
    defaultPosition: 'top-right',
    autoShow: false,
    rememberPosition: true,
    websiteRules: []
  };

  // Template prompts
  const promptTemplates = {
    analysis: 'Analyze this {type} and provide insights about: "{title}"',
    summary: 'Create a concise summary of this {type}: "{title}"',
    question: 'What questions should I ask about this {type}: "{title}"?',
    improvement: 'How can this {type} be improved? "{title}"',
    comparison: 'Compare this {type} with similar content: "{title}"',
    custom: ''
  };

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get('nitroPromptsSettings');
      const settings = result.nitroPromptsSettings || defaultSettings;
      
      // Populate form fields
      aiModel.value = settings.aiModel || 'gpt-3.5-turbo';
      temperature.value = settings.temperature || 70;
      temperatureValue.textContent = `${settings.temperature || 70}%`;
      maxTokens.value = settings.maxTokens || 250;
      customPrompt.value = settings.customPrompt || '';
      defaultPosition.value = settings.defaultPosition || 'top-right';
      autoShow.checked = settings.autoShow || false;
      rememberPosition.checked = settings.rememberPosition !== false;
      
      // Load website rules
      loadWebsiteRules(settings.websiteRules || []);
      
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  }

  // Save settings to storage
  async function saveSettingsToStorage(settings) {
    try {
      await chrome.storage.sync.set({ nitroPromptsSettings: settings });
      showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Error saving settings', 'error');
    }
  }

  // Load website rules
  function loadWebsiteRules(rules) {
    const rulesContainer = document.querySelector('.website-rules');
    const addButton = document.getElementById('addRule');
    
    // Remove existing rules (except the add button)
    const existingRules = rulesContainer.querySelectorAll('.rule-item');
    existingRules.forEach(rule => rule.remove());
    
    // Add rules
    rules.forEach(rule => {
      addWebsiteRule(rule.domain, rule.promptType);
    });
  }

  // Add website rule
  function addWebsiteRule(domain = '', promptType = 'default') {
    const rulesContainer = document.querySelector('.website-rules');
    const addButton = document.getElementById('addRule');
    
    const ruleItem = document.createElement('div');
    ruleItem.className = 'rule-item';
    ruleItem.innerHTML = `
      <input type="text" placeholder="Domain (e.g., github.com)" class="domain-input" value="${domain}">
      <select class="prompt-type-select">
        <option value="default" ${promptType === 'default' ? 'selected' : ''}>Default Prompt</option>
        <option value="custom" ${promptType === 'custom' ? 'selected' : ''}>Custom Prompt</option>
        <option value="template" ${promptType === 'template' ? 'selected' : ''}>Template</option>
      </select>
      <button class="remove-rule-btn">×</button>
    `;
    
    // Insert before add button
    rulesContainer.insertBefore(ruleItem, addButton);
    
    // Add event listener for remove button
    ruleItem.querySelector('.remove-rule-btn').addEventListener('click', () => {
      ruleItem.remove();
    });
  }

  // Get current settings from form
  function getCurrentSettings() {
    const websiteRules = [];
    document.querySelectorAll('.rule-item').forEach(rule => {
      const domain = rule.querySelector('.domain-input').value;
      const promptType = rule.querySelector('.prompt-type-select').value;
      if (domain.trim()) {
        websiteRules.push({ domain: domain.trim(), promptType });
      }
    });

    return {
      ...defaultSettings,
      aiModel: aiModel.value,
      temperature: parseInt(temperature.value),
      maxTokens: parseInt(maxTokens.value),
      customPrompt: customPrompt.value,
      defaultPosition: defaultPosition.value,
      autoShow: autoShow.checked,
      rememberPosition: rememberPosition.checked,
      websiteRules
    };
  }

  // Show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
      notification.style.background = '#28a745';
    } else if (type === 'error') {
      notification.style.background = '#dc3545';
    } else {
      notification.style.background = '#667eea';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Event listeners
  temperature.addEventListener('input', function() {
    temperatureValue.textContent = `${this.value}%`;
  });

  // Template button clicks
  templateButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const template = this.dataset.template;
      
      // Remove active class from all buttons
      templateButtons.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Set template text
      if (template !== 'custom') {
        customPrompt.value = promptTemplates[template];
      }
    });
  });

  // Add rule button
  addRule.addEventListener('click', () => {
    addWebsiteRule();
  });

  // Save settings
  saveSettings.addEventListener('click', async function() {
    const settings = getCurrentSettings();
    await saveSettingsToStorage(settings);
  });

  // Reset settings
  resetSettings.addEventListener('click', async function() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      await saveSettingsToStorage(defaultSettings);
      await loadSettings();
      showNotification('Settings reset to default', 'success');
    }
  });

  // Export settings
  exportSettings.addEventListener('click', function() {
    const settings = getCurrentSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nitro-prompts-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Settings exported successfully!', 'success');
  });

  // Import settings
  importSettings.addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async function(e) {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const settings = JSON.parse(text);
          
          // Validate settings
          if (settings && typeof settings === 'object') {
            await saveSettingsToStorage(settings);
            await loadSettings();
            showNotification('Settings imported successfully!', 'success');
          } else {
            throw new Error('Invalid settings file');
          }
        } catch (error) {
          console.error('Error importing settings:', error);
          showNotification('Error importing settings file', 'error');
        }
      }
    };
    
    input.click();
  });

  // Auto-save on form changes
  const formElements = [aiModel, temperature, maxTokens, customPrompt, defaultPosition, autoShow, rememberPosition];
  formElements.forEach(element => {
    element.addEventListener('change', async function() {
      const settings = getCurrentSettings();
      await saveSettingsToStorage(settings);
    });
  });

  // Initialize settings
  loadSettings();
}); 