# YuNote - React Native Expo App

Not alma ve görev yönetimi uygulaması.

## 🚨 ÖNEMLİ GÜVENLİK TALİMATLARI

Bu projeyi çalıştırmadan önce aşağıdaki adımları izleyin:

### 1. Firebase Yapılandırması

```bash
# Firebase config dosyasını oluşturun
cp src/config/firebase.example.ts src/config/firebase.ts
```

`src/config/firebase.ts` dosyasını açın ve kendi Firebase bilgilerinizi girin:

- Firebase Console'dan projenizi seçin
- Project Settings > General > Your apps bölümünden config bilgilerini kopyalayın
- `firebase.ts` dosyasına yapıştırın

### 2. Google OAuth Yapılandırması

`src/store/slices/authSlice.ts` dosyasında:

- `YOUR_GOOGLE_CLIENT_ID` yazan yeri kendi Google OAuth Client ID'niz ile değiştirin
- Google Cloud Console'dan OAuth 2.0 Client ID oluşturun

## Özellikler

- ✅ Email/Password ile giriş ve kayıt
- ✅ Google ile giriş (web versiyonunda)
- ✅ Not oluşturma, düzenleme, silme
- ✅ Görev (todo) yönetimi
- ✅ Kategoriler
- ✅ Dosya ekleri (resim, ses)
- ✅ Firebase Authentication
- ✅ AsyncStorage ile veri saklama

## Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Firebase config'i ayarladığınızdan emin olun!
# Web versiyonu (Google Auth çalışır)
npx expo start --web

# Mobil versiyonu
npx expo start
```

## Firebase Yapılandırması

Firebase Authentication ve Google Auth yapılandırılmış durumda.

⚠️ **DİKKAT:** `firebase.ts` dosyası `.gitignore`'da yer alır ve GitHub'a push edilmez.

### Bilinen Uyarılar (Normal)

Bu uyarılar uygulamanın çalışmasını etkilemez:

```
@firebase/auth: Auth (10.14.1):
You are initializing Firebase Auth for React Native without providing AsyncStorage.
```

**Neden çıkıyor:** Firebase web SDK, React Native'de AsyncStorage kullanımını önerir.

**Çözüm:** Uygulama çalışır, auth state saklanır. Bu uyarı görmezden gelinebir.

## Google Auth

- **Web'de:** Popup ile çalışır
- **Mobil'de:** AuthSession veya native Google Sign-In gerekir

## Geliştirme Notları

- ✅ Firebase config artık güvenli şekilde ayrı dosyada
- ✅ Production'da environment variables kullanın
- ✅ AsyncStorage zaten yüklü ve çalışıyor
- ✅ Auth persistence otomatik çalışıyor

## Güvenlik

- Firebase config dosyası Git'e commit edilmez
- Keystore dosyaları korunur
- API anahtarları environment variables ile yönetilir
