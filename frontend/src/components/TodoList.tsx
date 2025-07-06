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
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
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
import { LinearGradient } from "expo-linear-gradient";
import {
  theme,
  getCategoryGradient,
  getPriorityColor as getThemePriorityColor,
} from "../config/theme";

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
    return getThemePriorityColor(priority as "low" | "medium" | "high");
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case "high":
        return ["#fecaca", "#fee2e2"];
      case "medium":
        return ["#fde68a", "#fef3c7"];
      case "low":
        return ["#bbf7d0", "#dcfce7"];
      default:
        return ["#f1f5f9", "#f8fafc"];
    }
  };

  const getCategoryColor = (category: string) => {
    return getCategoryGradient(category);
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
      return "#3b82f6"; // Mavi
    }
  };

  const renderSubTodo = (subTodo: SubTodo, todoId: string) => (
    <View key={subTodo.id} style={styles.subTodoItem}>
      <TouchableOpacity
        style={styles.subTodoCheckbox}
        onPress={() => toggleSubTodoHandler(todoId, subTodo.id)}
      >
        <Ionicons
          name={subTodo.completed ? "checkmark-circle" : "ellipse-outline"}
          size={20}
          color={subTodo.completed ? "#3b82f6" : "#64748b"}
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.subTodoText,
          subTodo.completed && styles.completedSubTodoText,
        ]}
      >
        {subTodo.text}
      </Text>
      <TouchableOpacity
        style={styles.subTodoDeleteButton}
        onPress={() => deleteSubTodoHandler(todoId, subTodo.id)}
      >
        <Ionicons name="trash-outline" size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  const filteredTodos =
    selectedCategory === "Tümü"
      ? todos
      : todos.filter((todo) => todo.category === selectedCategory);

  const renderTodo = ({ item }: { item: Todo }) => (
    <View style={styles.todoCard}>
      <LinearGradient
        colors={getPriorityGradient(item.priority)}
        style={styles.todoGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.todoHeader}>
          <TouchableOpacity
            style={styles.todoCheckbox}
            onPress={() => handleToggleTodo(item.id)}
          >
            <Ionicons
              name={item.completed ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={item.completed ? "#3b82f6" : "#64748b"}
            />
          </TouchableOpacity>

          <View style={styles.todoContent}>
            <Text
              style={[
                styles.todoText,
                item.completed && styles.completedTodoText,
              ]}
            >
              {item.text}
            </Text>

            <View style={styles.todoMeta}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>

              <View style={styles.priorityBadge}>
                <Ionicons
                  name="flag"
                  size={12}
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
                      backgroundColor: `${getRemainingTimeColor(
                        item.dueDate
                      )}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={12}
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
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteTodo(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
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
              <Ionicons name="add-circle-outline" size={16} color="#667eea" />
              <Text style={styles.addSubTodoText}>Alt görev ekle</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
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
      {/* Quick Add Section */}
      <View style={styles.quickAddCard}>
        <Text style={styles.quickAddTitle}>Hızlı Görev Ekle</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newTodo}
            onChangeText={setNewTodo}
            placeholder="Yeni görev ekle..."
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddTodo")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Kategoriler</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {allCategories.map((cat) => (
            <View key={cat} style={styles.categoryItemWrapper}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.selectedCategoryChip,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.selectedCategoryChipText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
              {cat !== "Tümü" && !DEFAULT_CATEGORIES.includes(cat) && (
                <TouchableOpacity
                  style={styles.removeCategoryIcon}
                  onPress={() => handleRemoveCategory(cat)}
                >
                  <Ionicons name="close-circle" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Todos List */}
      <View style={styles.todosContainer}>
        {filteredTodos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color="#cbd5e1"
            />
            <Text style={styles.emptyTitle}>
              {selectedCategory === "Tümü"
                ? "Henüz görev yok"
                : "Bu kategoride görev yok"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory === "Tümü"
                ? "İlk görevinizi oluşturmak için yukarıdaki alanı kullanın"
                : `${selectedCategory} kategorisinde henüz görev bulunmuyor`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTodos}
            renderItem={renderTodo}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.todosList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Sub Todo Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alt Görev Ekle</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                value={newSubTodo}
                onChangeText={setNewSubTodo}
                placeholder="Alt görev metni..."
                placeholderTextColor="#94a3b8"
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewSubTodo("");
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addModalButton]}
                onPress={() => {
                  addSubTodoHandler();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.addButtonText}>Ekle</Text>
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
    backgroundColor: "#f8fafc",
  },
  quickAddCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickAddTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  categoryContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  categoryScroll: {
    paddingRight: 16,
  },
  categoryItemWrapper: {
    position: "relative",
    marginRight: 8,
  },
  categoryChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedCategoryChip: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  categoryChipText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedCategoryChipText: {
    color: "#fff",
    fontWeight: "600",
  },
  removeCategoryIcon: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  todosContainer: {
    flex: 1,
  },
  todosList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  todoCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  todoGradient: {
    padding: 16,
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  todoCheckbox: {
    marginTop: 2,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 8,
    lineHeight: 22,
  },
  completedTodoText: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
  todoMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "500",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
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
    paddingVertical: 4,
    borderRadius: 12,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  todoActions: {
    flexDirection: "row",
    gap: 8,
  },
  expandButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  subTodosContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  subTodoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },
  subTodoCheckbox: {},
  subTodoText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
  },
  completedSubTodoText: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
  subTodoDeleteButton: {
    padding: 4,
  },
  addSubTodoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
  },
  addSubTodoText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cancelButtonText: {
    color: "#64748b",
    fontWeight: "600",
  },
  addModalButton: {
    backgroundColor: "#667eea",
    ...Platform.select({
      ios: {
        shadowColor: "#667eea",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default TodoList;
