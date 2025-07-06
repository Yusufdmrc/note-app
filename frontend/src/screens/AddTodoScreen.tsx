import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { addTodo, addCustomCategory } from "../store/slices/todoSlice";
import { TodoCategory } from "../store/slices/todoSlice";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../store";
import { LinearGradient } from "expo-linear-gradient";
import {
  theme,
  getPriorityColor as getThemePriorityColor,
} from "../config/theme";

const DEFAULT_CATEGORIES: TodoCategory[] = [
  "Kişisel",
  "İş",
  "Alışveriş",
  "Eğitim",
  "Diğer",
];

const AddTodoScreen = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TodoCategory>("Kişisel");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const dispatch = useDispatch();
  const customCategories = useSelector(
    (state: RootState) => state.todos.customCategories
  );
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      if (allCategories.includes(newCategory.trim() as TodoCategory)) {
        Alert.alert("Hata", "Bu kategori zaten mevcut!");
        return;
      }
      dispatch(addCustomCategory(newCategory.trim() as TodoCategory));
      setCategory(newCategory.trim() as TodoCategory);
      setNewCategory("");
      setShowNewCategoryModal(false);
    }
  };

  const handleAddTodo = () => {
    if (title.trim()) {
      const todo = {
        id: Date.now().toString(),
        text: title.trim(),
        completed: false,
        priority,
        subTodos: [],
        expanded: false,
        createdAt: new Date().toISOString(),
        category,
        dueDate: dueDate?.toISOString() || null,
      };
      dispatch(addTodo(todo));
      navigation.goBack();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Görev</Text>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !title.trim() && styles.disabledSaveButton,
            ]}
            onPress={handleAddTodo}
            disabled={!title.trim()}
          >
            <Text
              style={[
                styles.saveButtonText,
                !title.trim() && styles.disabledSaveText,
              ]}
            >
              Kaydet
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Task Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.label}>Görev Başlığı</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Görev başlığını girin..."
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Category Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kategori</Text>
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => setShowNewCategoryModal(true)}
              >
                <Ionicons name="add-circle" size={20} color="#3b82f6" />
                <Text style={styles.addCategoryText}>Yeni</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoryContainer}>
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.selectedCategoryButton,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.selectedCategoryButtonText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Öncelik</Text>
            <View style={styles.priorityContainer}>
              {(["low", "medium", "high"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && styles.selectedPriorityButton,
                    { backgroundColor: getPriorityColor(p) },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={styles.priorityButtonText}>
                    {p === "low" ? "Düşük" : p === "medium" ? "Orta" : "Yüksek"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Bitiş Tarihi</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateButtonContent}>
                <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
                <Text style={styles.dateButtonText}>
                  {dueDate ? formatDate(dueDate) : "Bitiş tarihi seçin..."}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bitiş Tarihi Seçin</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                  setShowDatePicker(false);
                }}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>

        {/* New Category Modal */}
        <Modal
          visible={showNewCategoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowNewCategoryModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Yeni Kategori Ekle</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowNewCategoryModal(false)}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Kategori adını girin..."
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity
                style={[
                  styles.modalAddButton,
                  !newCategory.trim() && styles.modalDisabledButton,
                ]}
                onPress={handleAddCategory}
                disabled={!newCategory.trim()}
              >
                <Text
                  style={[
                    styles.modalAddButtonText,
                    !newCategory.trim() && styles.modalDisabledButtonText,
                  ]}
                >
                  Kategori Ekle
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Tema sistemi kullanarak priority renklerini al
const getPriorityColor = (priority: "low" | "medium" | "high") => {
  return getThemePriorityColor(priority);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: "relative",
  },
  headerButton: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  saveButton: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  disabledSaveButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  disabledSaveText: {
    color: "rgba(255,255,255,0.6)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 12,
  },
  inputCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
  },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  selectedCategoryButton: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  categoryButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedCategoryButtonText: {
    color: "#fff",
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedPriorityButton: {
    transform: [{ scale: 1.02 }],
  },
  priorityButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  addCategoryText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "600",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#1e293b",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    padding: 4,
  },
  datePicker: {
    height: 200,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
  },
  modalAddButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  modalDisabledButton: {
    backgroundColor: "#94a3b8",
  },
  modalAddButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalDisabledButtonText: {
    color: "#e2e8f0",
  },
});

export default AddTodoScreen;
