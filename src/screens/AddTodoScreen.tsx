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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { addTodo, addCustomCategory } from "../store/slices/todoSlice";
import { TodoCategory } from "../store/slices/todoSlice";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../store";

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Yeni Görev Ekle</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Görev Başlığı</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Görev başlığını girin..."
          placeholderTextColor="#94a3b8"
        />

        <View style={styles.categoryHeader}>
          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setShowNewCategoryModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
            <Text style={styles.addCategoryText}>Yeni Kategori</Text>
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

        <Text style={styles.label}>Öncelik</Text>
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
              <Text
                style={[
                  styles.priorityButtonText,
                  priority === p && styles.selectedPriorityButtonText,
                ]}
              >
                {p === "low" ? "Düşük" : p === "medium" ? "Orta" : "Yüksek"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Bitiş Tarihi</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.dateButtonContent}>
            <Ionicons name="calendar-outline" size={20} color="#2563eb" />
            <Text style={styles.dateButtonText}>
              {dueDate ? formatDate(dueDate) : "Bitiş tarihi seçin..."}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, !title.trim() && styles.disabledButton]}
          onPress={handleAddTodo}
          disabled={!title.trim()}
        >
          <Text style={styles.addButtonText}>Görev Ekle</Text>
        </TouchableOpacity>
      </View>

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
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Kategori adını girin..."
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !newCategory.trim() && styles.disabledButton,
              ]}
              onPress={handleAddCategory}
              disabled={!newCategory.trim()}
            >
              <Text style={styles.addButtonText}>Kategori Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getPriorityColor = (priority: "low" | "medium" | "high") => {
  switch (priority) {
    case "high":
      return "#FF5252";
    case "medium":
      return "#FFC107";
    case "low":
      return "#4CAF50";
    default:
      return "#757575";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  backButtonText: {
    fontSize: 28,
    color: "#2563eb",
    fontWeight: "bold",
    marginTop: -2,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
  },
  form: {
    gap: 16,
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
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  selectedCategoryButton: {
    backgroundColor: "#2563eb",
  },
  categoryButtonText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
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
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    opacity: 0.7,
  },
  selectedPriorityButton: {
    opacity: 1,
  },
  priorityButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedPriorityButtonText: {
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
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
  },
  dateButtonText: {
    fontSize: 16,
    color: "#1e293b",
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
    padding: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  addCategoryText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AddTodoScreen;
