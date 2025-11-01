# NoteKey - Academic Assistant Chrome Extension
## AI-Powered Note-Taking & Learning Tool

---

## 1. Overview

**NoteKey** is a Chrome extension that helps users learn and take notes while browsing the web. Users can highlight text on any webpage, get AI-powered explanations using Google Gemini, and organize their notes in a side panel.

### Core Features (MVP)
- Text highlighting with popup action menu (Add, Explain)
- AI-powered explanations via Google Gemini API
- Side panel with editable highlighted text section
- Rich text note editing with formatting options
- Multiple notes management (create, rename, delete, switch between notes)
- Auto-save to Chrome local storage

### Future Features (Not in MVP)
- Translation functionality
- PDF/Word export
- Triangle toggle button for side panel
- Source metadata tracking
- AI conversation/follow-up questions

---

## 2. File Structure

```
notekey-extension/
├── manifest.json                 # Extension configuration (Manifest V3)
│
├── background.js                 # Service worker - handles API calls & coordination
│
├── content/
│   ├── content.js               # Text selection detection & popup menu
│   └── content.css              # Styles for text selection popup menu
│
├── sidepanel/
│   ├── sidepanel.html           # Main UI structure
│   ├── sidepanel.js             # Notes management & UI logic
│   └── sidepanel.css            # Side panel styling
│
├── utils/
│   ├── storage.js               # Chrome storage API helpers
│   ├── gemini-service.js        # Gemini API integration wrapper
│   └── rich-text-editor.js      # Rich text editing utilities
│
├── config/
│   └── api-config.js            # API keys and configuration
│
└── icons/
    ├── icon16.png               # Toolbar icon (16x16)
    ├── icon48.png               # Extension management (48x48)
    └── icon128.png              # Chrome Web Store (128x128)
```

---

## 3. Architecture

### Component Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
└─────────────────┬───────────────────────────┬────────────────┘
                  │                           │
        ┌─────────▼──────────┐      ┌────────▼─────────────┐
        │  Content Script    │      │   Side Panel         │
        │  (Webpage Layer)   │      │   (Main UI)          │
        │  - Text detection  │      │  ┌────────────────┐  │
        │  - Popup menu      │      │  │ Highlighted    │  │
        │    (Add/Explain)   │      │  │ Text Section   │  │
        └─────────┬──────────┘      │  │ (Editable)     │  │
                  │                 │  └────────────────┘  │
                  │                 │  ┌────────────────┐  │
                  │                 │  │ Note Selection │  │
                  │                 │  │ & Management   │  │
                  │                 │  └────────────────┘  │
                  │                 │  ┌────────────────┐  │
                  │                 │  │ Rich Text      │  │
                  │                 │  │ Notes Editor   │  │
                  │                 │  └────────────────┘  │
                  │                 └────────┬─────────────┘
                  │                          │
                  │    Chrome Message API    │
                  │         (runtime)        │
                  └───────────┬──────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Background Worker  │
                    │  (Service Worker)  │
                    │  - API calls       │
                    │  - Message routing │
                    │  - Logic layer     │
                    │  - Error handling  │
                    └─────────┬──────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────────┐ ┌──▼────────┐
        │ Chrome       │ │  Gemini    │ │  Config   │
        │ Storage API  │ │  API       │ │  (API Key)│
        │ (Local)      │ │ (Free tier)│ │           │
        └──────────────┘ └────────────┘ └───────────┘
```

### Architecture Explanation

**Client-Side Only**: Everything runs in Chrome browser, no traditional backend.

- **Content Script**: Runs on every webpage, detects text selection, shows popup menu
- **Side Panel**: Main UI with three sections (Highlighted Text → Note Selection → Notes Editor)
- **Background Worker**: Handles Gemini API calls, message routing, storage operations
- **Communication**: Chrome's message passing API (runtime.sendMessage/onMessage)
- **Storage**: Chrome's local storage API (chrome.storage.local)
- **AI Service**: Google Gemini API with developer-provided API key
- **Error Handling**: Network failures and API errors displayed in UI

---

## 4. User Flow Diagrams

### Flow 1: Highlight → Add to Notes
```
User highlights text on webpage
         ↓
Content script detects selection
         ↓
Popup menu appears near selection (Add | Explain buttons)
         ↓
User clicks "Add"
         ↓
Content script → Background worker
    (sends: { action: 'add', text: '...' })
         ↓
Text appears in "Highlighted Text" section in side panel
         ↓
Background worker adds to active note as bullet point
         ↓
Updates Chrome storage
         ↓
Background worker → Side panel
    (notifies: note updated)
         ↓
Notes editor shows new bullet point:
    - New text added
         ↓
Highlighted Text section clears
         ↓
Auto-saved to storage
```

### Flow 2: Highlight → Explain
```
User highlights text on webpage
         ↓
Content script detects selection
         ↓
Popup menu appears (Add | Explain)
         ↓
User clicks "Explain"
         ↓
Content script → Background worker
    (sends: { action: 'explain', text: '...' })
         ↓
Text appears in "Highlighted Text" section (editable)
         ↓
[OPTIONAL] User edits text to add context
         ↓
User clicks "Explain" button in side panel
         ↓
Side panel shows loading indicator
         ↓
Background worker calls Gemini API
    (sends highlighted/edited text with prompt for concise explanation)
         ↓
Gemini returns explanation
         ↓
Background worker → Side panel
    (sends explanation text)
         ↓
Explanation added to notes as formatted text:
    - Original highlighted text
    - Short, concise AI explanation
         ↓
Highlighted Text section clears
         ↓
Auto-saved to storage
```

### Flow 3: Error Handling
```
Background worker calls Gemini API
         ↓
API call fails (network error or API error)
         ↓
Background worker detects error type:
    - Network timeout → "No internet connection"
    - API error → "AI request failed"
         ↓
Background worker → Side panel
    (sends: { error: true, message: '...' })
         ↓
Side panel displays error message in UI
         ↓
User can retry or cancel
```

### Flow 4: Create New Note
```
User clicks "+ New Note" button (next to Note Selection dropdown)
         ↓
Side panel → Background worker
    (sends: { action: 'createNote' })
         ↓
Background worker creates new note object:
    {
      id: timestamp,
      title: 'Untitled Note',
      created: Date.now(),
      content: ''  // Rich text HTML
    }
         ↓
Sets as active note
         ↓
Saves to Chrome storage
         ↓
Background worker → Side panel
    (sends: new note data)
         ↓
Side panel updates:
    - Dropdown shows new note
    - Notes editor clears
    - Ready for new content
```

### Flow 5: Delete Note
```
User selects note from dropdown
         ↓
User clicks delete icon/button
         ↓
Confirmation prompt appears
         ↓
User confirms deletion
         ↓
Side panel → Background worker
    (sends: { action: 'deleteNote', noteId: '...' })
         ↓
Background worker removes note from storage
         ↓
Background worker → Side panel
    (sends: updated notes list)
         ↓
Side panel switches to another note or shows empty state
```

### Flow 6: Rename Note
```
User selects note from dropdown
         ↓
User clicks note title or rename option
         ↓
Title becomes editable (inline edit or modal)
         ↓
User types new name and confirms
         ↓
Side panel → Background worker
    (sends: { action: 'renameNote', noteId: '...', newTitle: '...' })
         ↓
Background worker updates note title in storage
         ↓
Background worker → Side panel
    (sends: updated note data)
         ↓
Dropdown and title update to show new name
```

### Flow 7: Edit Notes with Rich Text
```
User clicks in notes editor area
         ↓
Rich text toolbar is active (B, I, U buttons)
         ↓
User can:
    - Type freely
    - Apply formatting (bold, italic, underline)
    - Edit existing bullet points
    - Delete content
         ↓
On each change:
    Side panel → Background worker
    (sends: { action: 'updateNote', noteId: '...', content: '...' })
         ↓
Background worker saves to Chrome storage
         ↓
Auto-save complete
```

---

## 5. UI Specification

### Side Panel Layout

The side panel is approximately 400px wide and slides in from the right side of the browser window, overlaying the webpage content.

```
┌─────────────────────────────────────────┐
│ Note K                              ✕   │  ← Header (Note title + Close button)
├─────────────────────────────────────────┤
│                                         │
│ Highlighted Text:                       │  ← Section 1: Highlighted Text
│ ┌─────────────────────────────────────┐ │
│ │ "Enabling a person to discover or   │ │
│ │ learn something for themselves."    │ │  (Editable text area)
│ └─────────────────────────────────────┘ │
│                                         │
│  [+ Add]  [📖 Explain]  [🌐 Translate] │  ← Action buttons (only Add & Explain in MVP)
│                                         │
├─────────────────────────────────────────┤
│ Note Selection                          │  ← Section 2: Note Management
│ ┌──────────────────────────────┐ [+]   │
│ │ Chemistry File            ▼  │ [🗑]  │  ← Dropdown + New Note + Delete buttons
│ └──────────────────────────────┘       │
│                                         │
│ ┌──────────┐  B  I  U                  │  ← Rich text formatting toolbar
│ │ Lexend ▼ │                            │     (Font selector + Bold/Italic/Underline)
│ └──────────┘                            │
├─────────────────────────────────────────┤
│ Type your notes here...                 │  ← Section 3: Notes Editor (Scrollable)
│                                         │
│ - Enabling a person to discover or     │     (Rich text editor with bullet points)
│   learn something for themselves.       │
│                                         │
│ - Heuristic methods can be used to     │
│   speed up the process of finding a    │
│   satisfactory solution.                │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Section Breakdown

#### 1. Header
- **Note Title**: Currently selected note name (clickable to rename)
- **Close Button (✕)**: Closes the side panel

#### 2. Highlighted Text Section
- Displays the most recently highlighted text from the webpage
- Text is editable (user can add context before explaining)
- Shows italic text in light gray background
- Clears after "Add" or "Explain" action completes

#### 3. Action Buttons
**MVP Buttons:**
- **+ Add**: Copies highlighted text to notes as a new bullet point
- **📖 Explain**: Sends text to Gemini AI for explanation, adds result to notes

**Future Feature:**
- **🌐 Translate**: Translates highlighted text (not in MVP)

#### 4. Note Selection & Management
- **Dropdown Menu**: Lists all notes, click to switch between them
  - Shows current note name with down arrow (▼)
  - Click to see list of all notes
  - Can include rename option in dropdown menu
  
- **New Note Button (+)**: Creates a new blank note
  - Positioned to the right of dropdown
  - Generates default name like "Untitled Note"
  
- **Delete Button (🗑)**: Deletes current note
  - Shows confirmation dialog
  - Positioned to the right of New Note button

#### 5. Rich Text Toolbar
- **Font Selector**: Dropdown to choose font (e.g., "Lexend")
- **Bold (B)**: Toggle bold formatting
- **Italic (I)**: Toggle italic formatting  
- **Underline (U)**: Toggle underline formatting

#### 6. Notes Editor
- Main content area (scrollable)
- Rich text editing capabilities
- Content auto-saves to Chrome storage on changes
- Displays:
  - Bullet points for copied text
  - Formatted explanations from AI
  - User's manual edits and formatting

### Popup Menu (On Text Selection)

When user highlights text on a webpage, a small floating menu appears near the selection:

```
┌──────────────────────┐
│  + Add   📖 Explain  │
└──────────────────────┘
```

**Positioning:**
- Appears above and slightly to the right of selected text
- Follows standard tooltip positioning to avoid going off-screen
- Disappears if user clicks elsewhere or makes a new selection

---

## 6. Data Models

### Note Object
```javascript
{
  id: String,              // Unique identifier (timestamp or UUID)
  title: String,           // Note name (e.g., "Chemistry File")
  created: Number,         // Timestamp of creation
  lastModified: Number,    // Timestamp of last edit
  content: String          // Rich text HTML content
}
```

### Storage Structure
```javascript
{
  notes: [
    { id: '1234567890', title: 'Chemistry File', ... },
    { id: '1234567891', title: 'Physics Notes', ... }
  ],
  activeNoteId: String,    // Currently selected note ID
  settings: {
    defaultFont: 'Lexend',
    panelWidth: 400
  }
}
```

### Message Format (Chrome Runtime API)
```javascript
// From content script to background
{
  action: 'add' | 'explain',
  text: String,
  timestamp: Number
}

// From background to side panel
{
  type: 'noteUpdated' | 'explanation' | 'error',
  data: {
    noteId: String,
    content: String,
    error: String  // if type is 'error'
  }
}
```

---

## 7. AI Integration

### Gemini API Configuration

**API Provider**: Google Gemini API (Free Tier)
**Model**: gemini-1.5-flash or gemini-1.5-pro
**API Key**: Developer-provided (hardcoded in config/api-config.js)

### Explanation Prompt Template

```
You are an academic assistant helping a student understand concepts. 
Provide a SHORT and CONCISE explanation (2-3 sentences maximum) of the following text:

"{highlighted_text}"

Keep your response brief, clear, and educational. Focus on the key concept.
```

### Error Handling

**Network Errors:**
- Message: "No internet connection. Please check your network and try again."
- UI: Red banner at top of side panel with retry button

**API Errors:**
- Message: "AI request failed. Please try again later."
- UI: Red banner at top of side panel with retry button
- Log error to console for debugging

**Rate Limiting:**
- If Gemini API rate limit exceeded, show: "Too many requests. Please wait a moment."

---

## 8. Technical Implementation Notes

### Chrome Extension Manifest (V3)

Required permissions:
- `storage`: For chrome.storage.local API
- `scripting`: To inject content script
- `activeTab`: To access current tab content
- `sidePanel`: For side panel API (Chrome 114+)

### Content Script Injection

- Inject on all URLs (`<all_urls>`)
- Use `document_end` timing
- Detect text selection with `window.getSelection()`
- Position popup menu dynamically with element bounding box

### Rich Text Editor

**Options:**
1. ContentEditable div with execCommand() (simple, native)
2. Quill.js (feature-rich, maintained)
3. TipTap (modern, Vue/React friendly)

**Recommendation**: Start with ContentEditable for MVP, upgrade to Quill.js if needed

### Storage Quotas

- Chrome.storage.local limit: 10MB (synced storage is 100KB)
- Store notes as HTML strings
- Implement warning if approaching storage limit

### Special Characters Handling

- Use `textContent` instead of `innerHTML` for copying plain text
- Preserve Unicode characters properly
- Handle edge cases:
  - Mathematical symbols
  - Emoji
  - RTL languages
  - Code snippets with special chars

---

## 9. Future Enhancements (Post-MVP)

1. **Translation Feature**
   - Language selection dropdown
   - Support for 20+ common languages
   - Show original + translated text side-by-side

2. **Export Functionality**
   - PDF export (using jsPDF)
   - Word export (using docx.js)
   - Include formatting and preserve rich text

3. **Triangle Toggle Button**
   - Floating button fixed to right edge of screen
   - Smooth slide-in/out animation
   - Remember panel state across sessions

4. **Source Metadata Tracking**
   - Capture URL, page title, and timestamp
   - Display source links in notes
   - "Go to source" button for each highlight

5. **AI Conversations**
   - Follow-up questions feature
   - Threaded conversations per note
   - Chat history with context retention

6. **Advanced Organization**
   - Folders/categories for notes
   - Tags and labels
   - Search across all notes
   - Sort by date, title, or custom order

7. **Collaboration**
   - Share notes via link
   - Export to cloud storage (Google Drive, Dropbox)
   - Sync across devices

---

## 10. Development Phases

### Phase 1: MVP Core Features (Weeks 1-3)
- [ ] Basic Chrome extension setup with Manifest V3
- [ ] Content script for text selection detection
- [ ] Popup menu UI (Add, Explain buttons)
- [ ] Side panel HTML structure
- [ ] Chrome storage integration
- [ ] Note CRUD operations (Create, Read, Update, Delete)
- [ ] Gemini API integration
- [ ] Basic error handling

### Phase 2: UI Polish & Rich Text (Week 4)
- [ ] Rich text editor implementation
- [ ] Formatting toolbar (Bold, Italic, Underline)
- [ ] Font selector
- [ ] Improved styling and responsiveness
- [ ] Loading states and animations
- [ ] Visual feedback for actions

### Phase 3: Note Management (Week 5)
- [ ] Note dropdown functionality
- [ ] New Note button
- [ ] Delete Note with confirmation
- [ ] Rename Note feature
- [ ] Auto-save functionality
- [ ] Storage quota warnings

### Phase 4: Testing & Bug Fixes (Week 6)
- [ ] Cross-browser testing
- [ ] Edge case handling (special characters, long text)
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] User acceptance testing

### Phase 5: Future Features (Post-Launch)
- [ ] Translation feature
- [ ] Export to PDF/Word
- [ ] Triangle toggle button
- [ ] Source metadata tracking
- [ ] AI conversation feature
- [ ] Advanced organization (search, tags, folders)