// Loveble.dev Configuration
module.exports = {
  // Your Loveble.dev project configuration
  projectId: process.env.LOVEBLE_PROJECT_ID,
  apiKey: process.env.LOVEBLE_API_KEY,
  environment: process.env.LOVEBLE_ENVIRONMENT || 'development',
  
  // API endpoints configuration
  api: {
    baseUrl: 'https://api.loveble.dev',
    version: 'v1'
  },
  
  // Database configuration (if using Loveble.dev database)
  database: {
    url: process.env.DATABASE_URL
  },
  
  // Authentication configuration
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL
  }
}; 