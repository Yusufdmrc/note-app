import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    // Reducer'lar buraya eklenecek
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
