import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  createdAt: string;
  updatedAt: string;
  color?: string;
  attachments?: Array<{
    id: string;
    type: "image" | "file" | "audio";
    uri: string;
    name: string;
    duration?: number;
    size?: number;
  }>;
}

export type NoteCategory =
  | "Kişisel"
  | "İş"
  | "Alışveriş"
  | "Eğitim"
  | "Diğer"
  | "Genel"
  | string;

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  customCategories: NoteCategory[];
}

const STORAGE_KEY = "@YuNote:notes";
const CUSTOM_CATEGORIES_KEY = "@YuNote:noteCustomCategories";

const initialState: NoteState = {
  notes: [],
  loading: false,
  error: null,
  customCategories: [],
};

export const loadNotes = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const storedNotes = await AsyncStorage.getItem(STORAGE_KEY);
    const storedCategories = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);

    if (storedNotes) {
      dispatch(setNotes(JSON.parse(storedNotes)));
    }
    if (storedCategories) {
      dispatch(setCustomCategories(JSON.parse(storedCategories)));
    }
  } catch (error) {
    dispatch(setError("Notlar yüklenirken bir hata oluştu"));
  } finally {
    dispatch(setLoading(false));
  }
};

const saveNotesToStorage = async (notes: Note[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Notlar kaydedilirken bir hata oluştu:", error);
  }
};

const saveCustomCategoriesToStorage = async (categories: NoteCategory[]) => {
  try {
    await AsyncStorage.setItem(
      CUSTOM_CATEGORIES_KEY,
      JSON.stringify(categories)
    );
  } catch (error) {
    console.error("Kategoriler kaydedilirken bir hata oluştu:", error);
  }
};

export const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
      saveNotesToStorage(action.payload);
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
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setCustomCategories: (state, action: PayloadAction<NoteCategory[]>) => {
      state.customCategories = action.payload;
      saveCustomCategoriesToStorage(action.payload);
    },
    addCustomCategory: (state, action: PayloadAction<NoteCategory>) => {
      if (!state.customCategories.includes(action.payload)) {
        state.customCategories.push(action.payload);
        saveCustomCategoriesToStorage(state.customCategories);
      }
    },
    removeCustomCategory: (state, action: PayloadAction<NoteCategory>) => {
      state.customCategories = state.customCategories.filter(
        (category) => category !== action.payload
      );
      saveCustomCategoriesToStorage(state.customCategories);
    },
  },
});

export const {
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  setLoading,
  setError,
  setCustomCategories,
  addCustomCategory,
  removeCustomCategory,
} = noteSlice.actions;

export default noteSlice.reducer;
