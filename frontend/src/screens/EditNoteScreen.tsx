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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { updateNote } from "../store/slices/noteSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../config/theme";

type EditNoteScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EditNote"
>;

const EditNoteScreen = () => {
  const navigation = useNavigation<EditNoteScreenNavigationProp>();
  const route = useRoute();
  const dispatch = useDispatch();
  const { noteId } = route.params as { noteId: string };

  const note = useSelector((state: RootState) =>
    state.notes.notes.find((n) => n.id === noteId)
  );

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [attachments, setAttachments] = useState(note?.attachments || []);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!note) {
      navigation.goBack();
    }
  }, [note, navigation]);

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

  const handleSave = () => {
    if (!note) return;

    if (title.trim() === "" && content.trim() === "") {
      return;
    }

    const updatedNote = {
      ...note,
      title: title.trim(),
      content: content.trim(),
      updatedAt: new Date().toISOString(),
      attachments,
    };

    dispatch(updateNote(updatedNote));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notu Düzenle</Text>
            <TouchableOpacity
              style={[
                styles.headerButton,
                styles.saveButtonHeader,
                !(title.trim() && content.trim()) && styles.disabledSaveButton,
              ]}
              onPress={handleSave}
              disabled={!(title.trim() && content.trim())}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !(title.trim() && content.trim()) && styles.disabledSaveText,
                ]}
              >
                Kaydet
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.noteCard}>
              <TextInput
                style={styles.titleInput}
                placeholder="Başlık"
                placeholderTextColor="#64748b"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <View style={styles.separator} />
              <TextInput
                style={styles.contentInput}
                placeholder="Notunuzu buraya yazın..."
                placeholderTextColor="#64748b"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Ekler</Text>
              <View style={styles.attachmentButtons}>
                <TouchableOpacity
                  style={styles.attachmentButton}
                  onPress={handleAddImage}
                >
                  <LinearGradient
                    colors={["#4facfe", "#00f2fe"]}
                    style={styles.attachmentButtonGradient}
                  >
                    <Ionicons name="image-outline" size={20} color="#fff" />
                    <Text style={styles.attachmentButtonText}>Fotoğraf</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attachmentButton}
                  onPress={handleAddFile}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.attachmentButtonGradient}
                  >
                    <Ionicons name="document-outline" size={20} color="#fff" />
                    <Text style={styles.attachmentButtonText}>Dosya</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attachmentButton}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <LinearGradient
                    colors={
                      isRecording
                        ? ["#f093fb", "#f5576c"]
                        : ["#43e97b", "#38f9d7"]
                    }
                    style={styles.attachmentButtonGradient}
                  >
                    <Ionicons
                      name={isRecording ? "stop-circle" : "mic"}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.attachmentButtonText}>
                      {isRecording ? "Durdur" : "Ses"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {attachments.length > 0 && (
                <View style={styles.attachmentsList}>
                  {attachments.map((attachment) => (
                    <View key={attachment.id} style={styles.attachmentItem}>
                      <View style={styles.attachmentIcon}>
                        {attachment.type === "image" ? (
                          <Image
                            source={{ uri: attachment.uri }}
                            style={styles.attachmentImage}
                          />
                        ) : attachment.type === "audio" ? (
                          <Ionicons
                            name="musical-note"
                            size={20}
                            color="#64748b"
                          />
                        ) : (
                          <Ionicons
                            name="document-text"
                            size={20}
                            color="#64748b"
                          />
                        )}
                      </View>
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
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b",
  },
  background: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  saveButtonHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledSaveButton: {
    backgroundColor: "rgba(148, 163, 184, 0.3)",
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  disabledSaveText: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noteCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1e293b",
    paddingBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16,
  },
  contentInput: {
    minHeight: 120,
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
    textAlignVertical: "top",
  },
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1e293b",
  },
  attachmentButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  attachmentButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  attachmentButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  attachmentButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  attachmentsList: {
    gap: 12,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  attachmentImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  removeAttachmentButton: {
    padding: 8,
  },
  audioDuration: {
    fontSize: 12,
    color: "#64748b",
  },
});

export default EditNoteScreen;
