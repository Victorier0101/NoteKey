// Content Script for Text Selection

let selectionTimeout = null;

// Initialize content script
function init() {
  console.log('NoteKey content script loaded on:', window.location.href);
  attachEventListeners();
}

// No popup menu needed - text goes directly to side panel

// Attach event listeners for text selection
function attachEventListeners() {
  document.addEventListener('mouseup', handleTextSelection);
}

// Handle text selection
function handleTextSelection(e) {
  // Clear any existing timeout
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }
  
  // Small delay to ensure selection is complete
  selectionTimeout = setTimeout(async () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      console.log('Text selected:', `"${text.substring(0, 50)}..."`);
      
      try {
        // Open side panel if not already open
        await chrome.runtime.sendMessage({ action: 'openSidePanel' });
        
        // Small delay to ensure side panel is ready
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Send text directly to side panel's highlighted text box
        await chrome.runtime.sendMessage({
          action: 'setHighlightedText',
          text: text
        });
        
        console.log('Text sent to side panel');
      } catch (error) {
        console.error('Error sending text to side panel:', error);
      }
    }
  }, 100);
}

// That's it! No popup menu, no button handlers - text goes straight to side panel

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

