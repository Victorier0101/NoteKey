// Side Panel JavaScript for NoteKey Extension

let currentNote = null;
let allNotes = [];
let isLoading = false;

// DOM Elements
const elements = {
  noteTitleInput: null,
  closeBtn: null,
  errorBanner: null,
  errorMessage: null,
  errorClose: null,
  highlightedText: null,
  addBtn: null,
  explainBtn: null,
  noteDropdown: null,
  newNoteBtn: null,
  deleteNoteBtn: null,
  fontSelector: null,
  formatBtns: null,
  notesEditor: null
};

// Prevent multiple initializations
let isInitialized = false;

// Initialize the side panel
async function init() {
  if (isInitialized) {
    console.log('⚠️ Side panel already initialized, skipping...');
    return;
  }
  
  console.log('NoteKey side panel initializing...');
  isInitialized = true;
  
  // Get DOM elements
  elements.noteTitleInput = document.getElementById('noteTitleInput');
  elements.closeBtn = document.getElementById('closeBtn');
  elements.errorBanner = document.getElementById('errorBanner');
  elements.errorMessage = document.getElementById('errorMessage');
  elements.errorClose = document.getElementById('errorClose');
  elements.highlightedText = document.getElementById('highlightedText');
  elements.addBtn = document.getElementById('addBtn');
  elements.explainBtn = document.getElementById('explainBtn');
  elements.noteDropdown = document.getElementById('noteDropdown');
  elements.newNoteBtn = document.getElementById('newNoteBtn');
  elements.deleteNoteBtn = document.getElementById('deleteNoteBtn');
  elements.fontSelector = document.getElementById('fontSelector');
  elements.formatBtns = document.querySelectorAll('.format-btn');
  elements.notesEditor = document.getElementById('notesEditor');
  
  // Attach event listeners
  attachEventListeners();
  
  // Load notes and active note
  await loadNotes();
  await loadActiveNote();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Side panel received message:', message);
    handleBackgroundMessage(message, sender, sendResponse);
    return true; // Keep message channel open for async responses
  });
  
  // Log that we're ready to receive messages
  console.log('NoteKey side panel initialized and listening for messages');
}

// Attach event listeners
function attachEventListeners() {
  // Close button
  elements.closeBtn.addEventListener('click', () => {
    window.close();
  });
  
  // Error close
  elements.errorClose.addEventListener('click', hideError);
  
  // Highlighted text input
  elements.highlightedText.addEventListener('input', handleHighlightedTextChange);
  
  // Action buttons
  elements.addBtn.addEventListener('click', handleAddClick);
  elements.explainBtn.addEventListener('click', handleExplainClick);
  
  // Note title input
  elements.noteTitleInput.addEventListener('keydown', handleTitleKeydown);
  elements.noteTitleInput.addEventListener('blur', handleTitleBlur);
  
  // Note management - use { once: false } but track if already added
  elements.noteDropdown.addEventListener('change', handleNoteSwitch);
  elements.renameNoteBtn = document.getElementById('renameNoteBtn');
  elements.renameNoteBtn.addEventListener('click', handleRenameClick);
  elements.newNoteBtn.addEventListener('click', handleNewNote);
  elements.deleteNoteBtn.addEventListener('click', handleDeleteNote);
  
  console.log('✅ Event listeners attached');
  
  // Font selector
  elements.fontSelector.addEventListener('change', handleFontChange);
  
  // Format buttons
  elements.formatBtns.forEach(btn => {
    btn.addEventListener('click', handleFormatClick);
  });
  
  // Notes editor
  elements.notesEditor.addEventListener('input', handleEditorChange);
  elements.notesEditor.addEventListener('paste', handlePaste);
}

// Load all notes from storage
async function loadNotes() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAllNotes' });
    if (response.success) {
      allNotes = response.notes;
      updateNoteDropdown();
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    showError('Failed to load notes');
  }
}

// Load active note
async function loadActiveNote() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getActiveNote' });
    if (response.success && response.note) {
      currentNote = response.note;
      displayNote(currentNote);
    }
  } catch (error) {
    console.error('Error loading active note:', error);
    showError('Failed to load active note');
  }
}

// Update note dropdown
function updateNoteDropdown() {
  if (!allNotes || allNotes.length === 0) {
    elements.noteDropdown.innerHTML = '<option value="">No notes</option>';
    return;
  }
  
  // Remove duplicates by note ID
  const uniqueNotes = [];
  const seenIds = new Set();
  
  for (const note of allNotes) {
    if (!seenIds.has(note.id)) {
      seenIds.add(note.id);
      uniqueNotes.push(note);
    }
  }
  
  // Update allNotes to only contain unique notes
  allNotes = uniqueNotes;
  
  elements.noteDropdown.innerHTML = allNotes.map(note => 
    `<option value="${note.id}" ${currentNote && note.id === currentNote.id ? 'selected' : ''}>
      ${escapeHtml(note.title)}
    </option>`
  ).join('');
}

// Display note content
function displayNote(note) {
  if (!note) return;
  
  currentNote = note;
  elements.noteTitleInput.value = note.title || 'Untitled Note';
  elements.notesEditor.innerHTML = note.content || '';
  
  // Update dropdown selection
  if (elements.noteDropdown.value !== note.id) {
    elements.noteDropdown.value = note.id;
  }
}

// Handle highlighted text change
function handleHighlightedTextChange() {
  const text = elements.highlightedText.textContent.trim();
  elements.addBtn.disabled = text.length === 0;
  elements.explainBtn.disabled = text.length === 0;
}

// Handle Add button click
let isAdding = false;
let addClickCount = 0;
async function handleAddClick(e) {
  addClickCount++;
  console.log(`🟢 handleAddClick called (call #${addClickCount})`, {
    isAdding,
    buttonDisabled: elements.addBtn.disabled,
    event: e?.type
  });
  
  const text = elements.highlightedText.textContent.trim();
  if (!text) {
    console.log('No text to add');
    return;
  }
  
  // Prevent duplicate adds
  if (isAdding) {
    console.log('⚠️ Already adding text, ignoring click');
    return;
  }
  
  console.log('📝 Adding text:', text.substring(0, 50) + '...');
  
  try {
    isAdding = true;
    isLoading = true;
    elements.addBtn.disabled = true;
    elements.addBtn.innerHTML = '<span class="loading-spinner"></span> Adding...';
    
    const response = await chrome.runtime.sendMessage({
      action: 'add',
      text: text
    });
    
    console.log('✅ Add response:', response.success);
    
    if (response && response.success) {
      displayNote(response.note);
      elements.highlightedText.textContent = '';
      handleHighlightedTextChange();
      
      // Show success briefly
      elements.addBtn.innerHTML = '✓ Added!';
      setTimeout(() => {
        elements.addBtn.innerHTML = '<span class="btn-icon">+</span> Add';
        elements.addBtn.disabled = false;
      }, 1500);
    } else {
      const errorMsg = response?.error || 'Failed to add text';
      console.error('Add failed:', errorMsg);
      showError(errorMsg);
      elements.addBtn.innerHTML = '<span class="btn-icon">+</span> Add';
      elements.addBtn.disabled = false;
    }
  } catch (error) {
    console.error('❌ Error adding text:', error);
    showError('Failed to add text: ' + error.message);
    elements.addBtn.innerHTML = '<span class="btn-icon">+</span> Add';
    elements.addBtn.disabled = false;
  } finally {
    setTimeout(() => {
      console.log('🔓 Unlocking add');
      isLoading = false;
      isAdding = false;
    }, 1500);
  }
}

// Handle Explain button click
let isExplaining = false;
let explainClickCount = 0;
async function handleExplainClick(e) {
  explainClickCount++;
  console.log(`🔵 handleExplainClick called (call #${explainClickCount})`, {
    isExplaining,
    buttonDisabled: elements.explainBtn.disabled,
    event: e?.type
  });
  
  const text = elements.highlightedText.textContent.trim();
  if (!text) return;
  
  // Prevent duplicate explains
  if (isExplaining) {
    console.log('⚠️ Already explaining text, ignoring click');
    return;
  }
  
  try {
    isExplaining = true;
    isLoading = true;
    elements.explainBtn.disabled = true;
    elements.explainBtn.innerHTML = '<span class="loading-spinner"></span> Explaining...';
    
    console.log('🤖 Requesting explanation for:', text.substring(0, 50) + '...');
    
    const response = await chrome.runtime.sendMessage({
      action: 'explain',
      text: text
    });
    
    console.log('✅ Explanation response:', response.success);
    
    if (response.success) {
      displayNote(response.note);
      elements.highlightedText.textContent = '';
      handleHighlightedTextChange();
      
      // Show success briefly
      elements.explainBtn.innerHTML = '✓ Explained!';
      setTimeout(() => {
        elements.explainBtn.innerHTML = '<span class="btn-icon">📖</span> Explain';
        elements.explainBtn.disabled = false;
      }, 1500);
    } else {
      showError(response.error || 'Failed to get explanation');
      elements.explainBtn.innerHTML = '<span class="btn-icon">📖</span> Explain';
      elements.explainBtn.disabled = false;
    }
  } catch (error) {
    console.error('❌ Error explaining text:', error);
    showError('Failed to get explanation');
    elements.explainBtn.innerHTML = '<span class="btn-icon">📖</span> Explain';
    elements.explainBtn.disabled = false;
  } finally {
    setTimeout(() => {
      console.log('🔓 Unlocking explain');
      isLoading = false;
      isExplaining = false;
    }, 1500);
  }
}

// Handle note switch
async function handleNoteSwitch(e) {
  const noteId = e.target.value;
  if (!noteId || noteId === currentNote?.id) return;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'switchNote',
      noteId: noteId
    });
    
    if (response.success) {
      displayNote(response.note);
    }
  } catch (error) {
    console.error('Error switching note:', error);
    showError('Failed to switch note');
  }
}

// Handle new note creation
let isCreatingNote = false;
let noteCreationCount = 0;
async function handleNewNote(e) {
  noteCreationCount++;
  console.log(`🔵 handleNewNote called (call #${noteCreationCount})`, {
    isCreatingNote,
    buttonDisabled: elements.newNoteBtn.disabled,
    event: e?.type
  });
  
  // Prevent double-clicking from creating multiple notes
  if (isCreatingNote) {
    console.log('⚠️ Already creating a note, ignoring click');
    return;
  }
  
  try {
    isCreatingNote = true;
    elements.newNoteBtn.disabled = true;
    
    console.log('📝 Sending createNote message to background...');
    const response = await chrome.runtime.sendMessage({ action: 'createNote' });
    
    if (response.success) {
      console.log('✅ Note created successfully:', response.note.id);
      
      // Check if note already exists in allNotes (prevent duplicates)
      const existingIndex = allNotes.findIndex(n => n.id === response.note.id);
      if (existingIndex === -1) {
        allNotes.push(response.note);
        console.log('Added note to allNotes array');
      } else {
        console.log('Note already exists in allNotes, skipping duplicate');
      }
      
      updateNoteDropdown();
      displayNote(response.note);
      
      // Focus and select the title input for immediate editing
      setTimeout(() => {
        elements.noteTitleInput.focus();
        elements.noteTitleInput.select();
      }, 100);
    } else {
      console.log('❌ Note creation failed:', response.error);
      if (response.error && !response.error.includes('too soon')) {
        showError(response.error);
      }
    }
  } catch (error) {
    console.error('❌ Error creating note:', error);
    showError('Failed to create note');
  } finally {
    setTimeout(() => {
      console.log('🔓 Unlocking note creation');
      isCreatingNote = false;
      elements.newNoteBtn.disabled = false;
    }, 2000); // Match the backend debounce time
  }
}

// Handle note deletion
async function handleDeleteNote() {
  if (!currentNote) return;
  
  // Confirm deletion
  const confirmed = confirm(`Are you sure you want to delete "${currentNote.title}"?`);
  if (!confirmed) return;
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'deleteNote',
      noteId: currentNote.id
    });
    
    if (response.success) {
      // Reload notes and switch to another note
      await loadNotes();
      await loadActiveNote();
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    showError('Failed to delete note');
  }
}

// Handle rename button click
function handleRenameClick() {
  // Focus and select the title input
  elements.noteTitleInput.focus();
  elements.noteTitleInput.select();
}

// Handle title input keydown (Enter to save)
function handleTitleKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    elements.noteTitleInput.blur(); // Trigger save by blurring
  } else if (e.key === 'Escape') {
    e.preventDefault();
    // Restore original title and blur
    if (currentNote) {
      elements.noteTitleInput.value = currentNote.title;
    }
    elements.noteTitleInput.blur();
  }
}

// Handle title input blur (save on blur)
function handleTitleBlur() {
  if (!currentNote) return;
  
  const newTitle = elements.noteTitleInput.value.trim();
  
  // If empty, restore original title
  if (!newTitle) {
    elements.noteTitleInput.value = currentNote.title;
    return;
  }
  
  // If changed, save it
  if (newTitle !== currentNote.title) {
    renameNote(currentNote.id, newTitle);
  }
}

// Rename note
async function renameNote(noteId, newTitle) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'renameNote',
      noteId: noteId,
      newTitle: newTitle
    });
    
    if (response.success) {
      currentNote = response.note;
      elements.noteTitleInput.value = newTitle;
      
      // Update in allNotes array
      const index = allNotes.findIndex(n => n.id === noteId);
      if (index !== -1) {
        allNotes[index] = response.note;
        updateNoteDropdown();
      }
    }
  } catch (error) {
    console.error('Error renaming note:', error);
    showError('Failed to rename note');
    // Restore original title on error
    if (currentNote) {
      elements.noteTitleInput.value = currentNote.title;
    }
  }
}

// Handle font change
function handleFontChange(e) {
  const font = e.target.value;
  elements.notesEditor.style.fontFamily = `'${font}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  
  // Save to settings
  chrome.runtime.sendMessage({
    action: 'updateSettings',
    settings: { defaultFont: font }
  });
}

// Handle format button click
function handleFormatClick(e) {
  const command = e.target.dataset.command;
  if (!command) return;
  
  document.execCommand(command, false, null);
  elements.notesEditor.focus();
  
  // Update button state
  updateFormatButtons();
}

// Update format button states
function updateFormatButtons() {
  elements.formatBtns.forEach(btn => {
    const command = btn.dataset.command;
    if (document.queryCommandState(command)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Handle editor change (auto-save)
let saveTimeout;
function handleEditorChange() {
  if (!currentNote) return;
  
  // Debounce saving
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    const content = elements.notesEditor.innerHTML;
    
    try {
      await chrome.runtime.sendMessage({
        action: 'updateNote',
        noteId: currentNote.id,
        content: content
      });
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, 1000);
}

// Handle paste event
function handlePaste(e) {
  e.preventDefault();
  
  // Get plain text from clipboard
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  
  // Insert as plain text
  document.execCommand('insertText', false, text);
}

// Handle messages from background script
function handleBackgroundMessage(message, sender, sendResponse) {
  console.log('Side panel received message:', message);
  
  switch (message.type) {
    case 'setHighlightedText':
      // Set the highlighted text in the text box
      if (message.text) {
        elements.highlightedText.textContent = message.text;
        elements.addBtn.disabled = false;
        elements.explainBtn.disabled = false;
      }
      break;
    
    case 'clearHighlightedText':
      // Clear the highlighted text box
      elements.highlightedText.textContent = '';
      elements.addBtn.disabled = true;
      elements.explainBtn.disabled = true;
      break;
    
    case 'noteUpdated':
      if (message.note && message.note.id === currentNote?.id) {
        displayNote(message.note);
      }
      break;
    
    case 'explanationLoading':
      showLoadingState();
      break;
    
    case 'explanationComplete':
      if (message.note) {
        displayNote(message.note);
      }
      hideLoadingState();
      break;
    
    case 'noteCreated':
      // Check if note already exists (prevent duplicates from multiple sources)
      const existingIndex = allNotes.findIndex(n => n.id === message.note.id);
      if (existingIndex === -1) {
        allNotes.push(message.note);
        console.log('📨 Note created message: added to allNotes');
      } else {
        console.log('📨 Note created message: already exists, skipping');
      }
      updateNoteDropdown();
      displayNote(message.note);
      break;
    
    case 'noteDeleted':
      allNotes = allNotes.filter(n => n.id !== message.noteId);
      updateNoteDropdown();
      break;
    
    case 'noteRenamed':
      const index = allNotes.findIndex(n => n.id === message.note.id);
      if (index !== -1) {
        allNotes[index] = message.note;
        updateNoteDropdown();
      }
      if (currentNote?.id === message.note.id) {
        displayNote(message.note);
      }
      break;
    
    case 'noteSwitched':
      displayNote(message.note);
      break;
    
    case 'error':
      showError(message.error);
      hideLoadingState();
      break;
  }
  
  sendResponse({ received: true });
}

// Show loading state
function showLoadingState() {
  elements.explainBtn.disabled = true;
  elements.explainBtn.innerHTML = '<span class="loading-spinner"></span> Explaining...';
}

// Hide loading state
function hideLoadingState() {
  elements.explainBtn.disabled = elements.highlightedText.textContent.trim().length === 0;
  elements.explainBtn.innerHTML = '<span class="btn-icon">📖</span> Explain';
}

// Show error message
function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorBanner.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(hideError, 5000);
}

// Hide error message
function hideError() {
  elements.errorBanner.classList.add('hidden');
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make handleBackgroundMessage available globally for direct access
window.handleBackgroundMessage = handleBackgroundMessage;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

