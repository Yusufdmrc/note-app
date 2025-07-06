import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { RootState, AppDispatch } from "../store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../config/theme";
import { auth } from "../config/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, user } = useSelector((state: RootState) => state.auth);
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  // Şifre değiştirme modal state'leri
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Yeni şifreler eşleşmiyor.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    setPasswordLoading(true);

    try {
      if (!auth.currentUser || !user?.email) {
        throw new Error("Kullanıcı bilgileri bulunamadı");
      }

      // Mevcut şifre ile yeniden kimlik doğrulama
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Şifreyi güncelle
      await updatePassword(auth.currentUser, newPassword);

      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      let errorMessage = "Şifre değiştirirken bir hata oluştu.";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Mevcut şifreniz yanlış.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Yeni şifre çok zayıf.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Güvenlik nedeniyle tekrar giriş yapmanız gerekiyor.";
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(logout()).unwrap();
            } catch (error: any) {
              Alert.alert(
                "Hata",
                error.message || "Çıkış yapılırken bir hata oluştu"
              );
            }
          },
        },
      ]
    );
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
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hesap Bilgileri Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>

            {/* Email */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={20} color="#64748b" />
                <Text style={styles.settingLabel}>E-posta</Text>
              </View>
              <Text style={styles.settingValue}>
                {user?.email || "Bilinmiyor"}
              </Text>
            </View>

            {/* Display Name */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="person-outline" size={20} color="#64748b" />
                <Text style={styles.settingLabel}>Kullanıcı Adı</Text>
              </View>
              <Text style={styles.settingValue}>
                {user?.displayName || user?.email?.split("@")[0] || "Kullanıcı"}
              </Text>
            </View>

            {/* Hesap Oluşturulma Tarihi */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text style={styles.settingLabel}>Üyelik Tarihi</Text>
              </View>
              <Text style={styles.settingValue}>
                {auth.currentUser?.metadata?.creationTime
                  ? new Date(
                      auth.currentUser.metadata.creationTime
                    ).toLocaleDateString("tr-TR")
                  : "Bilinmiyor"}
              </Text>
            </View>

            {/* Şifre Değiştir */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowPasswordModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#64748b"
                />
                <Text style={styles.settingLabel}>Şifre Değiştir</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Görünüm Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Görünüm</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={20} color="#64748b" />
                <Text style={styles.settingLabel}>Karanlık Mod</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
                thumbColor={darkMode ? "#fff" : "#fff"}
                ios_backgroundColor="#e2e8f0"
              />
            </View>
          </View>

          {/* Bildirimler Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Bildirimler</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#64748b"
                />
                <Text style={styles.settingLabel}>
                  Bildirimleri Etkinleştir
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
                thumbColor={notifications ? "#fff" : "#fff"}
                ios_backgroundColor="#e2e8f0"
              />
            </View>
          </View>

          {/* Hakkında Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Hakkında</Text>

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#64748b"
                />
                <Text style={styles.settingLabel}>Versiyon</Text>
              </View>
              <Text style={styles.settingValue}>1.0.0</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-outline" size={20} color="#64748b" />
                <Text style={styles.settingLabel}>Gizlilik Politikası</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#64748b"
                />
                <Text style={styles.settingLabel}>Kullanım Koşulları</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Hesap İşlemleri Section */}
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  loading
                    ? [theme.text.disabled, theme.text.disabled]
                    : [theme.error, "#dc2626"]
                }
                style={styles.logoutGradient}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color="#fff"
                  style={styles.logoutIcon}
                />
                <Text style={styles.logoutButtonText}>
                  {loading ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Şifre Değiştirme Modal */}
        <Modal
          visible={showPasswordModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Şifre Değiştir</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                {/* Mevcut Şifre */}
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Mevcut Şifre</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Mevcut şifrenizi girin"
                    placeholderTextColor={theme.text.disabled}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    editable={!passwordLoading}
                  />
                </View>

                {/* Yeni Şifre */}
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Yeni Şifre</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Yeni şifrenizi girin"
                    placeholderTextColor={theme.text.disabled}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    editable={!passwordLoading}
                  />
                  <Text style={styles.passwordHint}>
                    Şifre en az 6 karakter olmalıdır
                  </Text>
                </View>

                {/* Yeni Şifre Tekrar */}
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Yeni Şifre Tekrar</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Yeni şifrenizi tekrar girin"
                    placeholderTextColor={theme.text.disabled}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!passwordLoading}
                  />
                </View>

                {/* Butonlar */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowPasswordModal(false)}
                    disabled={passwordLoading}
                  >
                    <Text style={styles.cancelButtonText}>İptal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.saveButton,
                      passwordLoading && styles.disabledButton,
                    ]}
                    onPress={handleChangePassword}
                    disabled={passwordLoading}
                  >
                    <LinearGradient
                      colors={
                        passwordLoading
                          ? [theme.text.disabled, theme.text.disabled]
                          : [theme.primary, theme.secondary]
                      }
                      style={styles.saveButtonGradient}
                    >
                      {passwordLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.saveButtonText}>Değiştir</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
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
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  logoutButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#ef4444",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Modal stilleri
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  closeButton: {
    padding: 8,
  },
  modalForm: {
    padding: 20,
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  passwordHint: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default SettingsScreen;
