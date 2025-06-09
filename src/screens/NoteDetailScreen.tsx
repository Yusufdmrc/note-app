import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { deleteNote, Note } from "../store/slices/notesSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";

type NoteDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "NoteDetail"
>;

const NoteDetailScreen = () => {
  const navigation = useNavigation<NoteDetailScreenNavigationProp>();
  const route = useRoute();
  const dispatch = useDispatch();
  const { noteId } = route.params as { noteId: string };

  const note = useSelector((state: RootState) =>
    state.notes.notes.find((n) => n.id === noteId)
  );

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Bulunamadı</Text>
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    navigation.navigate("EditNote", { noteId: note.id });
  };

  const handleDelete = () => {
    Alert.alert("Notu Sil", "Bu notu silmek istediğinizden emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => {
          dispatch(deleteNote(note.id));
          navigation.goBack();
        },
      },
    ]);
  };

  const handleOpenAttachment = async (attachment: Note["attachments"][0]) => {
    try {
      await Linking.openURL(attachment.uri);
    } catch (error) {
      Alert.alert("Hata", "Dosya açılırken bir hata oluştu.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Text style={[styles.actionButtonText, styles.deleteButton]}>
              Sil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>
          {new Date(note.createdAt).toLocaleDateString("tr-TR")}
        </Text>
        <Text style={styles.noteContent}>{note.content}</Text>

        {note.attachments && note.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <Text style={styles.attachmentsTitle}>Ekler</Text>
            <View style={styles.attachmentsList}>
              {note.attachments.map((attachment) => (
                <TouchableOpacity
                  key={attachment.id}
                  style={styles.attachmentItem}
                  onPress={() => handleOpenAttachment(attachment)}
                >
                  {attachment.type === "image" ? (
                    <Image
                      source={{ uri: attachment.uri }}
                      style={styles.attachmentImage}
                    />
                  ) : (
                    <Ionicons name="document" size={24} color="#666" />
                  )}
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    fontSize: 24,
    color: "#007AFF",
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 16,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  deleteButton: {
    color: "#FF3B30",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
  },
  placeholder: {
    flex: 1,
  },
  attachmentsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  attachmentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  attachmentsList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
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
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
  },
});

export default NoteDetailScreen;
