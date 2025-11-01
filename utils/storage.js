// Chrome Storage API Helper Functions

const StorageHelper = {
  // Get all notes from storage
  async getAllNotes() {
    try {
      const result = await chrome.storage.local.get(['notes']);
      return result.notes || [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  // Get a specific note by ID
  async getNote(noteId) {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.id === noteId) || null;
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  },

  // Save a new note
  async saveNote(note) {
    try {
      const notes = await this.getAllNotes();
      notes.push(note);
      await chrome.storage.local.set({ notes });
      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      return false;
    }
  },

  // Update an existing note
  async updateNote(noteId, updates) {
    try {
      const notes = await this.getAllNotes();
      const index = notes.findIndex(note => note.id === noteId);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...updates, lastModified: Date.now() };
        await chrome.storage.local.set({ notes });
        return notes[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },

  // Delete a note
  async deleteNote(noteId) {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== noteId);
      await chrome.storage.local.set({ notes: filteredNotes });
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },

  // Get active note ID
  async getActiveNoteId() {
    try {
      const result = await chrome.storage.local.get(['activeNoteId']);
      return result.activeNoteId || null;
    } catch (error) {
      console.error('Error getting active note ID:', error);
      return null;
    }
  },

  // Set active note ID
  async setActiveNoteId(noteId) {
    try {
      await chrome.storage.local.set({ activeNoteId: noteId });
      return true;
    } catch (error) {
      console.error('Error setting active note ID:', error);
      return false;
    }
  },

  // Initialize storage with default note if empty
  async initialize() {
    try {
      const notes = await this.getAllNotes();
      if (notes.length === 0) {
        const defaultNote = {
          id: Date.now().toString(),
          title: 'My First Note',
          created: Date.now(),
          lastModified: Date.now(),
          content: ''
        };
        await this.saveNote(defaultNote);
        await this.setActiveNoteId(defaultNote.id);
      } else {
        // Ensure there's an active note
        const activeNoteId = await this.getActiveNoteId();
        if (!activeNoteId || !notes.find(n => n.id === activeNoteId)) {
          await this.setActiveNoteId(notes[0].id);
        }
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  },

  // Get settings
  async getSettings() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      return result.settings || {
        defaultFont: 'Lexend',
        panelWidth: 400
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { defaultFont: 'Lexend', panelWidth: 400 };
    }
  },

  // Update settings
  async updateSettings(newSettings) {
    try {
      const settings = await this.getSettings();
      const updated = { ...settings, ...newSettings };
      await chrome.storage.local.set({ settings: updated });
      return updated;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.StorageHelper = StorageHelper;
}

