# NoteKey - Academic Assistant Chrome Extension

An AI-powered note-taking Chrome extension that helps you learn and take notes while browsing. Highlight text on any webpage, get AI explanations using Google Gemini, and organize your notes with rich text editing.

## Features

- 📝 **Text Highlighting**: Select text on any webpage and instantly add it to your notes
- 🤖 **AI Explanations**: Get concise explanations of complex concepts using Google Gemini
- ✏️ **Rich Text Editing**: Format your notes with bold, italic, and underline
- 📚 **Multiple Notes**: Create, manage, and switch between multiple note files
- 💾 **Auto-Save**: Notes are automatically saved to Chrome local storage
- 🎨 **Clean UI**: Beautiful side panel interface that overlays your browsing

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure the Extension

1. Open `config/api-config.js`
2. Replace the empty API key with your Gemini API key:
   ```javascript
   const API_CONFIG = {
     GEMINI_API_KEY: 'YOUR_API_KEY_HERE',
     GEMINI_MODEL: 'gemini-1.5-flash',
     API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/'
   };
   ```
3. Save the file

### 3. Add Icons

Add icon files to the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

See `icons/README.md` for more details.

### 4. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `NoteKey` directory
5. The extension should now appear in your extensions list

### 5. Start Using NoteKey

1. Navigate to any webpage
2. Highlight some text
3. Click "Add" to add it to your notes, or "Explain" to get an AI explanation
4. Click the NoteKey icon in the toolbar to open the side panel
5. Manage your notes, format text, and organize your learning!

## Project Structure

```
notekey-extension/
├── manifest.json                 # Extension configuration
├── background.js                 # Service worker
├── config/
│   ├── api-config.js            # API key configuration (gitignored)
│   └── api-config.example.js    # Example config file
├── content/
│   ├── content.js               # Text selection detection
│   └── content.css              # Popup menu styles
├── sidepanel/
│   ├── sidepanel.html           # Side panel UI
│   ├── sidepanel.js             # Side panel logic
│   └── sidepanel.css            # Side panel styles
├── utils/
│   ├── storage.js               # Chrome storage helpers
│   └── gemini-service.js        # Gemini API integration
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Usage Guide

### Highlighting and Adding Text

1. **Select text** on any webpage
2. A popup menu will appear with "Add" and "Explain" buttons
3. Click **"Add"** to copy the text directly to your notes as a bullet point
4. Click **"Explain"** to get an AI explanation that will be added to your notes

### Using the Side Panel

- **Open**: Click the NoteKey extension icon in Chrome toolbar
- **Highlighted Text Section**: Shows your most recent selection (editable)
- **Action Buttons**: Add or explain the highlighted text
- **Note Selection**: Dropdown to switch between notes
- **New Note**: Click the "+" button to create a new note
- **Delete Note**: Click the trash icon to delete the current note
- **Rich Text Editor**: Type and format your notes with Bold (B), Italic (I), Underline (U)

### Managing Notes

- **Create**: Click the "+" button next to the note dropdown
- **Rename**: Click the note title at the top
- **Delete**: Click the trash icon (requires confirmation)
- **Switch**: Select a different note from the dropdown
- **Auto-save**: All changes are automatically saved

## Keyboard Shortcuts

In the notes editor:
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline

## Troubleshooting

### Extension won't load
- Make sure all icon files are present in the `icons/` directory
- Check the Chrome extensions page for error messages

### AI explanations not working
- Verify your Gemini API key is correctly set in `config/api-config.js`
- Check your internet connection
- Ensure you haven't exceeded the Gemini API rate limits

### Side panel not opening
- Make sure you're using Chrome version 114 or higher
- Try clicking the extension icon in the toolbar
- Check for any browser console errors

### Notes not saving
- Check available storage space
- Chrome local storage has a 10MB limit
- Try clearing some old notes if storage is full

## Privacy & Security

- **Local Storage**: All notes are stored locally in Chrome's storage
- **No Cloud Sync**: Notes are not synced to any cloud service
- **API Key**: Your Gemini API key is stored locally and never shared
- **No Tracking**: The extension does not collect or transmit any usage data

## Future Features

- 🌐 Translation feature
- 📄 Export notes as PDF/Word
- 🔍 Search across all notes
- 🏷️ Tags and folders
- 💬 AI conversation (follow-up questions)
- 🔗 Source metadata tracking

## Development

### Requirements
- Chrome 114+ (for side panel API)
- Google Gemini API key

### File Watching
This extension uses plain JavaScript without a build process. Changes to files require reloading the extension:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the NoteKey extension

### Debugging
- **Content Script**: Right-click on webpage → Inspect → Console
- **Side Panel**: Right-click on side panel → Inspect
- **Background Worker**: `chrome://extensions/` → NoteKey → "Inspect views: service worker"

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## License

This project is for educational purposes. Please ensure you comply with Google's Gemini API terms of service.

## Credits

- Built following Chrome Extension Manifest V3 standards
- Powered by Google Gemini AI API
- Inspired by academic note-taking needs

---

**Happy Learning! 📚✨**

