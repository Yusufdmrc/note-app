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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { deleteNote, Note } from "../store/slices/noteSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme, getCategoryGradient } from "../config/theme";

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

  // Tema sistemi kullanarak kategori renklerini al
  const getCategoryColor = (category: string) => {
    return getCategoryGradient(category);
  };

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
        <LinearGradient
          colors={theme.gradients.background}
          style={styles.background}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Not Bulunamadı</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
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
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      <LinearGradient colors={["#1e293b", "#475569"]} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Detayı</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.actionButton, styles.deleteActionButton]}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Badge */}
          <View style={styles.categoryContainer}>
            <LinearGradient
              colors={getCategoryColor(note.category)}
              style={styles.categoryBadge}
            >
              <Text style={styles.categoryText}>{note.category}</Text>
            </LinearGradient>
          </View>

          {/* Note Content Card */}
          <View style={styles.noteCard}>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.date}>
              {new Date(note.createdAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text style={styles.noteContent}>{note.content}</Text>
          </View>

          {/* Attachments Section */}
          {note.attachments && note.attachments.length > 0 && (
            <View style={styles.attachmentsCard}>
              <Text style={styles.attachmentsTitle}>Ekler</Text>
              <View style={styles.attachmentsList}>
                {note.attachments.map((attachment) => (
                  <TouchableOpacity
                    key={attachment.id}
                    style={styles.attachmentItem}
                    onPress={() => handleOpenAttachment(attachment)}
                    activeOpacity={0.7}
                  >
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
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
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
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteActionButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  noteCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 8,
    lineHeight: 34,
  },
  date: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    fontWeight: "500",
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 26,
    color: "#334155",
    letterSpacing: 0.2,
  },
  attachmentsCard: {
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
  attachmentsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1e293b",
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
  audioDuration: {
    fontSize: 12,
    color: "#64748b",
  },
});

export default NoteDetailScreen;
