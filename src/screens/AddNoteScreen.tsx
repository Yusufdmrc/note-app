import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  addNote,
  NoteCategory,
  Note,
  addCustomCategory,
} from "../store/slices/noteSlice";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../store";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type NoteColor = string;

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const DEFAULT_CATEGORIES: NoteCategory[] = [
  "Kişisel",
  "İş",
  "Alışveriş",
  "Eğitim",
  "Diğer",
];
const COLORS: NoteColor[] = [
  "#FFE4E1",
  "#E0FFFF",
  "#F0FFF0",
  "#FFF0F5",
  "#F5F5DC",
  "#FFFFFF",
];

const AddNoteScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("Kişisel");
  const [color, setColor] = useState<NoteColor>("#FFFFFF");
  const [attachments, setAttachments] = useState<Note["attachments"]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const customCategories = useSelector(
    (state: RootState) => state.notes.customCategories
  );

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "İzin Gerekli",
          "Ses kaydı yapmak için mikrofon izni gereklidir."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Ses kaydı başlatma hatası:", error);
      Alert.alert(
        "Hata",
        "Ses kaydı başlatılırken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        throw new Error("Kayıt URI'si alınamadı");
      }

      const { durationMillis } = await recording.getStatusAsync();
      const duration = Math.round(durationMillis / 1000);

      const newAttachment = {
        id: Date.now().toString(),
        type: "audio" as const,
        uri,
        name: `Ses Kaydı ${new Date().toLocaleTimeString()}.m4a`,
        duration,
      };

      setAttachments([...attachments, newAttachment]);
    } catch (error) {
      console.error("Ses kaydı durdurma hatası:", error);
      Alert.alert(
        "Hata",
        "Ses kaydı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  };

  const handleAddImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "İzin Gerekli",
        "Fotoğraf eklemek için galeri izni gereklidir."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAttachment = {
        id: Date.now().toString(),
        type: "image" as const,
        uri: result.assets[0].uri,
        name: result.assets[0].uri.split("/").pop() || "image.jpg",
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handleAddFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets[0]) {
        const newAttachment = {
          id: Date.now().toString(),
          type: "file" as const,
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          size: result.assets[0].size,
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      Alert.alert("Hata", "Dosya seçilirken bir hata oluştu.");
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((att) => att.id !== attachmentId));
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      if (allCategories.includes(newCategory.trim() as NoteCategory)) {
        Alert.alert("Hata", "Bu kategori zaten mevcut!");
        return;
      }
      dispatch(addCustomCategory(newCategory.trim() as NoteCategory));
      setCategory(newCategory.trim() as NoteCategory);
      setNewCategory("");
      setShowNewCategoryModal(false);
    }
  };

  const handleAddNote = () => {
    if (title.trim() && content.trim()) {
      const newNote = {
        id: generateId(),
        title: title.trim(),
        content: content.trim(),
        category,
        color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        attachments,
      };
      dispatch(addNote(newNote));
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButton}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddNote}>
            <Text style={styles.saveButton}>Kaydet</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <TextInput
            style={styles.titleInput}
            placeholder="Başlık"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="Notunuzu buraya yazın..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.attachmentsContainer}>
            <View style={styles.attachmentButtons}>
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={handleAddImage}
              >
                <Ionicons name="image-outline" size={24} color="#007AFF" />
                <Text style={styles.attachmentButtonText}>Fotoğraf</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={handleAddFile}
              >
                <Ionicons name="document-outline" size={24} color="#007AFF" />
                <Text style={styles.attachmentButtonText}>Dosya</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.attachmentButton,
                  isRecording && styles.recordingButton,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons
                  name={isRecording ? "stop-circle" : "mic"}
                  size={24}
                  color={isRecording ? "#FF3B30" : "#007AFF"}
                />
                <Text
                  style={[
                    styles.attachmentButtonText,
                    isRecording && styles.recordingButtonText,
                  ]}
                >
                  {isRecording ? "Kaydı Durdur" : "Ses Kaydı"}
                </Text>
              </TouchableOpacity>
            </View>

            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentItem}>
                    {attachment.type === "image" ? (
                      <Image
                        source={{ uri: attachment.uri }}
                        style={styles.attachmentImage}
                      />
                    ) : attachment.type === "audio" ? (
                      <Ionicons name="mic" size={24} color="#666" />
                    ) : (
                      <Ionicons name="document" size={24} color="#666" />
                    )}
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      {attachment.type === "audio" && attachment.duration && (
                        <Text style={styles.audioDuration}>
                          {`${Math.floor(attachment.duration / 60)}:${(
                            attachment.duration % 60
                          )
                            .toString()
                            .padStart(2, "0")}`}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveAttachment(attachment.id)}
                      style={styles.removeAttachmentButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategori</Text>
            <View style={styles.categoriesContainer}>
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => setShowNewCategoryModal(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
                <Text style={styles.addCategoryText}>Yeni Kategori</Text>
              </TouchableOpacity>
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.selectedCategory,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.selectedCategoryText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Renk</Text>
            <View style={styles.colorsContainer}>
              {COLORS.map((col) => (
                <TouchableOpacity
                  key={col}
                  style={[
                    styles.colorButton,
                    { backgroundColor: col },
                    color === col && styles.selectedColor,
                  ]}
                  onPress={() => setColor(col)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  contentInput: {
    minHeight: 200,
    fontSize: 16,
    padding: 16,
    lineHeight: 24,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#666",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  selectedCategory: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  colorsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  attachmentsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  attachmentButtons: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  attachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  attachmentButtonText: {
    fontSize: 14,
    color: "#007AFF",
  },
  attachmentsList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  attachmentImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  attachmentName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  removeAttachmentButton: {
    padding: 4,
  },
  recordingButton: {
    backgroundColor: "#FFE4E1",
  },
  recordingButtonText: {
    color: "#FF3B30",
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 8,
  },
  audioDuration: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
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
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
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
});

export default AddNoteScreen;
