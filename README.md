# 🚀 Nitro Prompts Extension

> AI-powered context-aware prompts for every website. Get intelligent insights and better AI responses with just one click.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen.svg)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/nitro-prompts-extension/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Features

- 🧠 **Context-Aware Intelligence**: Automatically detects website types and generates relevant prompts
- 🎯 **4 Intelligence Levels**: Basic, Intermediate, Advanced, and Expert modes
- 🎨 **Customizable Interface**: Adjust transparency, size, and position
- ⚡ **Real-time Updates**: Prompts update instantly as you change settings
- 🔧 **Advanced Settings**: Custom prompts, keyboard shortcuts, and more
- 🆓 **100% Free**: No subscription, no ads, no data collection

## 🎯 Supported Websites

- **GitHub**: Repositories, issues, pull requests, wikis
- **Stack Overflow**: Questions and answers
- **Technical Articles**: Medium, Dev.to, Hashnode
- **YouTube**: Videos and tutorials
- **Documentation**: MDN, React docs, Vue docs, Angular docs
- **Learning Platforms**: Udemy, Coursera, freeCodeCamp
- **Code Playgrounds**: CodePen, JSFiddle, CodeSandbox
- **Social Media**: Twitter, Reddit, LinkedIn
- **E-commerce**: Amazon, online stores
- **News Sites**: BBC, CNN, TechCrunch
- **And many more!**

## 📦 Installation

### Method 1: Download from GitHub (Recommended)

1. **Download the extension**:
   - Click the green "Code" button above
   - Select "Download ZIP"
   - Or go to [Releases](https://github.com/yourusername/nitro-prompts-extension/releases) for the latest version

2. **Extract the ZIP file** to a folder on your computer

3. **Install in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extracted folder

4. **Start using**:
   - Click the Nitro Prompts icon in your toolbar
   - Enable the prompt module
   - Visit any website and see intelligent prompts!

### Method 2: Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nitro-prompts-extension.git

# Navigate to the directory
cd nitro-prompts-extension

# Follow steps 3-4 from Method 1
```

## 🎮 Usage

### Basic Usage

1. **Enable the extension**:
   - Click the Nitro Prompts icon in your browser toolbar
   - Toggle "Enable Prompt Module" to ON

2. **Generate prompts**:
   - Visit any website
   - The module will appear with context-aware prompts
   - Click "Copy" to copy the prompt to clipboard

3. **Customize settings**:
   - Adjust intelligence level (Basic → Expert)
   - Change transparency and size
   - Drag the module to reposition

### Advanced Features

- **Keyboard Shortcut**: Press `Ctrl+Shift+P` to toggle the module
- **Custom Prompts**: Add your own prompts in Advanced Settings
- **Multiple Intelligence Levels**: Switch between Basic, Intermediate, Advanced, and Expert
- **Real-time Updates**: Changes apply instantly

## 🛠️ Development

### Project Structure

```
nitro-prompts-extension/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup UI
├── popup.js               # Popup functionality
├── popup.css              # Popup styles
├── content.js             # Content script (main logic)
├── content.css            # Module styles
├── background.js          # Background service worker
├── settings.html          # Advanced settings page
├── settings.js            # Settings functionality
├── settings.css           # Settings styles
├── welcome.html           # Welcome page
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

### Building

```bash
# Package the extension
./package-extension.sh

# The packaged extension will be in dist/nitro-prompts-extension.zip
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎯 Example Prompts

### GitHub Repository (Expert Level)
```
Conduct an expert-level code review of this GitHub repository "React Advanced Patterns", analyzing code quality, security practices, scalability, and industry best practices.

Key topics detected: react, patterns, components, hooks, performance

Main sections: Introduction | Advanced Patterns | Performance Optimization

This page contains code examples that should be considered in the analysis.

Include industry best practices, advanced concepts, and expert-level insights.
```

### Stack Overflow Question (Advanced Level)
```
Provide an expert solution to this Stack Overflow question "How to optimize React rendering performance?" including best practices, alternative approaches, and performance considerations.

Key topics detected: react, performance, rendering, optimization, hooks

Main sections: Problem | Current Solution | Performance Issues | Optimization Techniques

Include technical details and practical insights.
```

## 🔧 Troubleshooting

### Common Issues

**Extension not working?**
- Make sure Developer mode is enabled in Chrome
- Try reloading the extension
- Check the browser console for errors

**Module not appearing?**
- Click the extension icon and enable "Enable Prompt Module"
- Refresh the page
- Check if the website is supported

**Prompts not intelligent enough?**
- Try changing the intelligence level to "Advanced" or "Expert"
- Visit different types of websites
- Check the context details in the module

### Debug Mode

Open the browser console (F12) and run:
```javascript
// Load debug functions
// Copy and paste the contents of debug.js into console

// Check extension status
nitroDebug.checkStatus()

// Test toggle functionality
nitroDebug.testToggle()

// Check current transparency
nitroDebug.checkTransparency()
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/nitro-prompts-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/nitro-prompts-extension/discussions)
- **Email**: your-email@example.com

## 🙏 Acknowledgments

- Built with ❤️ for better AI interactions
- Inspired by the need for context-aware AI prompts
- Thanks to the Chrome Extensions community

---

**Made with ❤️ by [Your Name]**

[Download Latest Release](https://github.com/yourusername/nitro-prompts-extension/releases/latest) | [Report Bug](https://github.com/yourusername/nitro-prompts-extension/issues) | [Request Feature](https://github.com/yourusername/nitro-prompts-extension/issues/new) 