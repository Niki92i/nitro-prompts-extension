#!/bin/bash

# Package Nitro Prompts Extension for Distribution
echo "🚀 Packaging Nitro Prompts Extension..."

# Create distribution directory
mkdir -p dist/nitro-prompts-extension

# Copy all extension files
cp manifest.json dist/nitro-prompts-extension/
cp popup.html dist/nitro-prompts-extension/
cp popup.js dist/nitro-prompts-extension/
cp popup.css dist/nitro-prompts-extension/
cp content.js dist/nitro-prompts-extension/
cp content.css dist/nitro-prompts-extension/
cp background.js dist/nitro-prompts-extension/
cp settings.html dist/nitro-prompts-extension/
cp settings.js dist/nitro-prompts-extension/
cp settings.css dist/nitro-prompts-extension/
cp welcome.html dist/nitro-prompts-extension/
cp welcome.css dist/nitro-prompts-extension/
cp ai-service.js dist/nitro-prompts-extension/
cp README.md dist/nitro-prompts-extension/
cp INSTALLATION.md dist/nitro-prompts-extension/
cp GEMINI_SETUP.md dist/nitro-prompts-extension/

# Copy icons (if they exist)
if [ -d "icons" ]; then
    cp -r icons dist/nitro-prompts-extension/
fi

# Create ZIP file
cd dist
zip -r nitro-prompts-extension.zip nitro-prompts-extension/
cd ..

echo "✅ Extension packaged successfully!"
echo "📁 Distribution files created in: dist/"
echo "📦 ZIP file: dist/nitro-prompts-extension.zip" 