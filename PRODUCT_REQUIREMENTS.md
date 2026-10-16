# Codly Office — onaylanan ürün gereksinimleri

Bu dosya, kullanıcının açıkça belirttiği ürün hedeflerini ve bunların mimari sonuçlarını kaydeder.

## Ürün hedefi

LyngL'nin gözlemlenen Office çalışma mantığına dayanan, bağımsız bir çoklu ajan çalışma alanı geliştirmek. Office ana yüzeydir: kullanıcı Manager'a hedef verir; Manager işi planlayıp ekibe atar; çalışanların görev ve durumları ofis haritasında, ekip listesinde ve Activity akışında birlikte görünür.

## Kullanım yüzeyleri

- Aynı ürün web tarayıcısından kullanılabilmeli.
- Aynı ürün macOS ve Windows masaüstü uygulaması olarak kurulabilmeli.
- Kullanıcı, workspace'i ve çalışan yapılandırmalarını bu yüzeyler arasında tutarlı kullanabilmeli.
- Web ve masaüstü istemcileri mümkün olduğunca ortak arayüzü ve ortak ürün/API katmanını paylaşmalı.

## Çalışan profilleri ve adlandırma

- Her çalışan için görünen ad düzenlenebilmeli. Örneğin Ethan adı kullanıcı tarafından değiştirilebilmeli.
- Görünen ad; çalışanın sabit kimliğinden, rolünden, departmanından, becerilerinden ve talimatlarından ayrı tutulmalı. Yeniden adlandırma görev geçmişini veya atamaları bozmamalı.
- Çalışan profili rol, departman, beceriler, talimatlar, izinler, durum ve son görevleri göstermeli.

## Çalışan başına model yönlendirme

- Her çalışana bağımsız bir model sağlayıcısı, model kimliği ve gerekirse özel API uyumlu uç nokta atanabilmeli.
- Kullanıcı sağlayıcı API anahtarını isteğe bağlı bağlayabilmeli. Anahtar bağlanmayan çalışanlar yerel model sunucusu veya henüz yapılandırılmamış durumda kalabilmeli.
- Ollama ve LM Studio gibi OpenAI uyumlu yerel sunucuların adresi ve model adı tanımlanabilmeli; bağlantı durumu çalışan profilinde görülebilmeli.
- Model rotası isteği doğru çalışana ait sağlayıcıya göndermeli. Manager ve uzman çalışanlar farklı model/sağlayıcı kullanabilmeli.
- Sağlayıcı, model veya bağlantı hatası kullanıcıya anlaşılır gösterilmeli; onaysız biçimde farklı sağlayıcıya geçilmemeli.

## Yerel modeller için platform farkı

Masaüstü istemcisi aynı bilgisayardaki Ollama/LM Studio sunucusuna bağlanabilir. Web tarayıcısından kullanılan ürünün kullanıcının `localhost` adresine doğrudan erişebileceği varsayılmamalı. Web kullanımı için iki yol tasarlanmalı: kullanıcı tarafından erişilebilir bir model sunucusu ya da kullanıcının makinesinde çalışan, web uygulamasına güvenli biçimde bağlanan yerel köprü.

## Kimlik bilgisi ve veri sınırı

- API anahtarları `localStorage` veya uygulama veritabanında açık metin saklanmamalı.
- Masaüstü istemcisi anahtarları işletim sisteminin güvenli kimlik bilgisi deposunu kullanarak saklamalı.
- Web istemcisinde anahtar saklama, şifreli sunucu kasası veya açıkça geçici oturum yaklaşımından biri olarak tasarlanmalı; model isteklerinin hangi sağlayıcıya gittiği kullanıcıya belirtilmeli.
- Yerel model seçildiğinde istek yerel sunucuya gitmeli; bulut sağlayıcısı seçildiğinde prompt ve bağlam ilgili sağlayıcıya gönderileceği için veri akışı açık olmalı.

## Office için kabul kriteri

Hedef → Manager planı → çalışan ataması → gerçek çalışan yürütmesi → görev/Activity/durum güncellemesi zinciri Office'te izlenebilmelidir. Harita dekor olarak kalmamalı; çalışanların durumu görev yürütmesinin gerçek durumundan beslenmelidir. Bu zincir tamamlanmadan Office ilk sürüm için tamamlanmış sayılmaz.

## Uygulama durumu — ilk yerel dikey dilim

`index.html`, `styles.css` ve `app.js` Office odaklı web arayüzünü; `server.mjs` yalnızca localhost üzerinde çalışan yerel API/runtime'ı sağlar. Node 22+ ile `npm start` kullanılır. Supabase yapılandırıldığında hesap girişi ve kullanıcıya özel workspace snapshot eşitlemesi açılır; `workspace-store.js` sağlayıcıya özel bağlantıyı izole eder.

Şu an uygulanmış:

- Manager hedefi yapılandırılmış model rotasına gönderir ve JSON planı oluşturur.
- Kullanıcı planı gözden geçirip başlattığında görevler sırayla atanmış çalışanların ayrı rotalarına gider.
- Çalışan adını değiştirmek sabit çalışan kimliğini ve görev ilişkisini bozmaz.
- Görev durumları ve çıktıları Office, Tasks ve Activity yüzeylerinde görünür.
- OpenAI uyumlu provider'lar, Anthropic ve Gemini istek biçimleri desteklenir; Ollama/LM Studio bu uyumlu rotadan çağrılır.
- Three.js ile büyütülmüş 3D Office sahnesi, tek departman girişi olan ayrı cam bölmeli odalar, ahşap zeminler, resepsiyon ve belirgin bir ana giriş, koridor lounge/bitkileri ve mesleğe uygun oda dekorları bulunur. Software Development içindeki DevOps server odasına yalnızca yazılım odasından girilir. Growth & Marketing odası sosyal medya üretim stüdyosu olarak renkli dekor, ışık ve kamera içerir. Çalışanlar ara sıra kendi odalarında dolaşır; kahve/toplantı isteklerinde koridor rotasından hedefe gider. Çalışan üzerine gelince rol, departman, durum ve son görev kartı görünür.
- Mouse wheel ve görünür +/− kontrolleri aynı yakınlaştırma aralığını kullanır; Office tekrar çizildiğinde yakınlaştırma korunur ve fit kontrolü ilk görünüme döndürür.
- Çalışan profillerinde görünür DM konuşma alanı bulunur; hazır model rotasına mesaj gönderir ve konuşma geçmişini tarayıcıda tutar.
- Kahve molası çalışanları kafe alanına gönderir; toplantı isteği çalışanları toplantı masasında toplar. Model rotası hazır katılımcılar sırayla konuşur ve Manager notları toparlar.
- Supabase Auth e-posta/şifre kaydı ve girişi; RLS ile kullanıcının yalnızca kendi workspace snapshot'ına erişmesi.
- Yerel localStorage kaydını yeni hesapta başlangıç snapshot'ı olarak yükleme, Supabase Realtime ile açık istemcileri güncelleme ve revision kontrolüyle eski yazımların yeni snapshot'ı ezmesini engelleme. Provider API key'leri eşitleme yükünden çıkarılır.

Şu an sınırlı veya sonraya bırakılmış:

- API anahtarları sadece yerel Node sürecinin belleğinde kalır; şifreli kalıcı kasa yoktur.
- Supabase yapılandırılmadığında provider/model/endpoint ayarları ve Office kayıtları yalnızca tarayıcı `localStorage` alanındadır. Supabase etkinse hassas anahtar alanları çıkarılmış snapshot kullanıcı hesabına eşitlenir.
- Ajan görevleri metin üretir; toplantı turu da hazır model rotalarıyla konuşma metni üretir. Shell, dosya, web arama, GitHub veya başka araç çağrıları yoktur.
- Görevler sıralı çalışır. Çalışan model çağrısı tamamlanırken Stop all yeni görev başlamasını durdurur.
- Desktop istemcileri, Hetzner'da güvenli web/runtime dağıtımı, workspace üyeliği/davetleri, şifreli kalıcı sağlayıcı anahtarı kasası, zamanlayıcı, entegrasyonlar, onay altyapısı, kalıcı proje belleği/artifact deposu, bütçe ve gerçek kullanım muhasebesi yoktur.

LyngL benzeri Office kabul kriterinin ilk adımı bağlandı; Supabase başlangıç backend'i kullanıcı hesabı ve cihazlar arası özel workspace senkronizasyonu için eklendi. Hetzner'a geçerken workspace store adapter'ı kendi doğrulanan API'sine taşınmalı; yerel model runtime'ı internete doğrudan açılmamalıdır.
