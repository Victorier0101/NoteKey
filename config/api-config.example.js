// API Configuration
// Copy this file to api-config.js and add your actual API key

const API_CONFIG = {
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
  GEMINI_MODEL: 'gemini-2.5-flash',
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1/'
};

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}

