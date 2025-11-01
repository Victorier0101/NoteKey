# NoteKey Setup Guide

## Quick Start (5 minutes)

### Step 1: Generate Icons (2 minutes)

1. Open `icons/generate-icons.html` in your browser
2. Click "Download All" button
3. Save the three files as:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
4. Move all three files into the `icons/` directory

### Step 2: Add Your Gemini API Key (1 minute)

1. Get your free API key from: https://makersuite.google.com/app/apikey
2. Open `config/api-config.js`
3. Replace the empty string with your API key:
   ```javascript
   GEMINI_API_KEY: 'YOUR_KEY_HERE',
   ```
4. Save the file

### Step 3: Load Extension in Chrome (2 minutes)

1. Open Chrome and go to: `chrome://extensions/`
2. Turn on "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `NoteKey` folder
5. Done! The extension is now active

## Testing the Extension

### Test 1: Highlight Text
1. Go to any webpage (try Wikipedia)
2. Highlight some text
3. You should see a popup with "Add" and "Explain" buttons

### Test 2: Add to Notes
1. Click "Add" button
2. The text should be copied to your notes
3. The side panel should open automatically

### Test 3: Get AI Explanation
1. Highlight different text
2. Click "Explain" button
3. Wait a few seconds
4. AI explanation should appear in your notes

### Test 4: Note Management
1. Click the NoteKey icon in Chrome toolbar to open side panel
2. Try creating a new note (+ button)
3. Try switching between notes (dropdown)
4. Try renaming a note (click the title)
5. Try deleting a note (trash icon)

## Troubleshooting

### Icons Not Loading
**Error:** Extension fails to load with icon errors

**Solution:**
1. Make sure all three icon files exist in `icons/` directory
2. Files must be named exactly: `icon16.png`, `icon48.png`, `icon128.png`
3. Use the `generate-icons.html` tool if you haven't created them yet

### API Key Not Working
**Error:** "API key not configured" or "Invalid API key"

**Solution:**
1. Verify you copied the entire API key (no spaces)
2. Make sure you edited `config/api-config.js` (not the example file)
3. Reload the extension after adding the key:
   - Go to `chrome://extensions/`
   - Click the refresh icon on NoteKey

### Side Panel Not Opening
**Error:** Nothing happens when clicking extension icon

**Solution:**
1. Check Chrome version (needs 114+)
2. Check for errors:
   - Go to `chrome://extensions/`
   - Click "Errors" button on NoteKey
3. Try reloading the extension

### Popup Not Appearing on Text Selection
**Error:** No popup when highlighting text

**Solution:**
1. Check browser console (F12) for errors
2. Verify content script loaded:
   - Right-click page → Inspect → Console
   - Look for "NoteKey content script loaded"
3. Try refreshing the webpage

### AI Explanations Fail
**Error:** "AI request failed" or "No internet connection"

**Solutions:**
- Check your internet connection
- Verify API key is correct
- Check if you've exceeded Gemini's rate limits (wait a few minutes)
- Try with shorter text selections

## File Checklist

Before loading the extension, verify these files exist:

### Required Files
- [ ] `manifest.json`
- [ ] `background.js`
- [ ] `config/api-config.js` (with your API key)
- [ ] `content/content.js`
- [ ] `content/content.css`
- [ ] `sidepanel/sidepanel.html`
- [ ] `sidepanel/sidepanel.js`
- [ ] `sidepanel/sidepanel.css`
- [ ] `utils/storage.js`
- [ ] `utils/gemini-service.js`
- [ ] `icons/icon16.png`
- [ ] `icons/icon48.png`
- [ ] `icons/icon128.png`

### Optional Files
- [ ] `.gitignore` (if using Git)
- [ ] `README.md`
- [ ] `config/api-config.example.js` (template)

## Security Notes

### API Key Security
- ⚠️ Never commit your API key to Git
- ✅ `config/api-config.js` is in `.gitignore`
- ✅ Use `api-config.example.js` as a template for sharing

### Storage
- All notes stored locally in Chrome
- No cloud synchronization
- Notes persist until you uninstall the extension or clear browser data

## Next Steps

After successful setup:

1. **Customize**: Edit the CSS files to match your preferences
2. **Learn**: Try the extension on different websites
3. **Organize**: Create multiple notes for different subjects
4. **Format**: Experiment with rich text formatting (Bold, Italic, Underline)

## Getting Help

If you encounter issues:

1. Check the main `README.md` file
2. Review the `AISPEC.md` for technical details
3. Check browser console for error messages
4. Verify all files are present and correctly named

## Useful Chrome URLs

- Extensions page: `chrome://extensions/`
- Extension errors: Click "Errors" button on your extension
- Service worker console: Click "Inspect views: service worker"

---

**Ready to start learning with NoteKey! 🚀**

