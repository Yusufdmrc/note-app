import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useDispatch } from "react-redux";
import { store } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { loadNotes } from "./src/store/slices/notesSlice";
import { initializeAuth } from "./src/store/slices/authSlice";

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Auth state'i başlat
    dispatch(initializeAuth() as any);
    // Notları yükle
    dispatch(loadNotes() as any);
  }, [dispatch]);

  return <AppNavigator />;
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}
