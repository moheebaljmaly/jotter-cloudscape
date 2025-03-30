
import { toast } from "sonner";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "notes-app-data";

// Helper to get all notes
export const getNotes = (): Note[] => {
  try {
    const notesJson = localStorage.getItem(STORAGE_KEY);
    if (!notesJson) return [];
    return JSON.parse(notesJson);
  } catch (error) {
    console.error("Failed to load notes:", error);
    toast("عفواً، حدث خطأ", {
      description: "لم نتمكن من تحميل الملاحظات",
    });
    return [];
  }
};

// Helper to get a single note by id
export const getNote = (id: string): Note | undefined => {
  try {
    const notes = getNotes();
    return notes.find((note) => note.id === id);
  } catch (error) {
    console.error("Failed to get note:", error);
    toast("عفواً، حدث خطأ", {
      description: "لم نتمكن من الوصول للملاحظة",
    });
    return undefined;
  }
};

// Helper to save a note (create or update)
export const saveNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt"> & { id?: string }): Note => {
  try {
    const notes = getNotes();
    const now = Date.now();
    
    let newNote: Note;
    
    if (note.id) {
      // Update existing note
      const existingIndex = notes.findIndex((n) => n.id === note.id);
      if (existingIndex === -1) {
        throw new Error("Note not found");
      }
      
      newNote = {
        ...notes[existingIndex],
        title: note.title,
        content: note.content,
        updatedAt: now,
      };
      
      notes[existingIndex] = newNote;
    } else {
      // Create new note
      newNote = {
        id: Date.now().toString(),
        title: note.title,
        content: note.content,
        createdAt: now,
        updatedAt: now,
      };
      
      notes.unshift(newNote);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return newNote;
  } catch (error) {
    console.error("Failed to save note:", error);
    toast("عفواً، حدث خطأ", {
      description: "لم نتمكن من حفظ الملاحظة",
    });
    throw error;
  }
};

// Helper to delete a note
export const deleteNote = (id: string): boolean => {
  try {
    const notes = getNotes();
    const newNotes = notes.filter((note) => note.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    return true;
  } catch (error) {
    console.error("Failed to delete note:", error);
    toast("عفواً، حدث خطأ", {
      description: "لم نتمكن من حذف الملاحظة",
    });
    return false;
  }
};

// Helper to search notes
export const searchNotes = (query: string): Note[] => {
  if (!query.trim()) return getNotes();
  
  const notes = getNotes();
  const lowerQuery = query.toLowerCase();
  
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
  );
};
