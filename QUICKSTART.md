# NoteKey Quick Start Guide

## 🚀 3-Step Setup (5 minutes)

### 1️⃣ Generate Icons
```bash
Open: icons/generate-icons.html in browser
Click: "Download All"
Save: All 3 PNG files to icons/ folder
```

### 2️⃣ Add API Key
```javascript
File: config/api-config.js
Add: Your Gemini API key
Get key from: https://makersuite.google.com/app/apikey
```

### 3️⃣ Load Extension
```
Chrome: chrome://extensions/
Enable: Developer mode
Click: Load unpacked
Select: NoteKey folder
```

---

## 📖 How to Use

### Highlight & Add
1. **Select** text on any webpage
2. **Click** "Add" in popup
3. **Done** - text appears in notes as bullet point

### Highlight & Explain
1. **Select** text on any webpage
2. **Click** "Explain" in popup
3. **Wait** 2-3 seconds for AI explanation
4. **Done** - explanation appears in notes

### Manage Notes
- **New Note**: Click `+` button
- **Switch Note**: Use dropdown menu
- **Rename**: Click note title
- **Delete**: Click 🗑 icon
- **Format**: Use B, I, U buttons

---

## 🎯 Key Features

✅ Text highlighting on any webpage  
✅ AI-powered explanations  
✅ Multiple notes support  
✅ Rich text formatting (Bold, Italic, Underline)  
✅ Auto-save to local storage  
✅ Clean, modern UI  

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Icons missing | Use `icons/generate-icons.html` |
| API not working | Check API key in `config/api-config.js` |
| Panel won't open | Requires Chrome 114+ |
| Popup not showing | Refresh webpage |

---

## 📁 File Structure

```
NoteKey/
├── manifest.json          # Extension config
├── background.js          # Service worker
├── config/
│   └── api-config.js     # Your API key here
├── content/
│   ├── content.js        # Text detection
│   └── content.css       # Popup styles
├── sidepanel/
│   ├── sidepanel.html    # UI structure
│   ├── sidepanel.js      # UI logic
│   └── sidepanel.css     # UI styles
├── utils/
│   ├── storage.js        # Storage helpers
│   └── gemini-service.js # AI integration
└── icons/
    ├── icon16.png        # Required
    ├── icon48.png        # Required
    └── icon128.png       # Required
```

---

## 📚 Additional Resources

- **Full Setup**: See `SETUP.md`
- **All Features**: See `FEATURES.md`
- **Technical Spec**: See `AISPEC.md`
- **Main README**: See `README.md`

---

## ⚡ Pro Tips

1. **Edit before explaining**: Click in the highlighted text box to add context before hitting Explain
2. **Keyboard shortcuts**: Ctrl/Cmd + B/I/U for formatting
3. **Multiple subjects**: Create separate notes for different topics
4. **Rename notes**: Click the title to give your notes meaningful names

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Review `SETUP.md` for detailed troubleshooting
3. Verify all files are present and named correctly
4. Make sure Chrome is version 114 or higher

---

**Ready to enhance your learning! 📚✨**

