# LyngL ürün incelemesi

İnceleme tarihi: 16 Ekim 2026. İnceleme, kullanıcının açtığı ve giriş yaptığı çalışma alanındaki görünür ekranlar üzerinden yapıldı. Bu çalışma alanında aktif hedef veya görev yoktu; görev oluşturup kredi tüketmedim ve hiçbir ayarı kaydetmedim.

## Ürünün ana fikri

LyngL yalnızca animasyonlu bir ofis görünümü değil. Bir Manager ajanına istenen sonucu veriyorsun; Manager uygun departmanları ve çalışanları seçiyor, işi alt görevlere bölüyor, maliyet ve risk tahmini yapıyor, devirleri koordine ediyor, gereken yerde onay istiyor ve doğrulanmış çıktıyı teslim ediyor. Tekrarlanan işler ayrı bir zamanlayıcıyla çalışıp her seferinde Manager'a yeni hedef açıyor.

Çalışan profilleri, bu yapının ikinci ana katmanı: her çalışan için kalıcı talimatlar, beceriler, sorumluluklar, kişilik, yetenek/araç izinleri, doğrudan mesaj ve son görevler alanı var. Sayfa, izinlerin unvana göre değil araç yeteneklerine göre denetlendiğini belirtiyor.

## Ana ekran düzeni

- Sol koyu menüde Office ve Manager; ardından Work, Growth, Team, Automation ve Workspace grupları var.
- Üst çubukta çalışma alanı seçici, Live durumu, bildirimler, Stop all ve hesap menüsü var.
- Office ekranı masaüstünde üç bölümlü: sol menü, ortada isometrik ofis haritası, sağda Manager/Activity paneli.
- Ofis haritasının altında yakınlaştırma, uzaklaştırma, döndürme, ekrana sığdırma ve görünüm kontrolleri bulunuyor. Ekip listesi çalışan adını, durumunu ve ofisteki yerini gösteriyor.
- Sağ panelde boş durum metni, örnek hedefler ve altta çok satırlı hedef girişi bulunuyor. Enter gönderiyor, Shift+Enter yeni satır açıyor.
- Görsel dil: neredeyse siyah arka plan, ince gri sınırlar, küçük yuvarlatılmış paneller, açık krem ofis çizimi, serif başlıklar ve sade sans-serif içerik.

## Sol menü ve incelenen sayfalar

| Bölüm | Görülen işlev |
|---|---|
| Office | Ofis haritası, ekip durumu, Manager hedef girişi ve canlı etkinlik paneli. İlk durumda 15 çalışan ve aktif hedef yok. |
| Manager | Sonuç odaklı hedef girişi ve örnek hedefler. Örnekler uygulama geliştirme, haftalık Reels/reklam, rakip araştırması ve haftalık rapor. |
| Tasks | Goals ve All tasks sekmeleri; tüm görevlerde All, Active, Needs attention ve Done filtreleri. Hedef oluşturulunca iş planı burada görünüyor. |
| Projects | Her hedefin kendi proje alanı, belleği, artifact'leri ve çıktı dilleri var. Proje, Manager hedefi planladığında oluşuyor. |
| Development | GitHub bağlantısı, kod/depo/test/dağıtım panelleri. Ekran kodun yalıtılmış sandbox'larda çalıştırılmasını anlatıyor; bu hesapta sandbox henüz etkin değil. GitHub için sınırlı yetkili token; dağıtım için Vercel veya webhook ve üretim dağıtımında onay gerekiyor. |
| Artifacts | Belgeler, kod, tasarım ve raporlar için çıktı alanı. |
| Approvals | Waiting ve History sekmeleri. Riskli/dış etkili her aksiyon ayrı bir onay bekliyor; her onay yalnızca tek aksiyonu açıyor. |
| Activity | Ekibin yaptığı işleri akış halinde gösteriyor; sistem olaylarını dahil etme anahtarı var. |
| Content | Reels, gönderi ve hikâye taslakları/üretimleri. Yayına çıkmadan önce gözden geçirme akışı var. |
| Calendar | Ay/hafta görünümü ve çalışma alanı saat diliminde planlı gönderiler. |
| Campaigns | Meta reklamları; reklam bütçesi limiti yoksa hiçbir şeyin yayına çıkamayacağını belirten koruma mesajı var. Reklam harcaması doğrudan reklam platformuna gidiyor. |
| Analytics | İçerik ve reklam performansı; 7/14/30 günlük dönem seçimi ve yenileme. Yayın veya reklam yoksa boş durum gösteriyor. |
| Employees | Çalışan, departman, anlık durum ve 30 günlük maliyet tablosu. 15 hazır çalışan bulunuyor. |
| Departments | Çalışanları ve ofisteki fiziksel alanlarını grupluyor. 11 departman: Executive, Product, Software Development, Design, Research, Growth & Marketing, Content, Advertising, Data & Analytics, Customer Support ve Operations. |
| Workflows | Zamanlayıcı; her çalışma Manager'a yeni bir hedef veriyor. Hazır günlük/hafta içi/Pazartesi/Pzt-Çrş-Cuma seçenekleri, özel cron ifadesi ve saat dilimi alanı var. |
| Integrations | 1.000+ uygulama araması/kategori gezintisi. Gmail, Calendar, Drive, Sheets, Notion, Slack, HubSpot, Shopify, Instagram, Facebook, LinkedIn, YouTube, Trello ve benzeri bağlantılar. E-posta gönderme, paylaşım ve diğer veri değişiklikleri onay bekliyor. |
| Usage | Abonelik, agent kullanımı, medya kullanımı, reklam harcaması, kredi bakiyesi, günlük kullanım, kategori/çalışan dökümleri ve bütçe limitleri. |
| Settings | General, Language & market, Brand, Instagram & Meta, Autonomy & policies, Keys, Budgets, Plan ve Emergency stop sekmeleri. |

## Çalışan profili ve ajan modeli

Çalışan profilinde Right now, Standing instructions, Recent tasks, Capabilities, Direct messages, Profile, Skills, Responsibilities ve Personality panelleri var. Yetenekler örneğin web.search, code.read/write/execute/test/build, github.read/write/branch/commit/PR, file.read/write ve workspace.artifacts/memory gibi izinler olarak listeleniyor.

İncelediğim çalışan profillerinde model seviyesi metin olarak görünüyor; örneğin Manager ve Codey için Reasoning, Atlas için Balanced. Profilde sağlayıcı/model seçici görmedim. Settings → Keys ekranı, kendi AI/image/search anahtarlarının Enterprise planında olduğunu söylüyor; Usage ekranı kendi sağlayıcı anahtarıyla yapılan işin LyngL kredisi tüketmediğini belirtiyor. Bu, hedef uygulamamızın farklı çalışanlara ayrı sağlayıcı/model ataması için alan bırakmamız gerektiğini gösteriyor.

## Güvenlik, bütçe ve maliyet

- Özerklik modları: Approval mode, Guarded autopilot ve Full autopilot.
- Politika örnekleri: sosyal gönderiyi onaysız yayınlama, preview dağıtımı, üretim dağıtımlarında her zaman onay.
- Tehlikeli aksiyon, harcama sınırı, çalışma alanı izolasyonu ve güvenlik kurallarının backend'de zorunlu olduğu yazıyor.
- Bütçe kuralı türleri: ad spend, media spend, agent spend. Haftalık, günlük, kampanya başı, tek aksiyon ve bir düzenlemede izin verilen en büyük değişim sınırları var.
- Medya kalitesi ve görev başına görsel/video/regenerasyon limitleri ayrıca ayarlanıyor.
- İncelenen hesapta plan sayfası Free plan için ayda 500 kredi; Pro için ayda 25.000 kredi + 15.000 medya kredisi ve 399,90 USD/ay gösterdi. Kredi paketleri 2.000/19,90 USD, 5.000/69,90 USD, 10.000/89,90 USD ve 20.000/129,90 USD olarak görünüyordu. Bunlar inceleme anındaki hesap ekranındaki değerler; değişebilir.
- Plan ekranı kredilerin çalışma, görsel ve video üretiminde kullanıldığını; kullanım için bekleyen işin kredi gelince başladığını belirtiyor.

## Geliştirirken çıkarılacak sonuçlar

1. İlk sürümde en görünür ve en değerli akış Office → Manager hedefi → görev planı → çalışan detayları → çıktı/onay olmalı.
2. Ofis çizimi bizim tarafımızdan üretilecek özgün SVG/CSS olmalı; görünümdeki izometrik oda düzeni ve hareket hissi yaklaşımı alınabilir.
3. Uygulama tek bir hedef kutusu olan sohbetten ibaret kalmamalı; Tasks, Projects, Employees, Departments, Approvals, Activity ve Workflows arayüzde birbirine bağlı çalışmalı.
4. Her çalışan için sağlayıcı, model, API uyumlu uç nokta ve araç izinlerini bağımsız ayarlamak, kullanıcının maliyet/özelleştirme gereksinimini karşılar.
5. API anahtarları tarayıcı localStorage'ına açık metin olarak yazılmamalı. Kalıcı anahtar kasası için yerel backend ve şifreleme gerekir.
6. Şu anki LyngL çalışma alanında gerçek görev/çıktı örneği yoktu; aktif iş planı, canlı agent handoff'u ve dolu onay ekranının davranışı bu nedenle gözlenemedi.

## Kesin ürün gereksinimi: Office aynı çalışma mantığını taşımalı

Kullanıcının önceliği, LyngL Office ekranının yalnızca görsel benzerliği değil, hedef verip ekibin çalışmasını izleme mantığıdır. Bu yüzden Office ilk sürümün ana çalışma alanı olacak; genel bir sohbet ekranına veya yalnızca çalışan kartlarına indirgenmeyecek.

- **Ana yerleşim:** solda ürün menüsü; ortada departman alanları olan izometrik ofis ve çalışanların konum/durumları; sağda Manager/Activity paneli; üstte çalışma alanı ve acil durdurma kontrolleri.
- **Hedef akışı:** kullanıcı sağ panelden sonuç odaklı hedef verir; Manager hedefi planlar, çalışanlara alt görevler atar ve planı Office'te görünür kılar.
- **Canlı ekip görünümü:** her çalışan, departmanına bağlı ofis alanında görünür; Idle/Working/Offline durumu ekip listesi ve görev akışıyla tutarlı kalır. İş başladığında ofis durumu, görev ve Activity akışı aynı olaylardan güncellenir.
- **İzleme ve gezinme:** çalışan listesi profili açar; ofis haritasında çalışan seçilebilir; yakınlaştırma, döndürme, sığdırma, isimleri gösterme ve hareketi azaltma kontrolleri korunur.
- **İlk sürümde zorunlu olan bağ:** Manager hedefi → plan/görevler → çalışan ataması → görünür çalışma durumu → sonuç/aktivite. Bu bağ kurulmadan Office tamamlanmış sayılmayacak.
- **Bugünkü prototip sınırı:** mevcut `index.html`/`app.js` Office düzenini ve yerel demo akışını kuruyor. Haritadaki çalışanlar henüz gerçek ajan yürütmesine bağlı değil; Manager örnek plan oluşturuyor ve gerçek zamanlı hareket/agent handoff henüz uygulanmadı.

Bu notlar, LyngL'nin gözlenebilir kullanıcı arayüzü ve davranışına dayanır. Uygulamanın kapalı backend mimarisi, iç veri modeli ve kaynak kodu incelenmedi; yerel sürümün backend tasarımı ayrıca oluşturulmalıdır.
