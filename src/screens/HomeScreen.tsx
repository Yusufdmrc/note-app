import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { AppDispatch } from "../store";

// Ana ekran için navigation tipi
type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YuNote</Text>
      <Text style={styles.subtitle}>
        Dijital notlarınızı ve görevlerinizi kolayca yönetin!
      </Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: "#2563eb" }]}
          onPress={() => navigation.navigate("Notes")}
        >
          <Text style={styles.menuButtonText}>Notlarım</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: "#22c55e" }]}
          onPress={() => navigation.navigate("TodoList")}
        >
          <Text style={styles.menuButtonText}>Yapılacaklar Listesi</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 32,
    textAlign: "center",
  },
  menuContainer: {
    width: "100%",
    gap: 20,
  },
  menuButton: {
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 32,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
