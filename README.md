# Codlyio Studio

Codlyio Studio, yapay zekâ çalışanlarını tek bir çalışma alanında organize etmeyi hedefleyen bağımsız bir üründür. Ana sayfa ürünü tanıtır; `/office` rotası etkileşimli çalışma alanını açar. Bu ilk yerel dikey dilim Office akışını gerçek model çağrılarıyla bağlar: kullanıcı hedef verir, Manager plan hazırlar, kullanıcı planı çalıştırır ve her görev atanmış çalışanın model rotasında yürür. LyngL kaynak kodu veya görsel dosyaları kullanılmaz.

## Yerel olarak başlatma

- Node.js 22 veya üzeri gerekir.
- Terminalde proje klasöründe `npm install` komutunu bir kez çalıştırın.
- Terminalde proje klasöründen `npm start` komutunu çalıştırın.
- Tanıtım ana sayfasını `http://127.0.0.1:4321` adresinde, çalışma alanını `http://127.0.0.1:4321/office` adresinde açın.
- Supabase ile hesap ve cihazlar arası workspace eşitlemesini açmak için aşağıdaki **Supabase kurulumu** adımlarını tamamlayın. Ayarlar eklenmezse uygulama yerel modda çalışmaya devam eder.
- Employees sayfasından Manager ve kullanılacak çalışanlar için provider, model ID ve gerekirse API key tanımlayın.
- Ollama ve LM Studio için çalışan yerel OpenAI uyumlu sunucunun adresini ve model ID'sini girin.
- Office veya Manager sayfasında hedef girip planı gözden geçirin, ardından **Run team** seçin.
- Ofis sahnesini sürükleyerek orbit edin, tekerlekle ya da soldaki +/− düğmeleriyle yakınlaştırın. Her departmanın tek standart girişi vardır; ana giriş resepsiyonla belirginleştirilmiştir. Ahşap zeminler, oda işine uygun mobilya/dekor, koridor oturma ve bitkileri bulunur.
- Software Development odasının içinde yalnızca yazılım alanından girilen ayrı DevOps server odası ve rack sunucular vardır. Growth & Marketing alanı sosyal medya üretim seti, renkli zemin, ring light ve kamera ile ayrışır.
- Çalışanlar masalarından ara sıra odalarında kısa bir tur atar; kahve veya toplantı başlatılınca ilgili alana koridorlardan yürür.
- Bir çalışanın üzerine gelince adı, rolü, departmanı, durumu ve son görevi görünür; tıklayınca profili açılır.
- Çalışan profilindeki **Direct messages** kutusu konuşmayı görünür tutar ve kayıtlı model rotası varsa yanıtı o modele gönderir.
- **Coffee break** çalışanları kafeye gönderir.
- **Call meeting** ile konu ve katılımcıları seçin. Manager'a “toplantı ayarla” yazmak da 3D toplantıyı başlatır.
- Toplantı masasında Manager ile birlikte en fazla 6 ekip çalışanı yer alır; model rotası tanımlı çalışanlar sırayla katkı verir.

`index.html` dosyasını doğrudan açmak yeterli değildir; model istekleri aynı yerel sunucudaki API'ye gider.
3D sahne güncel bir WebGL destekli tarayıcı gerektirir.

## Vercel dağıtımı

`vercel.json`, Vercel'i statik dağıtım moduna alır ve `npm run build` ile `/` tanıtım sayfası ile `/office` arayüzünü `dist/` içine hazırlar. Supabase Auth'ı web dağıtımında açmak için Vercel Project Settings → Environment Variables bölümünde `CODLY_SUPABASE_URL` ve `CODLY_SUPABASE_PUBLISHABLE_KEY` değişkenlerini Preview ve Production ortamlarına ekleyin. `/api/config` bu iki istemci ayarını uygulamaya verir.

Model isteklerini çalıştıran `/api/chat` ve model rotalarını yöneten runtime şu an yalnızca `npm start` ile yerel makinede çalışır. Vercel'de arayüz yayınlanır; ortak, uzaktan erişilebilir model runtime'ı için Hetzner dağıtımı ayrıca tamamlanmalıdır.

## Bu dilimde çalışanlar

- Three.js tabanlı 3D Office, çalışanların masa/kafe/toplantı alanlarına hareketi ve gerçek görev durumları
- Manager modelinden JSON iş planı alma ve çalışanlara atama
- Workspace onboarding profili, marka beyni, hedef pazar ve dil tercihlerini planlama, görev, DM ve toplantı model çağrılarına bağlama
- Kaydedilen workspace saat dilimini takvimde gösterme ve workflow formunun varsayılanı olarak kullanma
- Her çalışan için OpenAI uyumlu API, Anthropic, Google Gemini, OpenRouter, Ollama, LM Studio veya özel endpoint rotası
- Çalışan görünen adını değiştirme; görev atamaları sabit çalışan kimliğini korur
- Sıralı metin görevleri yürütme, sonuçları görme ve Manager'dan son rapor alma
- Meeting komutunda katılımcıların kendi model rotalarıyla söz alması ve Manager'ın toplantı notlarını özetlemesi
- Manuel ve ara sıra otomatik kahve molası sahne davranışı
- Görev, hedef ve Activity durumlarını tarayıcıda saklama
- Supabase Auth ile e-posta/şifre hesabı ve kullanıcıya özel workspace snapshot eşitlemesi
- Supabase ayarı yoksa localStorage tabanlı yerel modda çalışmaya devam etme

## Supabase kurulumu

1. Supabase projesi oluşturun.
2. Authentication → URL Configuration bölümünde Site URL'yi `http://127.0.0.1:4321` yapın ve `http://127.0.0.1:4321/office` adresini Additional Redirect URLs listesine ekleyin. Üretim alan adını yayınlama aşamasında ekleyin.
3. SQL Editor'da [`supabase/migrations/20261016000000_workspace_snapshots.sql`](supabase/migrations/20261016000000_workspace_snapshots.sql) dosyasını çalıştırın. Tablo yalnızca oturum açmış kullanıcının kendi kaydını okuyup değiştirmesine izin veren RLS politikalarıyla oluşturulur.
4. Proje URL'sini ve **publishable key** değerini `.env.local` dosyasına yazın. Sunucu bu dosyayı başlangıçta okur; dosya Git tarafından yok sayılır. Bunlar tarayıcı uygulamasına sunulmak üzere tasarlanmış istemci ayarlarıdır:

   `.env.local`:

   ```dotenv
   CODLY_SUPABASE_URL=https://<project-ref>.supabase.co
   CODLY_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   Ardından `npm start` çalıştırın. İşletim sistemi ortam değişkenleri varsa `.env.local` değerlerinden önce gelir. `service_role` veya başka bir gizli sunucu anahtarını bu değişkenlere koymayın. Anahtarları kaynak koda eklemeyin.
5. Sayfayı yenileyip hesap oluşturun veya giriş yapın. İlk girişte bu tarayıcıdaki mevcut Office kaydı hesabın workspace'ine aktarılır; başka cihazda aynı hesapla girince bulut snapshot'ı yüklenir.

Eşitlenen kayıtta çalışan adları, model/endpoint tercihleri, görevler, hedefler, DM geçmişi ve workspace ayarları bulunur. Açık hesaplarda gelen değişiklikler Supabase Realtime ile ekrana yansır; sürüm numarası eski bir cihazın yeni veriyi sessizce ezmesini önler ve böyle bir çakışmada sayfayı yenilemenizi ister. Model sağlayıcı API key'leri eşitlenmez; her cihazın yerel runtime'ında ayrıca tanımlanır ve süreç kapanınca silinir. Bu aşama hesap başına özel bir workspace sağlar; ekip daveti ve birden fazla kullanıcının aynı workspace'e katılması sonraki adımdır.

Depolama için `workspace-store.js` arayüzü kullanılır; Supabase erişimi bu adapter içinde tutulur. Workspace verisi PostgreSQL `jsonb` snapshot'ında saklanır. Hetzner'a geçerken aynı tabloyu PostgreSQL üzerinde taşıyıp adapter'ı oturum doğrulayan kendi API'nize yönlendirebiliriz. Şu anki Node runtime yalnızca yerel makinede dinler; Hetzner dağıtımı ve uzaktan güvenli runtime erişimi bu dilimde açılmadı.

## Veri ve güvenlik sınırı

- API key'ler tarayıcıya ya da workspace snapshot'ına kaydedilmez; yerel Node.js sürecinin belleğinde tutulur ve süreç kapanınca silinir.
- Supabase etkin değilse provider/model/endpoint ayarları, görev kayıtları ve DM geçmişleri tarayıcının `localStorage` alanında kalır. Supabase etkinse hassas anahtar alanları çıkarılmış workspace snapshot'ı kullanıcı hesabına eşitlenir; localStorage çevrimdışı önbellek görevi görür.
- Bulut provider seçildiğinde görev prompt'u, çalışan talimatları ve önceki ekip çıktıları seçilen provider'a gönderilir. İstek sağlayıcıya doğrudan gider.
- Ollama/LM Studio seçildiğinde istek girilen model sunucusuna gider.
- Bu prototipin model runtime API'si `127.0.0.1` üzerinde dinler. Kalıcı şifreli anahtar kasası, ekip üyeliği/davetleri ve Hetzner dağıtımı henüz yoktur.
- Node runtime'ı ana bilgisayar üzerinde çalıştırın. Henüz sandbox, dosya sistemi aracı, shell aracı, OAuth veya harici entegrasyon bağlı değildir.

## Henüz uygulanmayan ürün kapsamı

Ekip üyeliği ve davetleri, web uygulamasının Hetzner'da güvenli dağıtımı, macOS/Windows paketleri, kalıcı şifreli secret saklama, eşzamanlı ajan yürütmesi, araç kullanımı, GitHub ve izole kod çalıştırma, onay kuyruğu, çalışan belleği, artifact depolama, gerçek zamanlayıcı, entegrasyonlar, bütçe ve token maliyeti raporlaması.

Onaylanan kapsam ve mimari kararlar için [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md), LyngL ekran incelemesi için [LYNGL_RESEARCH.md](LYNGL_RESEARCH.md) dosyasına bakın.
