// Content Script for Text Selection

let selectionTimeout = null;
let lastProcessedText = '';
let lastProcessedTime = 0;

// Initialize content script
function init() {
  console.log('NoteKey content script loaded on:', window.location.href);
  attachEventListeners();
  monitorIframes();
}

// Attach event listeners for text selection
function attachEventListeners() {
  // Listen to mouseup on the main document
  document.addEventListener('mouseup', handleTextSelection);
  
  // Listen to selectionchange for more reliable detection
  document.addEventListener('selectionchange', debounceSelectionChange);
  
  // Listen to keyup for keyboard-based selections (Shift+Arrow keys)
  document.addEventListener('keyup', handleKeySelection);
}

// Debounce selection change events
let selectionChangeTimeout = null;
function debounceSelectionChange() {
  if (selectionChangeTimeout) {
    clearTimeout(selectionChangeTimeout);
  }
  
  selectionChangeTimeout = setTimeout(() => {
    handleTextSelection();
  }, 300);
}

// Handle keyboard selections
function handleKeySelection(e) {
  // Detect Shift+Arrow keys or Ctrl/Cmd+A
  if (e.shiftKey || (e.key === 'a' && (e.ctrlKey || e.metaKey))) {
    handleTextSelection();
  }
}

// Monitor iframes for text selection
function monitorIframes() {
  // Find all iframes
  const iframes = document.querySelectorAll('iframe');
  
  iframes.forEach((iframe) => {
    try {
      // Try to access iframe content (will fail for cross-origin)
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        console.log('NoteKey: Monitoring iframe for text selection');
        
        // Add event listeners to iframe document
        iframeDoc.addEventListener('mouseup', handleTextSelection);
        iframeDoc.addEventListener('selectionchange', debounceSelectionChange);
      }
    } catch (error) {
      // Cross-origin iframe, we can't access it directly
      console.log('NoteKey: Cannot access cross-origin iframe');
    }
  });
  
  // Watch for new iframes being added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'IFRAME') {
          monitorIframes();
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Get selected text from all possible sources
function getSelectedText() {
  // Try main document
  let selection = window.getSelection();
  let text = selection.toString().trim();
  
  if (text) return text;
  
  // Try active element (for input fields, textareas)
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;
    text = activeElement.value.substring(start, end).trim();
    if (text) return text;
  }
  
  // Try iframes
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        const iframeSelection = iframeWindow.getSelection();
        text = iframeSelection.toString().trim();
        if (text) {
          console.log('NoteKey: Text selected from iframe');
          return text;
        }
      }
    } catch (error) {
      // Can't access cross-origin iframe
      continue;
    }
  }
  
  return '';
}

// Handle text selection
function handleTextSelection(e) {
  // Clear any existing timeout
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }
  
  // Small delay to ensure selection is complete
  selectionTimeout = setTimeout(async () => {
    const text = getSelectedText();
    
    if (text.length > 0) {
      // Prevent duplicate processing of the same text within 1 second
      const now = Date.now();
      if (text === lastProcessedText && (now - lastProcessedTime) < 1000) {
        return;
      }
      
      lastProcessedText = text;
      lastProcessedTime = now;
      
      console.log('NoteKey: Text selected:', `"${text.substring(0, 50)}..."`);
      
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
        
        console.log('NoteKey: Text sent to side panel');
      } catch (error) {
        console.error('NoteKey: Error sending text to side panel:', error);
      }
    }
  }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

