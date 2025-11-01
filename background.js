// Background Service Worker for NoteKey Extension

// Import API configuration
importScripts('config/api-config.js');
importScripts('utils/storage.js');
importScripts('utils/gemini-service.js');

// Initialize Gemini service with API key on startup
console.log('Background worker starting...');
console.log('API Key present:', !!API_CONFIG.GEMINI_API_KEY);
console.log('API Model:', API_CONFIG.GEMINI_MODEL);

if (API_CONFIG.GEMINI_API_KEY) {
  GeminiService.init(API_CONFIG.GEMINI_API_KEY);
  console.log('✅ GeminiService initialized with API key');
} else {
  console.error('❌ No API key found in config!');
}

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('NoteKey extension installed');
  await StorageHelper.initialize();
  
  // Re-initialize Gemini service with API key (just in case)
  if (API_CONFIG.GEMINI_API_KEY) {
    GeminiService.init(API_CONFIG.GEMINI_API_KEY);
    console.log('✅ GeminiService re-initialized on install');
  }
});

// Handle clicks on extension icon
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Message handler for communication between components
// Note: This listener is registered once when the service worker starts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message.action, 'from:', sender.tab ? 'content script' : 'side panel');

  // Handle async operations
  handleMessage(message, sender, sendResponse);
  return true; // Keep the message channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
      case 'add':
        await handleAddText(message.text, sendResponse);
        break;
      
      case 'explain':
        await handleExplainText(message.text, sendResponse);
        break;
      
      case 'setHighlightedText':
        // Forward directly to side panel
        notifySidePanel({ type: 'setHighlightedText', text: message.text });
        sendResponse({ success: true });
        break;
      
      case 'createNote':
        await handleCreateNote(sendResponse);
        break;
      
      case 'deleteNote':
        await handleDeleteNote(message.noteId, sendResponse);
        break;
      
      case 'renameNote':
        await handleRenameNote(message.noteId, message.newTitle, sendResponse);
        break;
      
      case 'updateNote':
        await handleUpdateNote(message.noteId, message.content, sendResponse);
        break;
      
      case 'switchNote':
        await handleSwitchNote(message.noteId, sendResponse);
        break;
      
      case 'getActiveNote':
        await handleGetActiveNote(sendResponse);
        break;
      
      case 'getAllNotes':
        await handleGetAllNotes(sendResponse);
        break;
      
      case 'openSidePanel':
        await handleOpenSidePanel(sender, sendResponse);
        break;
      
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle adding text to notes (from side panel Add button)
let lastAddTextRequest = { text: '', time: 0 };
const ADD_TEXT_DEBOUNCE = 1500; // 1.5 seconds

async function handleAddText(text, sendResponse) {
  try {
    // Prevent duplicate adds of the same text within debounce window
    const now = Date.now();
    if (lastAddTextRequest.text === text && (now - lastAddTextRequest.time) < ADD_TEXT_DEBOUNCE) {
      console.log('⚠️ Duplicate add text request blocked');
      sendResponse({ success: false, error: 'Duplicate request' });
      return;
    }
    
    lastAddTextRequest = { text, time: now };
    console.log('✅ Processing add text request');
    
    const activeNoteId = await StorageHelper.getActiveNoteId();
    const note = await StorageHelper.getNote(activeNoteId);
    
    if (!note) {
      sendResponse({ success: false, error: 'No active note found' });
      return;
    }
    
    // Add text as a bullet point
    const bulletPoint = `<li>${escapeHtml(text)}</li>`;
    const newContent = note.content ? note.content + bulletPoint : `<ul>${bulletPoint}</ul>`;
    
    const updatedNote = await StorageHelper.updateNote(activeNoteId, { content: newContent });
    
    // Notify side panel that note was updated
    notifySidePanel({ type: 'noteUpdated', note: updatedNote });
    
    // Clear highlighted text after adding
    setTimeout(() => {
      notifySidePanel({ type: 'clearHighlightedText' });
    }, 500);
    
    sendResponse({ success: true, note: updatedNote });
  } catch (error) {
    console.error('Error adding text:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle explaining text with AI (from side panel Explain button)
let lastExplainTextRequest = { text: '', time: 0 };
const EXPLAIN_TEXT_DEBOUNCE = 2000; // 2 seconds

async function handleExplainText(text, sendResponse) {
  try {
    // Prevent duplicate explains of the same text within debounce window
    const now = Date.now();
    if (lastExplainTextRequest.text === text && (now - lastExplainTextRequest.time) < EXPLAIN_TEXT_DEBOUNCE) {
      console.log('⚠️ Duplicate explain text request blocked');
      sendResponse({ success: false, error: 'Duplicate request' });
      return;
    }
    
    lastExplainTextRequest = { text, time: now };
    console.log('✅ Processing explain text request');
    
    // Check if API key is configured
    if (!API_CONFIG.GEMINI_API_KEY) {
      notifySidePanel({ type: 'error', error: 'API key not configured. Please add your Gemini API key to config/api-config.js' });
      sendResponse({ 
        success: false, 
        error: 'API key not configured. Please add your Gemini API key to config/api-config.js' 
      });
      return;
    }
    
    // Notify side panel that explanation is loading
    notifySidePanel({ type: 'explanationLoading' });
    
    // Get explanation from Gemini
    const explanation = await GeminiService.getExplanation(text);
    
    // Get active note and add explanation
    const activeNoteId = await StorageHelper.getActiveNoteId();
    const note = await StorageHelper.getNote(activeNoteId);
    
    if (!note) {
      sendResponse({ success: false, error: 'No active note found' });
      return;
    }
    
    // Format explanation as one bullet point
    const explanationHtml = `<li><strong>Text:</strong> ${escapeHtml(text)} | <strong>Explanation:</strong> ${escapeHtml(explanation)}</li>`;
    
    const newContent = note.content ? note.content + explanationHtml : explanationHtml;
    const updatedNote = await StorageHelper.updateNote(activeNoteId, { content: newContent });
    
    // Notify side panel with explanation
    notifySidePanel({ 
      type: 'explanationComplete', 
      explanation: explanation,
      note: updatedNote 
    });
    
    // Clear highlighted text after explanation is complete
    setTimeout(() => {
      notifySidePanel({ type: 'clearHighlightedText' });
    }, 500);
    
    sendResponse({ success: true, explanation: explanation, note: updatedNote });
  } catch (error) {
    console.error('Error explaining text:', error);
    const errorMessage = GeminiService.getErrorMessage(error);
    
    // Notify side panel of error
    notifySidePanel({ type: 'error', error: errorMessage });
    
    sendResponse({ success: false, error: errorMessage });
  }
}

// Handle creating a new note
// Global debounce for note creation
let lastNoteCreationTime = 0;
const NOTE_CREATION_DEBOUNCE = 2000; // 2 seconds

async function handleCreateNote(sendResponse) {
  try {
    // Aggressive debouncing - prevent multiple creations within 2 seconds
    const now = Date.now();
    if (now - lastNoteCreationTime < NOTE_CREATION_DEBOUNCE) {
      console.log('⚠️ Note creation blocked - too soon since last creation');
      sendResponse({ success: false, error: 'Please wait before creating another note' });
      return;
    }
    
    lastNoteCreationTime = now;
    console.log('✅ Creating new note...');
    
    const newNote = {
      id: now.toString(),
      title: 'Untitled Note',
      created: now,
      lastModified: now,
      content: ''
    };
    
    await StorageHelper.saveNote(newNote);
    await StorageHelper.setActiveNoteId(newNote.id);
    
    console.log('✅ Note created successfully:', newNote.id);
    
    // Notify side panel
    notifySidePanel({ type: 'noteCreated', note: newNote });
    
    sendResponse({ success: true, note: newNote });
  } catch (error) {
    console.error('Error creating note:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle deleting a note
async function handleDeleteNote(noteId, sendResponse) {
  try {
    const notes = await StorageHelper.getAllNotes();
    
    if (notes.length <= 1) {
      sendResponse({ success: false, error: 'Cannot delete the last note' });
      return;
    }
    
    await StorageHelper.deleteNote(noteId);
    
    // If deleted note was active, switch to another note
    const activeNoteId = await StorageHelper.getActiveNoteId();
    if (activeNoteId === noteId) {
      const remainingNotes = await StorageHelper.getAllNotes();
      if (remainingNotes.length > 0) {
        await StorageHelper.setActiveNoteId(remainingNotes[0].id);
      }
    }
    
    // Notify side panel
    notifySidePanel({ type: 'noteDeleted', noteId: noteId });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle renaming a note
async function handleRenameNote(noteId, newTitle, sendResponse) {
  try {
    const updatedNote = await StorageHelper.updateNote(noteId, { title: newTitle });
    
    // Notify side panel
    notifySidePanel({ type: 'noteRenamed', note: updatedNote });
    
    sendResponse({ success: true, note: updatedNote });
  } catch (error) {
    console.error('Error renaming note:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle updating note content
async function handleUpdateNote(noteId, content, sendResponse) {
  try {
    const updatedNote = await StorageHelper.updateNote(noteId, { content: content });
    sendResponse({ success: true, note: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle switching active note
async function handleSwitchNote(noteId, sendResponse) {
  try {
    await StorageHelper.setActiveNoteId(noteId);
    const note = await StorageHelper.getNote(noteId);
    
    // Notify side panel
    notifySidePanel({ type: 'noteSwitched', note: note });
    
    sendResponse({ success: true, note: note });
  } catch (error) {
    console.error('Error switching note:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle getting active note
async function handleGetActiveNote(sendResponse) {
  try {
    const activeNoteId = await StorageHelper.getActiveNoteId();
    const note = await StorageHelper.getNote(activeNoteId);
    sendResponse({ success: true, note: note });
  } catch (error) {
    console.error('Error getting active note:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle getting all notes
async function handleGetAllNotes(sendResponse) {
  try {
    const notes = await StorageHelper.getAllNotes();
    sendResponse({ success: true, notes: notes });
  } catch (error) {
    console.error('Error getting all notes:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle opening side panel
async function handleOpenSidePanel(sender, sendResponse) {
  try {
    if (sender.tab) {
      await chrome.sidePanel.open({ windowId: sender.tab.windowId });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No tab context' });
    }
  } catch (error) {
    console.error('Error opening side panel:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Notify side panel of updates
async function notifySidePanel(message) {
  try {
    // Try to send message to all extension contexts
    await chrome.runtime.sendMessage(message);
  } catch (err) {
    // Side panel might not be open, which is fine
    console.log('Could not send to side panel:', err.message);
  }
  
  // Also try to get all views and send directly
  try {
    const views = chrome.extension.getViews({ type: 'tab' });
    views.forEach(view => {
      if (view.location.href.includes('sidepanel.html')) {
        // Found the side panel, send message directly
        if (view.handleBackgroundMessage) {
          view.handleBackgroundMessage(message, {}, () => {});
        }
      }
    });
  } catch (err) {
    console.log('Could not send directly to side panel:', err.message);
  }
}

// Utility function to escape HTML (service worker safe - no document object)
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

console.log('NoteKey background service worker loaded');

