import { configureStore } from "@reduxjs/toolkit";
import noteReducer from "./slices/noteSlice";
import todoReducer from "./slices/todoSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    notes: noteReducer,
    todos: todoReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
