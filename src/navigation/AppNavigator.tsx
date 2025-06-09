import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RootState } from "../store";

import HomeScreen from "../screens/HomeScreen";
import AddNoteScreen from "../screens/AddNoteScreen";
import NoteDetailScreen from "../screens/NoteDetailScreen";
import EditNoteScreen from "../screens/EditNoteScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import TodoListScreen from "../screens/TodoListScreen";
import NotesScreen from "../screens/NotesScreen";
import AddTodoScreen from "../screens/AddTodoScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Notes: undefined;
  AddNote: undefined;
  TodoList: undefined;
  AddTodo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Notes" component={NotesScreen} />
            <Stack.Screen name="AddNote" component={AddNoteScreen} />
            <Stack.Screen name="TodoList" component={TodoListScreen} />
            <Stack.Screen name="AddTodo" component={AddTodoScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
