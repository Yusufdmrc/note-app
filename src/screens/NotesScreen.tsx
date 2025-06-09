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

  const filteredNotes =
    selectedCategory === "Tümü"
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: item.color || "#f5f5f5" }]}
      onPress={() => handleNotePress(item)}
    >
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={styles.noteCategory}>{item.category}</Text>
        <Text style={styles.noteDate}>
          {new Date(item.createdAt).toLocaleDateString("tr-TR")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Notlarım</Text>

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

      {sortedNotes.length === 0 ? (
        <Text style={styles.info}>
          {selectedCategory === "Tümü"
            ? "Henüz hiç notunuz yok. Sağ alttan yeni not ekleyebilirsiniz."
            : `${selectedCategory} kategorisinde not bulunamadı.`}
        </Text>
      ) : (
        <FlatList
          data={sortedNotes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Notu Düzenle</Text>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={handleDeleteNote}
              >
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <TextInput
                style={styles.modalTitleInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Başlık"
                placeholderTextColor="#94a3b8"
              />

              <TextInput
                style={styles.modalContentInput}
                value={editContent}
                onChangeText={setEditContent}
                placeholder="Notunuzu buraya yazın..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
              />

              <View style={styles.modalCategoryContainer}>
                <Text style={styles.modalCategoryTitle}>Kategori</Text>
                <View style={styles.modalCategories}>
                  {allCategories
                    .filter((cat) => cat !== "Tümü")
                    .map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.modalCategoryButton,
                          editCategory === cat && styles.modalSelectedCategory,
                        ]}
                        onPress={() => setEditCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.modalCategoryText,
                            editCategory === cat &&
                              styles.modalSelectedCategoryText,
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
              style={styles.modalSaveButton}
              onPress={handleUpdateNote}
            >
              <Text style={styles.modalSaveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddNote")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  backButton: {
    position: "absolute",
    top: 32,
    left: 16,
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
    marginTop: 0,
  },
  info: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 32,
  },
  noteItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  noteContent: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: "#2563eb",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: -2,
  },
  categoryPickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
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
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  noteCategory: {
    fontSize: 12,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  removeCategoryButton: {
    marginLeft: 4,
    padding: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalDeleteButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  modalScrollView: {
    maxHeight: "80%",
  },
  modalTitleInput: {
    fontSize: 24,
    fontWeight: "600",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    color: "#1e293b",
  },
  modalContentInput: {
    minHeight: 200,
    fontSize: 16,
    padding: 16,
    lineHeight: 24,
    color: "#1e293b",
  },
  modalCategoryContainer: {
    padding: 16,
  },
  modalCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#64748b",
  },
  modalCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalCategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  modalSelectedCategory: {
    backgroundColor: "#2563eb",
  },
  modalCategoryText: {
    fontSize: 14,
    color: "#64748b",
  },
  modalSelectedCategoryText: {
    color: "#fff",
  },
  modalSaveButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  modalSaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotesScreen;
