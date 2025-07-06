import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TodoCategory =
  | "Kişisel"
  | "İş"
  | "Alışveriş"
  | "Eğitim"
  | "Diğer"
  | "Genel"
  | string;

export interface SubTodo {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high";
  subTodos: SubTodo[];
  expanded: boolean;
  category: TodoCategory;
  dueDate?: string | null;
}

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  customCategories: TodoCategory[];
}

const STORAGE_KEY = "@YuNote:todos";
const CUSTOM_CATEGORIES_KEY = "@YuNote:customCategories";

const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
  customCategories: [],
};

export const loadTodos = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
    const storedCategories = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);

    if (storedTodos) {
      dispatch(setTodos(JSON.parse(storedTodos)));
    }
    if (storedCategories) {
      dispatch(setCustomCategories(JSON.parse(storedCategories)));
    }
  } catch (error) {
    dispatch(setError("Görevler yüklenirken bir hata oluştu"));
  } finally {
    dispatch(setLoading(false));
  }
};

const saveTodosToStorage = async (todos: Todo[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Görevler kaydedilirken bir hata oluştu:", error);
  }
};

const saveCustomCategoriesToStorage = async (categories: TodoCategory[]) => {
  try {
    await AsyncStorage.setItem(
      CUSTOM_CATEGORIES_KEY,
      JSON.stringify(categories)
    );
  } catch (error) {
    console.error("Kategoriler kaydedilirken bir hata oluştu:", error);
  }
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setTodos: (state, action: PayloadAction<Todo[]>) => {
      state.todos = action.payload;
    },
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.todos.push(action.payload);
      saveTodosToStorage(state.todos);
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
        saveTodosToStorage(state.todos);
      }
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter((t) => t.id !== action.payload);
      saveTodosToStorage(state.todos);
    },
    setPriority: (
      state,
      action: PayloadAction<{ id: string; priority: "low" | "medium" | "high" }>
    ) => {
      const todo = state.todos.find((t) => t.id === action.payload.id);
      if (todo) {
        todo.priority = action.payload.priority;
        saveTodosToStorage(state.todos);
      }
    },
    toggleExpand: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find((t) => t.id === action.payload);
      if (todo) {
        todo.expanded = !todo.expanded;
        saveTodosToStorage(state.todos);
      }
    },
    addSubTodo: (
      state,
      action: PayloadAction<{ todoId: string; subTodo: SubTodo }>
    ) => {
      const todo = state.todos.find((t) => t.id === action.payload.todoId);
      if (todo) {
        todo.subTodos.push(action.payload.subTodo);
        saveTodosToStorage(state.todos);
      }
    },
    toggleSubTodo: (
      state,
      action: PayloadAction<{ todoId: string; subTodoId: string }>
    ) => {
      const todo = state.todos.find((t) => t.id === action.payload.todoId);
      if (todo) {
        const subTodo = todo.subTodos.find(
          (s) => s.id === action.payload.subTodoId
        );
        if (subTodo) {
          subTodo.completed = !subTodo.completed;
          saveTodosToStorage(state.todos);
        }
      }
    },
    deleteSubTodo: (
      state,
      action: PayloadAction<{ todoId: string; subTodoId: string }>
    ) => {
      const todo = state.todos.find((t) => t.id === action.payload.todoId);
      if (todo) {
        todo.subTodos = todo.subTodos.filter(
          (s) => s.id !== action.payload.subTodoId
        );
        saveTodosToStorage(state.todos);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCustomCategories: (state, action: PayloadAction<TodoCategory[]>) => {
      state.customCategories = action.payload;
      saveCustomCategoriesToStorage(action.payload);
    },
    addCustomCategory: (state, action: PayloadAction<TodoCategory>) => {
      if (!state.customCategories.includes(action.payload)) {
        state.customCategories.push(action.payload);
        saveCustomCategoriesToStorage(state.customCategories);
      }
    },
    removeCustomCategory: (state, action: PayloadAction<TodoCategory>) => {
      state.customCategories = state.customCategories.filter(
        (category) => category !== action.payload
      );
      saveCustomCategoriesToStorage(state.customCategories);
    },
  },
});

export const {
  setTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  setPriority,
  toggleExpand,
  addSubTodo,
  toggleSubTodo,
  deleteSubTodo,
  setLoading,
  setError,
  setCustomCategories,
  addCustomCategory,
  removeCustomCategory,
} = todoSlice.actions;

export default todoSlice.reducer;
