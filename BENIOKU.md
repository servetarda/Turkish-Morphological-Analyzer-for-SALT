# SALT için Türkçe Morfolojik Analiz Aracı

**SALT (Systematic Analysis of Language Transcripts)** formatına uygun olarak, Türkçe metinlerin **morfolojik analizi** için tasarlanmış web tabanlı bir araçtır[cite: 2]. Bu analizör, doğru morfolojik dökümler sağlamak için dilbilimsel sezgisel puanlama ile birleştirilmiş bir geri izleme (backtracking) algoritması kullanır[cite: 1].

## 🚀 Özellikler

*   **Morfolojik Analiz**: Türkçe kelimeleri Kök + Ek bileşenlerine ayırır[cite: 1].
*   **SALT Uyumluluğu**: Çıktıyı SALT transkriptleri için gerekli olan `kök/ek[etiket]` notasyonunu kullanarak otomatik olarak formatlar[cite: 1, 2].
*   **Sezgisel Puanlama Motoru**: Olası çözümlemeleri şu kriterlere göre puanlayarak dilbilimsel belirsizlikleri giderir:
    *   **Zamir Uyumu**: Sonraki kelimelerdeki iyelik eki eşleşmelerini doğru ödüllendirmek için tamlayan bağlamını (örneğin "Benim") takip eder[cite: 1].
    *   **Morfotaktik Doğrulama**: Çift çoğul veya çift durum eki gibi geçersiz kombinasyonları önlemek için katı ek sıralama kurallarını uygular[cite: 1].
    *   **Büyük/Küçük Harf Koruması**: Analiz edilen kelimelerin orijinal büyük/küçük harf durumunu çıktıda korur[cite: 1].
*   **Modern Kullanıcı Arayüzü**: "Inter" yazı tipi ailesini ve özel CSS özelliklerini kullanan duyarlı bir tasarıma sahiptir[cite: 2, 3].
*   **Panoya Kopyala**: Analiz edilen transkriptleri araştırma kullanımı için dışa aktarmaya yarayan tek tıkla kopyalama özelliği sunar[cite: 1, 2].

## 🛠️ Teknik Uygulama

### Temel Mantık (`analyzer.js`)
Analiz motoru, potansiyel ek eşleşmeleri üzerinden bir **geri izleme araması (backtracking search)** yürütür[cite: 1]. Performansı ve doğruluğu optimize etmek için ekler, önce en uzun eşleşmeleri deneyecek şekilde uzunluklarına göre sıralanır[cite: 1].

### Ek Hiyerarşisi
Araç, Türkçe dilbilgisini bir sıralama sistemi (`ORDER_RANKS`) aracılığıyla uygular[cite: 1]:
*   **İsim Ekleri**: Çoğul (Derece 1), İyelik (Derece 2) ve Durum Ekleri (Derece 3)[cite: 1].
*   **Fiil Ekleri**: Edilgen/Ettirgen (Derece 10), Yeterlik (Derece 11), Zaman (Derece 13) ve Kişi (Derece 14)[cite: 1].
*   **Evrensel**: Ek-fiil ve Soru ekleri (Derece 20)[cite: 1].

## 📂 Proje Yapısı

*   `index.html`: Ana kullanıcı arayüzü ve giriş noktası[cite: 2].
*   `style.css`: Web arayüzü için modern ve temiz stil tasarımı[cite: 3].
*   `analyzer.js`: Kelime analizi, geri izleme ve puanlama sezgiselleri için temel mantık[cite: 1].
*   `lexicon.js`: Türkçe köklerin ve sözcük türlerinin kapsamlı veritabanı[cite: 4].

## 📦 Kullanım

1. `index.html` dosyasını web tarayıcınızda açın[cite: 2].
2. Türkçe transkriptinizi metin alanına yapıştırın[cite: 2].
3. Analizi oluşturmak için **"Analyze Text"** düğmesine tıklayın[cite: 2].
4. Açıklamalı verilerinizi dışa aktarmak için **"Copy to Clipboard"** düğmesini kullanın[cite: 2].

---
*Dilbilimsel araştırmalar ve otomatik transkript etiketleme için geliştirilmiştir.*
