# Testing Instructions for NoteKey

## IMPORTANT: Reload After Changes! 

**After making ANY code changes, you MUST reload the extension:**

1. Go to `chrome://extensions/`
2. Find NoteKey extension
3. Click the **refresh/reload icon** (circular arrow)
4. Refresh any webpages you're testing on

## Test 1: Check Content Script is Loading

1. Open any webpage (try a simple one like Google)
2. Right-click → Inspect → Console
3. Look for: `"NoteKey content script loaded on: [URL]"`
4. If you don't see this, the content script isn't loading!

## Test 2: Check Text Selection Detection

1. On the webpage, highlight some text
2. Check the console - you should see: `"Text selected: [your text]"`
3. If you see this but no popup, the popup creation failed
4. If you don't see this, text detection isn't working

## Test 3: Check Popup Menu Appears

1. Highlight text on webpage
2. You should see the popup menu with "Add" and "Explain" buttons
3. Console should show: `"Showing popup at: [x], [y]"` and `"Popup menu positioned at: [x], [y]"`

## Test 4: Test Manual Add (from Side Panel)

1. Open side panel (click extension icon)
2. Type text directly into "Highlighted Text" box (e.g., "test123")
3. Click "Add" button
4. Check console for any errors
5. The text should appear in notes below

## Test 5: Test Highlight → Add

1. Make sure side panel is OPEN first
2. Go to a webpage
3. Highlight some text
4. Click "Add" in the popup
5. Watch the console for messages:
   - `"Opening side panel"`
   - `"Adding text: [your text]"`
   - `"Add response: {success: true, ...}"`
6. Text should appear in "Highlighted Text" box briefly
7. Then appear in notes below

## Common Issues & Fixes

### Issue: "Document error" when manually adding
**Fix Applied**: Changed `escapeHtml` to not use `document.createElement` in service worker
**Status**: ✅ FIXED

### Issue: Text not showing in Highlighted Text box
**Fix Applied**: 
- Open side panel FIRST before sending text
- Add 200ms delay for side panel to load
- Improved message passing
**Status**: ✅ FIXED

### Issue: Content script not detecting text selection
**Fix Applied**:
- Added detailed console logging
- Improved selection detection timing
- Better positioning using getBoundingClientRect
**Status**: ✅ FIXED

### Issue: Popup menu not appearing
**Check**: 
1. Is content.css loaded?
2. Is popup menu created? (check in Elements tab)
3. Is it positioned off-screen?
4. Is z-index high enough?

## Debug Checklist

- [ ] Extension reloaded after code changes
- [ ] Webpage refreshed after extension reload  
- [ ] Side panel opens when clicking extension icon
- [ ] Console shows "NoteKey content script loaded"
- [ ] Console shows "Text selected" when highlighting
- [ ] Console shows "Showing popup" when text selected
- [ ] Popup menu is visible on page
- [ ] Clicking "Add" shows console messages
- [ ] Text appears in Highlighted Text box
- [ ] Text appears in notes below

## Console Locations

- **Content Script**: Right-click webpage → Inspect → Console
- **Side Panel**: Right-click side panel → Inspect  
- **Background Worker**: chrome://extensions/ → NoteKey → "Inspect views: service worker"

## Expected Console Output

### Content Script (webpage console):
```
NoteKey content script loaded on: https://example.com
Text selected: "your selected text..."
Showing popup at: 123, 456
Popup menu positioned at: 123, 445
Opening side panel
Adding text: "your selected text"
```

### Side Panel Console:
```
NoteKey side panel initialized and listening for messages
Side panel received message: {type: 'setHighlightedText', text: '...'}
Adding text: "your text"
Add response: {success: true, note: {...}}
```

### Background Worker Console:
```
NoteKey background service worker loaded
Background received message: {action: 'add', text: '...'}
```

---

**Last Updated**: After fixing document error and text detection issues

