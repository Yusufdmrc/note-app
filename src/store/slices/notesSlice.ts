import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NoteCategory = "Kişisel" | "İş" | "Alışveriş" | "Eğitim" | "Diğer";
export type NoteColor =
  | "#FFE4E1"
  | "#E0FFFF"
  | "#F0FFF0"
  | "#FFF0F5"
  | "#F5F5DC"
  | "#FFFFFF";

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: NoteColor;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  attachments: {
    id: string;
    type: "image" | "file" | "audio";
    uri: string;
    name: string;
    size?: number;
    duration?: number; // Ses kaydı için süre (saniye)
  }[];
}

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = "@YuNote:notes";

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
};

// AsyncStorage'dan notları yükle
export const loadNotes = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const storedNotes = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedNotes) {
      dispatch(setNotes(JSON.parse(storedNotes)));
    }
  } catch (error) {
    dispatch(setError("Notlar yüklenirken bir hata oluştu"));
  } finally {
    dispatch(setLoading(false));
  }
};

// Notları AsyncStorage'a kaydet
const saveNotesToStorage = async (notes: Note[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Notlar kaydedilirken bir hata oluştu:", error);
  }
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.push(action.payload);
      saveNotesToStorage(state.notes);
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(
        (note) => note.id === action.payload.id
      );
      if (index !== -1) {
        state.notes[index] = action.payload;
        saveNotesToStorage(state.notes);
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
      saveNotesToStorage(state.notes);
    },
    togglePinNote: (state, action: PayloadAction<string>) => {
      const note = state.notes.find((n) => n.id === action.payload);
      if (note) {
        note.isPinned = !note.isPinned;
        saveNotesToStorage(state.notes);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  togglePinNote,
  setLoading,
  setError,
} = notesSlice.actions;

export default notesSlice.reducer;
