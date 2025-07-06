import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  Note,
  NoteCategory,
  removeCustomCategory,
  updateNote,
  deleteNote,
} from "../store/slices/noteSlice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme, getCategoryGradient } from "../config/theme";

const { width } = Dimensions.get("window");

const NotesScreen = () => {
  const dispatch = useDispatch();
  const notes = useSelector((state: RootState) => state.notes.notes);
  const customCategories = useSelector(
    (state: RootState) => state.notes.customCategories
  );
  const [selectedCategory, setSelectedCategory] = useState<
    NoteCategory | "Tümü"
  >("Tümü");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<NoteCategory>("Kişisel");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const DEFAULT_CATEGORIES: NoteCategory[] = [
    "Kişisel",
    "İş",
    "Alışveriş",
    "Eğitim",
    "Diğer",
  ];

  const allCategories = ["Tümü", ...DEFAULT_CATEGORIES, ...customCategories];

  const handleRemoveCategory = (category: NoteCategory) => {
    if (DEFAULT_CATEGORIES.includes(category)) {
      Alert.alert("Hata", "Varsayılan kategoriler silinemez!");
      return;
    }

    const notesInCategory = notes.filter((note) => note.category === category);
    if (notesInCategory.length > 0) {
      Alert.alert(
        "Uyarı",
        `Bu kategoride ${notesInCategory.length} not bulunuyor. Kategoriyi silmek istediğinizden emin misiniz?`,
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

  const handleNotePress = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setEditModalVisible(true);
  };

  const handleUpdateNote = () => {
    if (selectedNote && editTitle.trim() && editContent.trim()) {
      const updatedNote = {
        ...selectedNote,
        title: editTitle.trim(),
        content: editContent.trim(),
        category: editCategory,
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateNote(updatedNote));
      setEditModalVisible(false);
      setSelectedNote(null);
    }
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      Alert.alert("Notu Sil", "Bu notu silmek istediğinizden emin misiniz?", [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            dispatch(deleteNote(selectedNote.id));
            setEditModalVisible(false);
            setSelectedNote(null);
          },
        },
      ]);
    }
  };

  const getCategoryColor = (category: string) => {
    return getCategoryGradient(category);
  };

  const filteredNotes =
    selectedCategory === "Tümü"
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => handleNotePress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getCategoryColor(item.category)}
        style={styles.noteGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
      >
        <View style={styles.noteContent}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.noteText} numberOfLines={3}>
            {item.content}
          </Text>
          <View style={styles.noteFooter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.noteDate}>
              {new Date(item.createdAt).toLocaleDateString("tr-TR")}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notlarım</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{filteredNotes.length}</Text>
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

      {/* Notes List */}
      <View style={styles.notesContainer}>
        {sortedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>
              {selectedCategory === "Tümü"
                ? "Henüz not yok"
                : "Bu kategoride not yok"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory === "Tümü"
                ? "İlk notunuzu oluşturmak için + butonuna dokunun"
                : `${selectedCategory} kategorisinde henüz not bulunmuyor`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedNotes}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notu Düzenle</Text>
            <TouchableOpacity
              style={styles.modalDeleteButton}
              onPress={handleDeleteNote}
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Başlık</Text>
              <TextInput
                style={styles.titleInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Not başlığı"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>İçerik</Text>
              <TextInput
                style={styles.contentInput}
                value={editContent}
                onChangeText={setEditContent}
                placeholder="Notunuzu buraya yazın..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Kategori</Text>
              <View style={styles.categoryGrid}>
                {allCategories
                  .filter((cat) => cat !== "Tümü")
                  .map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        editCategory === cat && styles.selectedCategoryOption,
                      ]}
                      onPress={() => setEditCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          editCategory === cat &&
                            styles.selectedCategoryOptionText,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdateNote}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddNote")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 16 : StatusBar.currentHeight + 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerStats: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  categoryContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
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
  notesContainer: {
    flex: 1,
    marginTop: 16,
  },
  notesList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  noteCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  noteGradient: {
    padding: 20,
  },
  noteContent: {},
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  noteDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    backgroundColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "ios" ? 16 : StatusBar.currentHeight + 16,
  },
  modalBackButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  modalDeleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contentInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedCategoryOption: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  categoryOptionText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  selectedCategoryOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NotesScreen;
