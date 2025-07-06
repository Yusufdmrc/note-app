import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { RootState } from "../store";
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  loadTodos,
  setPriority,
  toggleExpand,
  addSubTodo,
  toggleSubTodo,
  deleteSubTodo,
  TodoCategory,
  removeCustomCategory,
} from "../store/slices/todoSlice";

interface SubTodo {
  id: string;
  text: string;
  completed: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  subTodos: SubTodo[];
  expanded: boolean;
  createdAt: string;
  category: TodoCategory;
  dueDate?: string;
}

const TodoList: React.FC = () => {
  const dispatch = useDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const todos = useSelector((state: RootState) => state.todos.todos);
  const customCategories = useSelector(
    (state: RootState) => state.todos.customCategories
  );
  const [newTodo, setNewTodo] = useState("");
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [newSubTodo, setNewSubTodo] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    TodoCategory | "Tümü"
  >("Tümü");
  const [showAddTodo, setShowAddTodo] = useState(false);

  const DEFAULT_CATEGORIES: TodoCategory[] = [
    "Kişisel",
    "İş",
    "Alışveriş",
    "Eğitim",
    "Diğer",
  ];

  const allCategories = ["Tümü", ...DEFAULT_CATEGORIES, ...customCategories];

  useEffect(() => {
    dispatch<any>(loadTodos());
  }, [dispatch]);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        priority: "medium",
        subTodos: [],
        expanded: false,
        createdAt: new Date().toISOString(),
        category: selectedCategory === "Tümü" ? "Genel" : selectedCategory,
        dueDate: null,
      };
      dispatch(addTodo(todo));
      setNewTodo("");
      setSelectedCategory("Tümü");
    }
  };

  const handleToggleTodo = (id: string) => {
    dispatch(toggleTodo(id));
  };

  const handleDeleteTodo = (id: string) => {
    dispatch(deleteTodo(id));
  };

  const toggleExpandHandler = (id: string) => {
    dispatch(toggleExpand(id));
  };

  const setPriorityHandler = (
    id: string,
    priority: "low" | "medium" | "high"
  ) => {
    dispatch(setPriority({ id, priority }));
  };

  const addSubTodoHandler = () => {
    if (selectedTodo && newSubTodo.trim()) {
      const subTodo: SubTodo = {
        id: Date.now().toString(),
        text: newSubTodo.trim(),
        completed: false,
      };
      dispatch(addSubTodo({ todoId: selectedTodo.id, subTodo }));
      setNewSubTodo("");
    }
  };

  const toggleSubTodoHandler = (todoId: string, subTodoId: string) => {
    dispatch(toggleSubTodo({ todoId, subTodoId }));
  };

  const deleteSubTodoHandler = (todoId: string, subTodoId: string) => {
    dispatch(deleteSubTodo({ todoId, subTodoId }));
  };

  const getPriorityColor = (priority: string) => {
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

  const getRemainingTime = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Süresi doldu";
    } else if (diffDays === 0) {
      return "Bugün";
    } else if (diffDays === 1) {
      return "Yarın";
    } else if (diffDays < 7) {
      return `${diffDays} gün kaldı`;
    } else {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      if (remainingDays === 0) {
        return `${weeks} hafta kaldı`;
      }
      return `${weeks} hafta ${remainingDays} gün kaldı`;
    }
  };

  const getRemainingTimeColor = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "#ef4444"; // Kırmızı
    } else if (diffDays <= 1) {
      return "#f97316"; // Turuncu
    } else if (diffDays <= 3) {
      return "#eab308"; // Sarı
    } else {
      return "#22c55e"; // Yeşil
    }
  };

  const renderSubTodo = (subTodo: SubTodo, todoId: string) => (
    <View key={subTodo.id} style={styles.subTodoItem}>
      <TouchableOpacity
        style={styles.todoCheckbox}
        onPress={() => toggleSubTodoHandler(todoId, subTodo.id)}
      >
        <Ionicons
          name={subTodo.completed ? "checkmark-circle" : "ellipse-outline"}
          size={20}
          color={subTodo.completed ? "#4CAF50" : "#757575"}
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.subTodoText,
          subTodo.completed && styles.completedTodoText,
        ]}
      >
        {subTodo.text}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteSubTodoHandler(todoId, subTodo.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  const filteredTodos =
    selectedCategory === "Tümü"
      ? todos
      : todos.filter((todo) => todo.category === selectedCategory);

  const renderTodo = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <View style={styles.todoHeader}>
        <TouchableOpacity
          style={styles.todoCheckbox}
          onPress={() => handleToggleTodo(item.id)}
        >
          <Ionicons
            name={item.completed ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={item.completed ? "#4CAF50" : "#757575"}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.todoText,
              item.completed && styles.completedTodoText,
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.todoMeta}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <View style={styles.priorityBadge}>
              <Ionicons
                name="flag"
                size={14}
                color={getPriorityColor(item.priority)}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(item.priority) },
                ]}
              >
                {item.priority === "low"
                  ? "Düşük"
                  : item.priority === "medium"
                  ? "Orta"
                  : "Yüksek"}
              </Text>
            </View>
            {item.dueDate && (
              <View
                style={[
                  styles.dueDateBadge,
                  {
                    backgroundColor: `${getRemainingTimeColor(item.dueDate)}20`,
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={getRemainingTimeColor(item.dueDate)}
                />
                <Text
                  style={[
                    styles.dueDateText,
                    { color: getRemainingTimeColor(item.dueDate) },
                  ]}
                >
                  {getRemainingTime(item.dueDate)}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.todoActions}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleExpandHandler(item.id)}
          >
            <Ionicons
              name={item.expanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#757575"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTodo(item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </View>
      {item.expanded && (
        <View style={styles.subTodosContainer}>
          {item.subTodos.map((subTodo) => renderSubTodo(subTodo, item.id))}
          <TouchableOpacity
            style={styles.addSubTodoButton}
            onPress={() => {
              setSelectedTodo(item);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.addSubTodoText}>Alt görev ekle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const handleRemoveCategory = (category: TodoCategory) => {
    if (DEFAULT_CATEGORIES.includes(category)) {
      Alert.alert("Hata", "Varsayılan kategoriler silinemez!");
      return;
    }

    const todosInCategory = todos.filter((todo) => todo.category === category);
    if (todosInCategory.length > 0) {
      Alert.alert(
        "Uyarı",
        `Bu kategoride ${todosInCategory.length} görev bulunuyor. Kategoriyi silmek istediğinizden emin misiniz?`,
        [
          {
            text: "İptal",
            style: "cancel",
          },
          {
            text: "Sil",
            style: "destructive",
            onPress: () => {
              dispatch(removeCustomCategory(category));
              if (selectedCategory === category) {
                setSelectedCategory("Tümü");
              }
            },
          },
        ]
      );
    } else {
      dispatch(removeCustomCategory(category));
      if (selectedCategory === category) {
        setSelectedCategory("Tümü");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Yeni görev ekle..."
          placeholderTextColor="#757575"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddTodo")}
        >
          <Ionicons name="add-circle" size={32} color="#2196F3" />
        </TouchableOpacity>
      </View>
      <View style={styles.categoryPickerContainer}>
        {allCategories.map((cat) => (
          <View key={cat} style={styles.categoryButtonContainer}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === cat && styles.selectedCategoryButtonText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
            {cat !== "Tümü" && !DEFAULT_CATEGORIES.includes(cat) && (
              <TouchableOpacity
                style={styles.removeCategoryButton}
                onPress={() => handleRemoveCategory(cat)}
              >
                <Ionicons name="close-circle" size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      <FlatList
        data={filteredTodos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alt Görev Ekle</Text>
            <TextInput
              style={styles.modalInput}
              value={newSubTodo}
              onChangeText={setNewSubTodo}
              placeholder="Alt görev metni..."
              placeholderTextColor="#757575"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewSubTodo("");
                }}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalAddButton]}
                onPress={() => {
                  addSubTodoHandler();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginTop: 20,
    fontSize: 16,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  todoItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  todoCheckbox: {
    marginRight: 12,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: "#212121",
  },
  completedTodoText: {
    textDecorationLine: "line-through",
    color: "#9E9E9E",
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  subTodosContainer: {
    paddingLeft: 36,
    paddingBottom: 12,
  },
  subTodoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  subTodoText: {
    flex: 1,
    fontSize: 14,
    color: "#212121",
    marginLeft: 8,
  },
  addSubTodoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  addSubTodoText: {
    marginLeft: 8,
    color: "#2196F3",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  modalAddButton: {
    backgroundColor: "#2563eb",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  categoryPickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 4,
  },
  categoryButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
    marginBottom: 4,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  selectedCategoryButton: {
    backgroundColor: "#2563eb",
  },
  categoryButtonText: {
    color: "#2563eb",
    fontSize: 13,
  },
  selectedCategoryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  todoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dueDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  removeCategoryButton: {
    marginLeft: 4,
    padding: 2,
  },
});

export default TodoList;
