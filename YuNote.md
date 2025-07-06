YuNote Mobil Uygulaması – Product Requirements Document (PRD)

1. Proje Tanımı (Project Overview)
   YuNote, kullanıcıların dijital olarak not alabileceği, yapılacaklar listesi (to-do list) oluşturabileceği, takvim entegrasyonu ile etkinlik ve görev planlayabileceği, konuma dayalı hatırlatıcılar ekleyebileceği ve bu bilgileri bulutta senkronize bir şekilde yönetebileceği bir mobil uygulamadır.

YuNote, yoğun iş temposu ve gündelik hayat karmaşası içinde kullanıcıların organize kalmalarını, verimliliklerini artırmalarını ve görevlerini zamanında yerine getirmelerini desteklemeyi hedefler.

2. Hedef Kitle (Target Audience)
   Günlük hayatta not alma ihtiyacı duyan bireyler (öğrenciler, ev hanımları, freelancer'lar).

Profesyonel çalışanlar (mühendisler, doktorlar, öğretmenler, yöneticiler).

Takvim ve yapılacak listesi üzerinden çalışma alışkanlığı olan bireyler.

Görev yönetimini mobil cihazlarından gerçekleştirmek isteyen herkes.

3. Temel Özellikler (Core Features)
   🔹 Kullanıcı Paneli Özellikleri
   ✅ Kayıt ve Giriş (Authentication)

✅ E-posta & şifre ile kayıt/giriş

✅ Google sosyal medya hesaplarıyla giriş

❌ Apple sosyal medya hesaplarıyla giriş

❌ Şifre sıfırlama ve kullanıcı doğrulama işlemleri

✅ Not Oluşturma ve Yönetimi

✅ Metin tabanlı not alma

✅ Renk ve etiket ile kategorilendirme

✅ Notlara fotoğraf veya dosya ekleme

❌ Sesli not kaydı

❌ Notlara hatırlatıcılar ekleyebilme

✅ Yapılacaklar Listesi (To-Do List)

✅ Görev oluşturma, düzenleme, silme

✅ Tamamlandı işaretleme

❌ Alt görev oluşturabilme

❌ Görev önceliği ve kategori tanımlama

❌ Takvim Entegrasyonuı

❌ Takvim görünümü (günlük, haftalık, aylık)

❌ Etkinlik oluşturma ve alarm ekleme

❌ Notları ve görevleri takvimle eşleştirme

❌ Google Takvim ile entegrasyon (isteğe bağlı)

❌ Harita Tabanlı Hatırlatıcılar

❌ Belirli bir konuma ulaşıldığında hatırlatma özelliği

❌ Google Maps API ile entegre harita servisi

❌ Bildirimler (Notifications)

❌ Görev öncesi bildirim

❌ Günlük özet hatırlatıcılar

❌ Notlara bağlı hatırlatma alarmları

✅ Veri Senkronizasyonu ve Depolama

✅ Tüm verilerin Firebase Firestore'da saklanması

✅ Cihazlar arası eşzamanlama

✅ Dosya ve fotoğraflar için Firebase Storage entegrasyonu

❌ Offline Mode

❌ İnternet bağlantısı olmadığında da not alma ve görev oluşturma

❌ Bağlantı kurulduğunda senkronizasyon

🔹 Yönetim Paneli (Opsiyonel – Admin Kullanımı için)
❌ Kullanıcı yönetimi

❌ Bildirim kampanyaları oluşturma

❌ Hata raporları ve geri bildirim takibi

❌ Uygulama kullanım istatistikleri

4. Teknik Gereksinimler (Technical Requirements)
   ✅ Frontend (Mobil Uygulama)
   ✅ Framework: React Native (Expo)

✅ State Management: Redux

✅ UI Kit: NativeWind (TailwindCSS for RN)

❌ Bildirim Yönetimi: Firebase Cloud Messaging

❌ Harita Servisi: Google Maps API

✅ Görsel/Dosya Yükleme: Firebase Storage

✅ Backend
✅ Dil: Node.js

✅ Framework: Express.js

✅ Veritabanı: Firebase Firestore

✅ Authentication: Firebase Authentication

✅ Real-time Sync: Firestore Real-time Updates

📦 Ek Teknolojiler
❌ Sentry (Hata Takibi ve Logging)

❌ Google Analytics for Firebase (Kullanıcı davranışı ölçümü)

❌ App Check (Firebase üzerinden güvenli erişim doğrulaması)

5. Kullanıcı Deneyimi (UX) ve Arayüz (UI)
   ✅ Basit ve Temiz Arayüz: Karmaşadan uzak, minimalist tasarım

❌ Karanlık ve Açık Tema Desteği

❌ Swipe Actions: Not silme, düzenleme gibi işlevlere kaydırma hareketiyle erişim

❌ Drag & Drop: Görevlerin sıralamasını değiştirmek için sürükle bırak desteği

❌ Çoklu Dil Desteği (TR / EN)

6. Gelecek Sürümlerde Eklenebilecek Özellikler
   ❌ Not paylaşımı (başka kullanıcılarla paylaşma, birlikte düzenleme)

❌ Takım modülü (ekip içi yapılacaklar listesi ve görev takibi)

❌ Yapay Zeka ile Öneri Sistemi (günlük yapılacak önerisi, not sınıflandırma)

❌ Sesli Asistan ile not oluşturma

❌ iOS/Android widget desteği

---

## 📊 Proje Durumu Özeti

**Tamamlanan Özellikler (✅): 16/32**

- Kullanıcı Kimlik Doğrulama (E-posta, Google)
- Not Oluşturma ve Yönetimi
- Yapılacaklar Listesi
- Firebase Entegrasyonu
- Temel UI/UX

**Yapılacak Özellikler (❌): 16/32**

- Takvim Entegrasyonu
- Harita ve Konum Tabanlı Hatırlatıcılar
- Bildirim Sistemi
- Offline Mode
- Gelişmiş UI/UX Özellikleri

**Proje Tamamlanma Oranı: %50**
