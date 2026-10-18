(() => {
  const LANGUAGE_STORE = "codly-studio-language";
  const THEME_STORE = "codly-studio-theme";
  const phrases = [
    ["Codlyio Studio — Yapay zekâ ekibin, tek çalışma alanında", "Codlyio Studio — Your AI team, in one workspace"],
    ["Codlyio Studio ana sayfa", "Codlyio Studio home"], ["Ana menü", "Main navigation"], ["Mobil ana menü", "Mobile main menu"], ["Menüyü aç", "Open menu"],
    ["Studio bağlantıları", "Studio links"], ["Yasal bilgiler", "Legal information"], ["Codlyio GitHub", "Codlyio on GitHub"],
    ["Codlyio Studio sanal ofis arayüzü önizlemesi", "Codlyio Studio virtual office interface preview"], ["Bitkiler, çalışma masaları ve toplantı alanı olan izometrik ofis", "Isometric office with plants, desks, and a meeting area"],
    ["Codlyio Studio çerez ve tarayıcı depolama politikası.", "Codlyio Studio cookies and browser storage policy."], ["Codlyio Studio gizlilik politikası.", "Codlyio Studio privacy policy."], ["Codlyio Studio kullanım koşulları.", "Codlyio Studio terms of use."],
    ["Codlyio Studio — Ofis", "Codlyio Studio — Office"],
    ["Codlyio Studio ile yapay zekâ modellerini uzman rollere bağla, işlerini tek merkezden yönet ve ekibinin ilerleyişini canlı ofisinde izle.", "Connect AI models to expert roles, manage work from one place, and follow your team’s progress in a live office with Codlyio Studio."],
    ["Modellerini uzman rollere bağla. İşleri tek merkezden yönet. İlerlemeyi canlı ofisinde gör.", "Assign models to expert roles. Manage work from one place. See progress in your live office."],
    ["Studio", "Studio"], ["Nasıl çalışır?", "How it works"], ["Modeller", "Models"],
    ["Giriş yap", "Sign in"], ["Koyu temaya geç", "Switch to dark theme"], ["Açık temaya geç", "Switch to light theme"],
    ["Koyu tema", "Dark theme"], ["Açık tema", "Light theme"], ["Studio’yu aç", "Open Studio"],
    ["Studio’yu aç ↗", "Open Studio ↗"], ["Yapay zekâ ekibin için yeni bir çalışma alanı", "A new workspace for your AI team"],
    ["Ekibin yapay zekâ.", "Your team is AI."], ["Ofisin senin.", "Your office, your way."],
    ["Modellerini uzman rollere bağla, işleri tek merkezden yönet. Codlyio Studio’da ekibin çalışmasını canlı bir ofiste gör.", "Assign models to expert roles and manage work from one place. Watch your team work in a live office with Codlyio Studio."],
    ["Codlyio Studio’yu aç", "Open Codlyio Studio"], ["Nasıl çalıştığını gör", "See how it works"],
    ["Tek bir hedeften, birlikte çalışan uzman modellere.", "One goal. A team of specialists working together."],
    ["codlyio.com", "codlyio.com"], ["workspace", "workspace"], ["CANLI", "LIVE"], ["WORKSPACE", "WORKSPACE"], ["OFFICE", "OFFICE"],
    ["4 çalışan aktif", "4 employees active"], ["PRODUCT", "PRODUCT"], ["DEVELOPMENT", "DEVELOPMENT"], ["MEETING ROOM", "MEETING ROOM"],
    ["Building your app", "Building your app"], ["Reviewing a design", "Reviewing a design"], ["Planning next steps", "Planning next steps"],
    ["Team standup", "Team stand-up"], ["3 participants · 10:30", "3 participants · 10:30"], ["Launch plan", "Launch plan"],
    ["Manager assigned 3 tasks", "Manager assigned 3 tasks"], ["Team progress", "Team progress"],
    ["Modellerin, tek ekipte", "Your models, working as one team"], ["Kullandığın servislerle çalış", "Works with the services you use"],
    ["Her şey tek yerde", "Everything in one place"], ["İşler · ekip · ilerleme", "Work · team · progress"],
    ["YAPAY ZEKÂ İŞ AKIŞININ YENİ MERKEZİ", "THE NEW CENTER OF YOUR AI WORKFLOW"],
    ["Uzman rollere ayrılmış modeller", "Models assigned to expert roles"], ["Tek merkezden iş akışı", "One workflow, one workspace"], ["Canlı sanal ofis", "A live virtual office"],
    ["CODLYIO STUDIO", "CODLYIO STUDIO"], ["Yapay zekâyı sohbetten", "Move AI from chat"], ["iş akışına taşı.", "into your workflow."],
    ["Farklı modelleri, amaçları belli dijital çalışanlara dönüştür. Planı, görevleri ve sonuçları aynı çalışma alanında bir araya getir.", "Turn different models into digital teammates with clear roles. Bring plans, tasks, and results together in one workspace."],
    ["Uygulamalar", "Apps"], ["Blog", "Blog"],
    ["01 / DİJİTAL EKİP", "01 / DIGITAL TEAM"], ["Her çalışana", "Give every teammate"], ["bir uzmanlık.", "a specialty."],
    ["Geliştirmeden içeriğe kadar dijital çalışanlarına isim ver, uzmanlıklarını belirle ve kullanacakları modeli seç.", "From engineering to content, name your digital teammates, define their skills, and choose the model each one uses."],
    ["Engineering", "Engineering"], ["Design", "Design"], ["Research", "Research"],
    ["02 / AKILLI İŞ AKIŞI", "02 / SMART WORKFLOW"], ["Hedefini söyle.", "Set the goal."], ["İş bölünsün.", "Let the work take shape."],
    ["Manager hedefini plana dönüştürür, işleri doğru çalışanlara atar. Sen başlamadan önce planı gözden geçirirsin.", "The Manager turns your goal into a plan and assigns work to the right teammates. Review the plan before work begins."],
    ["Landing page taslağı", "Landing page draft"], ["DONE", "DONE"], ["03 / CANLI OFİS", "03 / LIVE OFFICE"],
    ["Ekibin nerede,", "See where your team is"], ["ne yapıyor gör.", "and what they’re working on."],
    ["Çalışanların ofisteki yerini, durumunu ve görev ilerleyişini tek bir canlı görünümde takip et.", "Track your teammates’ location, status, and task progress in one live view."],
    ["3 AKTİF", "3 ACTIVE"], ["BASİT BİR AKIŞ", "A SIMPLE WORKFLOW"], ["Sen hedefi belirle.", "Set the goal."],
    ["Studio devamını getirsin.", "Let Studio handle the next steps."], ["Hedefi tanımla", "Describe the goal"],
    ["Ekibine neyi başarması gerektiğini anlat.", "Tell your team what it needs to accomplish."], ["Planı gözden geçir", "Review the plan"],
    ["Manager işi adımlara bölsün; sen onayla.", "The Manager breaks the work into steps; you approve."], ["İlerlemeyi izle", "Track progress"],
    ["Çalışanlar işini yapsın, sonuçlar tek yerde toplansın.", "Your teammates do the work and bring results together."],
    ["“Ürün lansmanı için bir hafta içinde tanıtım sayfası, sosyal medya planı ve e-posta serisi hazırla.”", "“Prepare a landing page, social media plan, and email series for a product launch within a week.”"],
    ["SENİN MODELLERİN", "YOUR MODELS"], ["İyi modeller.", "Great models."], ["Doğru roller.", "The right roles."],
    ["Her dijital çalışana uygun modeli seç. Bulut sağlayıcılarını, OpenAI uyumlu servisleri veya kendi bilgisayarındaki yerel modelleri kullan.", "Choose the right model for each digital teammate. Use cloud providers, OpenAI-compatible services, or local models on your computer."],
    ["Model rotalarını keşfet", "Explore model routes"], ["BAĞLANABİLEN MODEL SERVİSLERİ", "SUPPORTED MODEL PROVIDERS"],
    ["Model anahtarların cihazındaki yerel runtime’da kalır.", "Your model keys stay in the local runtime on your device."],
    ["HER YERDE SENİNLE", "WITH YOU, EVERYWHERE"], ["Studio, yakında", "Studio, coming soon"], ["tüm cihazlarında.", "on all your devices."],
    ["Çalışma alanını masaüstünde veya telefonda yanında taşı. Codlyio Studio masaüstü ve mobil uygulamaları sıradaki adımda.", "Take your workspace with you on desktop or phone. Codlyio Studio desktop and mobile apps are next."],
    ["YAKINDA", "COMING SOON"], ["MASAÜSTÜ UYGULAMASI", "DESKTOP APP"], ["Masaüstünde odaklı, kesintisiz çalışma.", "Focused, uninterrupted work on desktop."],
    ["Ekibin ve görevlerin tek bir yerde.", "Your team and tasks in one place."], ["MOBİL UYGULAMA", "MOBILE APP"], ["İlerlemeyi hareket halindeyken takip et.", "Track progress on the go."], ["Yakında", "Coming soon"],
    ["CODLYIO NOTLARI", "NOTES FROM CODLYIO"], ["Yapay zekâyla", "Working smarter"], ["daha iyi çalış.", "with AI."],
    ["Modeller, dijital ekipler ve insanın yön verdiği iş akışları hakkında Studio yaklaşımını paylaşan kısa yazılar.", "Short reads from Studio on models, digital teams, and human-led workflows."],
    ["FİKİRLERDEN İŞ AKIŞLARINA", "FROM IDEAS TO WORKFLOWS"], ["EKİP TASARIMI", "TEAM DESIGN"], ["5 DK OKUMA", "5 MIN READ"],
    ["Bir yapay zekâ ekibi nasıl kurulur?", "How do you build an AI team?"],
    ["Bir masa etrafında ekipçe proje üzerinde çalışan kişiler", "A team collaborating on a project around a table"],
    ["Tek bir genel amaçlı asistan yerine rolleri, sorumlulukları ve ortak hedefi belli bir dijital ekip kurmanın temelleri.", "The foundations of building a digital team with clear roles, responsibilities, and a shared goal instead of relying on one general-purpose assistant."],
    ["Yazıyı oku", "Read article"],
    ["İşe araç listesinden değil, ulaşmak istediğin sonuçtan başla. Sonra işi araştırma, üretim ve gözden geçirme gibi uzmanlıklara ayır. Her çalışana açık bir rol ve sınır ver; böylece kim neyi neden üretiyor takip edebilirsin.", "Start with the outcome you want, not a list of tools. Then divide the work into specialties such as research, creation, and review. Give each teammate a clear role and boundaries so you can track who is producing what and why."],
    ["İyi bir dijital ekip, tek tek modellerin gücünden çok aralarındaki koordinasyonla değer üretir. Codlyio Studio’da hedef, plan, görev atamaları ve sonuçlar aynı çalışma alanında görünür.", "A strong digital team creates value through coordination, not just the capabilities of individual models. In Codlyio Studio, goals, plans, assignments, and results come together in one workspace."],
    ["İŞ AKIŞI", "WORKFLOW"], ["4 DK OKUMA", "4 MIN READ"], ["İyi bir AI iş akışı prompt’tan fazlasıdır", "A good AI workflow is more than a prompt"],
    ["Kod editörü açık bir dizüstü bilgisayar ve düzenli çalışma masası", "A laptop with a code editor open on a tidy desk"],
    ["Hedefi netleştirmek, planı kontrol etmek ve işi doğru uzmanlığa vermek neden sonucu değiştirir?", "Why does clarifying the goal, reviewing the plan, and assigning work to the right specialty change the outcome?"],
    ["Tek seferlik bir prompt fikir verir; tekrarlanabilir bir iş akışı ise fikri tamamlanabilir adımlara dönüştürür. Hedefi ölçülebilir yaz, Manager’ın planını işe başlamadan önce incele ve her göreve uygun modeli ya da çalışanı ata.", "A one-off prompt can spark an idea; a repeatable workflow turns it into steps you can complete. Make the goal measurable, review the Manager’s plan before work starts, and assign the right model or teammate to each task."],
    ["İlerlemeyi ve çıktıları aynı yerde tutmak, bağlam kaybını azaltır. İnsan onayı gereken adımları görünür kılmak da hız ile kontrol arasında sağlıklı bir denge kurar.", "Keeping progress and outputs together reduces context loss. Making human approval steps visible also creates a healthy balance between speed and control."],
    ["MODEL SEÇİMİ", "MODEL SELECTION"], ["6 DK OKUMA", "6 MIN READ"], ["Her görev için aynı modeli kullanmak zorunda değilsin", "You don’t need the same model for every task"],
    ["Birbirine bağlı ışıklı düğümlerden oluşan dijital ağ görseli", "A digital network of connected glowing nodes"],
    ["Uzmanlık, maliyet, hız ve gizlilik gereksinimlerine göre farklı modelleri doğru rollere eşleştir.", "Match different models to the right roles based on expertise, cost, speed, and privacy needs."],
    ["Araştırma, metin üretimi, kod inceleme ve planlama aynı türden işler değildir. Her rol için beklediğin kaliteyi, yanıt hızını ve gizlilik sınırını tanımla; sonra uygun bulut veya yerel modeli seç.", "Research, writing, code review, and planning are different kinds of work. Define the quality, response speed, and privacy boundaries you expect for each role, then choose a suitable cloud or local model."],
    ["Bu yaklaşım seçimleri şeffaflaştırır ve ekibin tamamını tek bir sağlayıcıya bağlamadan deneme yapmanı sağlar. Codlyio Studio model rotalarını çalışan bazında yönetmek için tasarlanıyor.", "This approach makes choices transparent and lets you experiment without tying the whole team to one provider. Codlyio Studio is being designed to manage model routes for each teammate."],
    ["DAHA ÇOK İŞ. DAHA AZ KOORDİNASYON.", "MORE WORK. LESS COORDINATION."], ["Ekibin hazır.", "Your team is ready."], ["İlk hedefin ne?", "What’s your first goal?"],
    ["Codlyio Studio’yu aç, dijital ekibini kendi çalışma alanında kur.", "Open Codlyio Studio and build your digital team in your own workspace."],
    ["İnsanların yön verdiği, yapay zekânın birlikte ürettiği çalışma alanı.", "A workspace where people lead and AI builds together."],
    ["Bize ulaşın", "Contact us"], ["Çalışma alanı", "Workspace"], ["Yasal", "Legal"], ["Gizlilik Politikası", "Privacy Policy"],
    ["Kullanım Koşulları", "Terms of Use"], ["Çerez Politikası", "Cookie Policy"], ["İletişim", "Contact"], ["GitHub", "GitHub"],
    ["Başa dön", "Back to top"], ["© 2026 Codlyio LLC. Tüm hakları saklıdır.", "© 2026 Codlyio LLC. All rights reserved."],
    ["Texas, USA", "Texas, USA"], ["Dil", "Language"], ["Türkçe", "Turkish"], ["İngilizce", "English"],
    ["← Codlyio Studio ana sayfa", "← Codlyio Studio home"], ["Bu metin hakkında sorunuz mu var?", "Questions about this document?"],
    ["Gizlilik", "Privacy"], ["Kullanım koşulları", "Terms"], ["Çerezler", "Cookies"], ["© 2026 Codlyio Studio", "© 2026 Codlyio LLC."],
    ["YOUR AI WORKSPACE", "YAPAY ZEKÂ ÇALIŞMA ALANIN"], ["Notifications", "Bildirimler"], ["Account", "Hesap"], ["Local profile", "Yerel profil"], ["Switch workspace", "Çalışma alanını değiştir"], ["Workspaces", "Çalışma alanları"], ["Create workspace", "Yeni çalışma alanı"], ["Create a workspace", "Yeni çalışma alanı oluştur"], ["Choose a name and type for your new workspace. Existing workspace data stays separate.", "Yeni çalışma alanın için ad ve tür seç. Mevcut çalışma alanındaki veriler korunur."], ["Workspace created and saved to your account.", "Çalışma alanı oluşturuldu ve hesabına kaydedildi."], ["Workspace created and saved on this device.", "Çalışma alanı bu cihaza kaydedildi."], ["Create your account", "Hesabını oluştur"], ["Welcome back", "Tekrar hoş geldin"],
    ["Create an account to keep your team and workspace in sync across devices.", "Ekibini ve çalışma alanını cihazların arasında eşitlemek için hesap oluştur."],
    ["Sign in to open your workspace on this device.", "Çalışma alanını bu cihazda açmak için giriş yap."], ["Email", "E-posta"], ["Password", "Şifre"],
    ["At least 8 characters", "En az 8 karakter"], ["Create account", "Hesap oluştur"], ["Sign in", "Giriş yap"],
    ["Already have an account? Sign in", "Zaten hesabın var mı? Giriş yap"], ["New to Codlyio Studio? Create an account", "Codlyio Studio’ya yeni misin? Hesap oluştur"],
    ["Your model provider keys stay on the local runtime and are not included in workspace sync.", "Model sağlayıcı anahtarların yerel runtime’da kalır ve çalışma alanı eşitlemesine dahil edilmez."],
    ["LET’S SET UP YOUR SPACE", "ÇALIŞMA ALANINI KURALIM"], ["Tell us what you’re building", "Neler kurduğunu anlat"],
    ["Add a few details about your company or personal workspace. This profile is saved to your account and can shape your Studio experience.", "Şirketin veya kişisel çalışma alanın hakkında birkaç bilgi ekle. Bu profil hesabına kaydedilir ve Studio deneyimini kişiselleştirir."],
    ["Workspace name", "Çalışma alanı adı"], ["Workspace type", "Çalışma alanı türü"], ["Company", "Şirket"], ["Personal workspace", "Kişisel çalışma alanı"],
    ["Industry", "Sektör"], ["Choose an industry", "Bir sektör seç"], ["Technology", "Teknoloji"], ["Creative & design", "Yaratıcılık ve tasarım"],
    ["Marketing", "Pazarlama"], ["E-commerce", "E-ticaret"], ["Education", "Eğitim"], ["Other", "Diğer"],
    ["What do you want to build?", "Ne oluşturmak istiyorsun?"], ["Website", "Web sitesi"], ["optional", "isteğe bağlı"],
    ["Save workspace and continue", "Çalışma alanını kaydet ve devam et"], ["Your workspace profile is saved to your account and synced across your devices.", "Çalışma alanı profilin hesabına kaydedilir ve cihazların arasında eşitlenir."],
    ["Office", "Ofis"], ["Manager", "Yönetici"], ["WORK", "İŞ"], ["Tasks", "Görevler"], ["Projects", "Projeler"],
    ["Development", "Geliştirme"], ["Artifacts", "Çıktılar"], ["Approvals", "Onaylar"], ["Activity", "Etkinlik"], ["GROWTH", "BÜYÜME"],
    ["Content", "İçerik"], ["Calendar", "Takvim"], ["Campaigns", "Kampanyalar"], ["Analytics", "Analizler"], ["TEAM", "EKİP"],
    ["Employees", "Çalışanlar"], ["Departments", "Departmanlar"], ["AUTOMATION", "OTOMASYON"], ["Workflows", "İş akışları"],
    ["WORKSPACE", "ÇALIŞMA ALANI"], ["Integrations", "Entegrasyonlar"], ["Usage", "Kullanım"], ["Settings", "Ayarlar"],
    ["Connecting to local runtime…", "Yerel runtime’a bağlanıyor…"], ["Connecting…", "Bağlanıyor…"], ["Stop all", "Tümünü durdur"],
    ["This workspace changed on another device. Reload this page to load the latest version.", "Bu çalışma alanı başka bir cihazda değiştirildi. En güncel sürümü yüklemek için sayfayı yenile."],
    ["Output", "Çıktı"], ["Run team", "Ekibi çalıştır"], ["Nothing has happened yet. The activity stream will appear here when the team starts work.", "Henüz bir etkinlik yok. Ekip çalışmaya başladığında etkinlik akışı burada görünür."],
    ["Manager is turning your outcome into a team plan…", "Yönetici hedefini ekip planına dönüştürüyor…"], ["Your prompt is being sent to the Manager’s configured provider.", "İsteğin, Yönetici için yapılandırılmış sağlayıcıya gönderiliyor."],
    ["Tell the Manager the outcome you want. It plans the work and runs your team.", "Yöneticiye istediğin sonucu anlat. İşleri planlar ve ekibini çalıştırır."],
    ["TRY ASKING FOR", "ŞUNU İSTEYEBİLİRSİN"], ["Model routes", "Model rotaları"], ["End", "Bitir"], ["☕ Coffee break", "☕ Kahve molası"], ["＋ Call meeting", "＋ Toplantı çağır"],
    ["The office is quiet. Give the Manager a goal to get started.", "Ofis sakin. Başlamak için Yöneticiye bir hedef ver."], ["Drag to orbit · Scroll to zoom", "Döndürmek için sürükle · Yakınlaştırmak için kaydır"],
    ["Show every name", "Tüm isimleri göster"], ["Reduce motion", "Hareketi azalt"], ["NEW OUTCOME", "YENİ HEDEF"], ["What should the team make happen?", "Ekip neyi başarmalı?"],
    ["Recent goals", "Son hedefler"], ["No goals yet", "Henüz hedef yok"], ["Set an outcome above to start a team plan.", "Ekip planını başlatmak için yukarıya bir hedef yaz."], ["Tell the Manager what you want to achieve.", "Yöneticiye neyi başarmak istediğini anlat."],
    ["Goals", "Hedefler"], ["All tasks", "Tüm görevler"], ["No tasks yet", "Henüz görev yok"], ["Tasks created from Manager goals will appear here.", "Yönetici hedeflerinden oluşturulan görevler burada görünür."],
    ["Details", "Ayrıntılar"], ["Goal workspace", "Hedef çalışma alanı"], ["No projects yet", "Henüz proje yok"], ["A project is created when the Manager plans a goal.", "Yönetici bir hedef planladığında proje oluşturulur."],
    ["Demo mode: repository access and code execution are not connected. No commands run from this interface.", "Demo modu: depo erişimi ve kod çalıştırma bağlı değil. Bu arayüzden komut çalıştırılmaz."],
    ["Not connected", "Bağlı değil"], ["Connect a fine-grained token limited to the repositories the team may use.", "Ekibin kullanabileceği depolarla sınırlı, ayrıntılı izinli bir token bağla."],
    ["GitHub token", "GitHub token’ı"], ["Connect GitHub", "GitHub’ı bağla"], ["When enabled, tests and builds should run in short-lived isolated containers.", "Etkinleştirildiğinde testler ve derlemeler kısa süreli, yalıtılmış kapsayıcılarda çalışmalıdır."],
    ["No provider connected", "Bağlı sağlayıcı yok"], ["Production deployments should wait for an explicit approval.", "Canlıya dağıtımlar açık onay beklemelidir."], ["No deployments yet.", "Henüz dağıtım yok."], ["No test runs yet.", "Henüz test çalıştırılmadı."], ["No repositories linked yet.", "Henüz depo bağlanmadı."],
    ["No artifacts yet", "Henüz çıktı yok"], ["Finished work will be saved to its project and listed here.", "Tamamlanan çalışmalar projelerine kaydedilir ve burada listelenir."],
    ["Waiting", "Bekliyor"], ["History", "Geçmiş"], ["Nothing is waiting for your approval", "Onayını bekleyen bir işlem yok"], ["No approval history yet", "Henüz onay geçmişi yok"], ["External actions stay paused until an approval is explicitly granted.", "Açıkça onay verilene kadar harici işlemler duraklatılır."],
    ["Meeting notes", "Toplantı notları"], ["No activity yet", "Henüz etkinlik yok"], ["Everything the team does will appear here.", "Ekibin yaptığı her şey burada görünür."], ["Show system events", "Sistem etkinliklerini göster"],
    ["Open calendar", "Takvimi aç"], ["No content yet", "Henüz içerik yok"], ["Ask the Manager for a posting plan and the team can prepare drafts for review.", "Yöneticiden paylaşım planı iste; ekip incelenmek üzere taslaklar hazırlasın."],
    ["Today", "Bugün"], ["Month", "Ay"], ["Week", "Hafta"], ["Nothing is planned for this period.", "Bu dönem için plan yok."],
    ["No ad budget limit is set, so nothing can go live. Add a policy under Settings → Budgets before enabling campaigns.", "Reklam bütçesi sınırı belirlenmediğinden hiçbir şey yayınlanamaz. Kampanyaları etkinleştirmeden önce Ayarlar → Bütçeler bölümüne bir politika ekle."],
    ["No campaigns yet", "Henüz kampanya yok"], ["Ask the Manager to promote content within a weekly maximum.", "Yöneticiden haftalık sınır dahilinde içeriği tanıtmasını iste."], ["Refresh", "Yenile"],
    ["No results yet", "Henüz sonuç yok"], ["Numbers appear once posts are published or ads are running.", "Gönderiler yayınlandığında veya reklamlar çalıştığında veriler burada görünür."],
    ["EMPLOYEE", "ÇALIŞAN"], ["DEPARTMENT", "DEPARTMAN"], ["NOW", "ŞİMDİ"], ["MODEL ROUTE", "MODEL ROTASI"], ["Start a conversation", "Sohbet başlat"], ["Messages and replies will appear here.", "Mesajlar ve yanıtlar burada görünür."],
    ["DIRECT MESSAGES", "DOĞRUDAN MESAJLAR"], ["Thinking", "Düşünüyor"], ["Not configured", "Yapılandırılmadı"], ["← All employees", "← Tüm çalışanlar"], ["RIGHT NOW", "ŞU ANDA"],
    ["STANDING INSTRUCTIONS", "SÜREKLİ TALİMATLAR"], ["Applied to every task this employee works on.", "Bu çalışanın üstlendiği her göreve uygulanır."], ["Save instructions", "Talimatları kaydet"],
    ["CAPABILITIES", "YETENEKLER"], ["Planned tool access", "Planlanan araç erişimi"], ["Tool access and approval checks are not connected yet.", "Araç erişimi ve onay kontrolleri henüz bağlı değil."], ["SKILLS", "BECERİLER"],
    ["AI PROVIDER & MODEL", "YAPAY ZEKÂ SAĞLAYICISI VE MODEL"], ["Each employee can use a separate provider, model and endpoint.", "Her çalışan ayrı bir sağlayıcı, model ve uç nokta kullanabilir."],
    ["Provider", "Sağlayıcı"], ["Model ID", "Model kimliği"], ["Base URL", "Temel URL"], ["API key", "API anahtarı"], ["Save route", "Rotayı kaydet"], ["Clear key", "Anahtarı temizle"],
    ["Provider, model and endpoint are stored in your workspace; provider keys remain on this device.", "Sağlayıcı, model ve uç nokta çalışma alanında saklanır; sağlayıcı anahtarları bu cihazda kalır."], ["PROFILE", "PROFİL"], ["Name", "Ad"], ["Save name", "Adı kaydet"], ["RECENT TASKS", "SON GÖREVLER"], ["Tasks listed on the Tasks page.", "Görevler sayfasında listelenen görevler."], ["No tasks yet.", "Henüz görev yok."],
    ["Browse app categories or search for a connection. This local prototype does not request OAuth access.", "Uygulama kategorilerine göz at veya bağlantı ara. Bu yerel prototip OAuth erişimi istemez."], ["Connect", "Bağlan"], ["Connections are visual placeholders in this prototype.", "Bu prototipte bağlantılar yalnızca görsel yer tutuculardır."],
    ["＋ New recurring workflow", "＋ Yeni yinelenen iş akışı"], ["No recurring workflows yet", "Henüz yinelenen iş akışı yok"], ["Ask the Manager for something recurring or create one here.", "Yöneticiden yinelenen bir iş iste veya buradan oluştur."],
    ["Last 7 days", "Son 7 gün"], ["Last 30 days", "Son 30 gün"], ["Last 90 days", "Son 90 gün"], ["SUBSCRIPTION", "ABONELİK"], ["Local", "Yerel"], ["MODEL RUNS", "MODEL ÇALIŞTIRMALARI"], ["MEDIA USAGE", "MEDYA KULLANIMI"], ["AD SPEND THIS WEEK", "BU HAFTAKİ REKLAM HARCAMASI"],
    ["LOCAL MODEL ROUTING", "YEREL MODEL YÖNLENDİRMESİ"], ["Configured employee routes", "Yapılandırılmış çalışan rotaları"], ["Runtime status", "Runtime durumu"], ["Ready", "Hazır"], ["Offline", "Çevrimdışı"], ["Provider-specific token usage is not shown yet. Usage values are not billed by Codly Office.", "Sağlayıcıya göre token kullanımı henüz gösterilmiyor. Kullanım değerleri Codly Office tarafından ücretlendirilmez."], ["BY CATEGORY", "KATEGORİYE GÖRE"], ["Detailed usage reporting is not implemented.", "Ayrıntılı kullanım raporlaması henüz uygulanmadı."], ["BY EMPLOYEE", "ÇALIŞANA GÖRE"], ["BUDGET CEILINGS", "BÜTÇE ÜST SINIRLARI"], ["Budget enforcement is not implemented.", "Bütçe sınırı uygulaması henüz etkin değil."],
    ["General", "Genel"], ["Time zone", "Saat dilimi"], ["Europe/Istanbul", "Europe/Istanbul"], ["UTC", "UTC"], ["Europe/London", "Europe/London"], ["America/New York", "America/New York"], ["Save", "Kaydet"], ["Language & market", "Dil ve pazar"], ["Interface language", "Arayüz dili"], ["Interface theme", "Arayüz teması"], ["Appearance", "Görünüm"], ["Choose the appearance used on this device.", "Bu cihazda kullanılacak görünümü seç."], ["English", "İngilizce"], ["Light", "Açık"], ["Dark", "Koyu"], ["The Manager’s replies can follow the interface language.", "Yöneticinin yanıtları arayüz dilini takip edebilir."], ["Default content language", "Varsayılan içerik dili"], ["Default target market", "Varsayılan hedef pazar"],
    ["Brand brain", "Marka rehberi"], ["Every employee can read this context before writing, designing or producing output.", "Her çalışan yazmadan, tasarlamadan veya içerik üretmeden önce bu bağlamı okuyabilir."], ["Save brand profile", "Marka profilini kaydet"], ["Autonomy mode", "Otonomi modu"], ["Policies", "Politikalar"], ["Approval mode", "Onay modu"], ["Guarded autopilot", "Kontrollü otomatik pilot"], ["Full autopilot", "Tam otomatik pilot"],
    ["Every risky or external action waits for your approval.", "Riskli veya harici her işlem onayını bekler."], ["The team works within the permissions and limits you set.", "Ekip, belirlediğin izinler ve sınırlar dahilinde çalışır."], ["Broader automation with budget, security and isolation limits.", "Bütçe, güvenlik ve yalıtım sınırlarıyla daha geniş otomasyon."], ["Publish social posts without approval", "Sosyal medya gönderilerini onaysız yayınla"], ["Deploy previews automatically", "Önizlemeleri otomatik dağıt"], ["Always require approval for production deploys", "Canlı dağıtımlar için her zaman onay iste"], ["Model text tasks run locally through this runtime. Tools, integrations, budgets and external actions are not connected yet.", "Metin tabanlı model görevleri bu runtime üzerinden yerel olarak çalışır. Araçlar, entegrasyonlar, bütçeler ve harici işlemler henüz bağlı değil."],
    ["Provider keys", "Sağlayıcı anahtarları"], ["Employee API keys are held in the local runtime process memory and cleared when it exits. They are not encrypted or saved to disk yet. Model prompts go to the provider configured for that employee.", "Çalışan API anahtarları yerel runtime sürecinin belleğinde tutulur ve süreç kapanınca temizlenir. Henüz şifrelenmez veya diske kaydedilmez. Model istemleri ilgili çalışan için yapılandırılmış sağlayıcıya gönderilir."], ["AI providers", "Yapay zekâ sağlayıcıları"], ["Assign each employee a separate model and endpoint from their profile. Local Ollama and LM Studio routes do not need a cloud API key.", "Her çalışana profilinden ayrı bir model ve uç nokta ata. Yerel Ollama ve LM Studio rotaları bulut API anahtarı gerektirmez."], ["Open employees", "Çalışanları aç"], ["PROVIDER", "SAĞLAYICI"], ["Available as a model route for an employee.", "Bir çalışan için model rotası olarak kullanılabilir."],
    ["Budget policies", "Bütçe politikaları"], ["A maximum is a hard ceiling enforced before an external spend action.", "Maksimum tutar, harici harcama öncesinde uygulanan kesin üst sınırdır."], ["Applies to", "Şunun için geçerli"], ["Agent spend", "Ajan harcaması"], ["Media spend", "Medya harcaması"], ["Ad spend", "Reklam harcaması"], ["Weekly maximum", "Haftalık üst sınır"], ["Daily maximum", "Günlük üst sınır"], ["Per-campaign maximum", "Kampanya başına üst sınır"], ["Single action maximum", "Tek işlem üst sınırı"], ["Save policy", "Politikayı kaydet"],
    ["Plan", "Plan"], ["CURRENT PLAN", "MEVCUT PLAN"], ["Free", "Ücretsiz"], ["500 credits every month", "Her ay 500 kredi"], ["REFERENCE PRICES OBSERVED 16 OCT 2026", "16 EKİM 2026 TARİHİNDE GÖRÜLEN REFERANS FİYATLAR"], ["Pro", "Pro"], ["399.90 USD / month", "399,90 USD / ay"], ["25,000 credits and 15,000 media credits every month", "Her ay 25.000 kredi ve 15.000 medya kredisi"], ["This is a reference page only; no billing or purchase actions are implemented.", "Bu sayfa yalnızca referans amaçlıdır; faturalandırma veya satın alma işlemi uygulanmamıştır."],
    ["Emergency stop", "Acil durdurma"], ["Stops additional model task starts after the current provider request finishes. Workflow schedules are local drafts and no external actions are connected.", "Mevcut sağlayıcı isteği tamamlandıktan sonra yeni model görevlerinin başlamasını durdurur. İş akışı planları yerel taslaklardır; harici işlemler bağlı değildir."], ["Current state", "Mevcut durum"], ["Stopped", "Durduruldu"], ["Running", "Çalışıyor"],
    ["RECENT TASK", "SON GÖREV"], ["Meeting topic", "Toplantı konusu"], ["ATTENDEES", "KATILIMCILAR"], ["The Manager and up to six teammates walk to the meeting table. Employees with a saved model route can speak and contribute notes.", "Yönetici ve altı ekip üyesine kadar kişi toplantı masasına geçer. Kayıtlı model rotası olan çalışanlar konuşabilir ve not ekleyebilir."], ["Cancel", "İptal"], ["Start meeting", "Toplantıyı başlat"], ["What should the team do each time?", "Ekip her seferinde ne yapmalı?"], ["Schedule", "Zamanlama"], ["Every day at 09:00", "Her gün 09.00'da"], ["Weekdays at 09:00", "Hafta içi 09.00'da"], ["Mondays at 09:00", "Pazartesi günleri 09.00'da"], ["Mon, Wed, Fri at 10:00", "Pzt, Çrş, Cum 10.00'da"], ["Custom", "Özel"], ["Cron expression", "Cron ifadesi"], ["minute hour day-of-month month day-of-week", "dakika saat ayın-günü ay haftanın-günü"], ["Create workflow", "İş akışı oluştur"],
    ["This pauses new task starts. A model request already in progress will finish before the team stops.", "Yeni görevlerin başlamasını duraklatır. Ekip durmadan önce devam eden model isteği tamamlanır."], ["Signed in as", "Oturum açan"], ["Workspace sync", "Çalışma alanı eşitleme"], ["Model provider keys stay on this device’s local runtime.", "Model sağlayıcı anahtarları bu cihazın yerel runtime’ında kalır."], ["Close", "Kapat"], ["Sign out", "Çıkış yap"], ["This pauses new task starts and ends office activities. Any provider request already in progress will finish.", "Yeni görevleri duraklatır ve ofis etkinliklerini bitirir. Devam eden sağlayıcı isteği tamamlanır."],
    ["GITHUB", "GITHUB"], ["CODE SANDBOX", "KOD KUM HAVUZU"], ["DEPLOYMENTS", "DAĞITIMLAR"], ["TEST RUNS", "TEST ÇALIŞTIRMALARI"], ["REPOSITORIES", "DEPOLAR"],
    ["e.g. Acme Studio", "ör. Acme Studio"], ["Briefly describe your company, project, or goals…", "Şirketini, projen veya hedeflerini kısaca açıkla…"],
    ["Describe the outcome you want…", "İstediğin sonucu açıkla…"], ["Describe the outcome you want", "İstediğin sonucu açıkla"], ["Send", "Gönder"],
    ["Interactive 3D office", "Etkileşimli 3D ofis"], ["Interactive office plan", "Etkileşimli ofis planı"], ["TEAM WORKSPACES", "EKİP ÇALIŞMA ALANLARI"], ["2D BACKUP VIEW", "2D YEDEK GÖRÜNÜM"], ["3D is unavailable in this browser. Your workspace is still ready.", "3D bu tarayıcıda kullanılamıyor; çalışma alanın yine de hazır."], ["No teammates yet", "Henüz ekip üyesi yok"], ["Interactive employee map · 2D mode", "Etkileşimli çalışan haritası · 2D görünüm"], ["Zoom in", "Yakınlaştır"], ["Zoom out", "Uzaklaştır"], ["Rotate the office", "Ofisi döndür"], ["Fit the office to the screen", "Ofisi ekrana sığdır"],
    ["Close chat panel", "Sohbet panelini kapat"], ["Open chat panel", "Sohbet panelini aç"], ["Open chat", "Sohbeti aç"],
    ["Collapse team list", "Ekip listesini daralt"], ["Expand team list", "Ekip listesini genişlet"],
    ["Token stays in this tab", "Token bu sekmede kalır"], ["Send message", "Mesaj gönder"], ["Add instructions for this employee…", "Bu çalışan için talimat ekle…"], ["Enter a model ID", "Model kimliği gir"],
    ["Search apps", "Uygulama ara"], ["What should the team discuss?", "Ekip neyi tartışmalı?"], ["Weekly report", "Haftalık rapor"], ["Summarize last week’s work…", "Geçen haftaki çalışmaları özetle…"],
    ["Call a team meeting", "Ekip toplantısı çağır"], ["New recurring workflow", "Yeni yinelenen iş akışı"], ["Add ", "Ekle "], ["Message ", "Mesaj "],
    ["Chief AI Manager", "Baş Yapay Zekâ Yöneticisi"], ["Research Analyst", "Araştırma Analisti"], ["Product Manager", "Ürün Yöneticisi"], ["Creative Director", "Yaratıcı Yönetmen"], ["Full-stack Engineer", "Full-stack Mühendis"], ["DevOps Engineer", "DevOps Mühendisi"], ["QA Engineer", "Kalite Güvence Mühendisi"], ["Growth Strategist", "Büyüme Stratejisti"], ["Content Manager", "İçerik Yöneticisi"], ["Video Director", "Video Yönetmeni"], ["Media Producer", "Medya Yapımcısı"], ["Ads Manager", "Reklam Yöneticisi"], ["Data Analyst", "Veri Analisti"], ["Support Specialist", "Destek Uzmanı"], ["Operations Coordinator", "Operasyon Koordinatörü"],
    ["Executive", "Yönetim"], ["Research", "Araştırma"], ["Product", "Ürün"], ["Software Development", "Yazılım Geliştirme"], ["Growth & Marketing", "Büyüme ve Pazarlama"], ["Advertising", "Reklam"], ["Data & Analytics", "Veri ve Analiz"], ["Customer Support", "Müşteri Desteği"], ["Operations", "Operasyon"],
    ["Reasoning", "Akıl yürütme"], ["Balanced", "Dengeli"], ["Creative", "Yaratıcı"], ["Pro", "Pro"], ["Idle", "Boşta"], ["Working", "Çalışıyor"], ["Offline", "Çevrimdışı"], ["Coffee", "Kahve molasında"], ["Meeting", "Toplantıda"], ["Speaking", "Konuşuyor"], ["Planned", "Planlandı"], ["Needs attention", "İlgilenilmeli"], ["Done", "Tamamlandı"],
    ["Planning · Delegation · Coordination", "Planlama · Görev dağıtımı · Koordinasyon"], ["Market research · Web research · Source analysis", "Pazar araştırması · Web araştırması · Kaynak analizi"], ["Product strategy · Requirements · Roadmaps", "Ürün stratejisi · Gereksinimler · Yol haritaları"], ["Art direction · Brand design · Visual systems", "Sanat yönetimi · Marka tasarımı · Görsel sistemler"], ["Frontend · Backend · APIs · Debugging", "Ön yüz · Arka yüz · API’ler · Hata ayıklama"], ["Infrastructure · CI/CD · Deployment", "Altyapı · CI/CD · Dağıtım"], ["Testing · Quality assurance · Accessibility", "Test · Kalite güvencesi · Erişilebilirlik"], ["Growth strategy · Social campaigns · Audience", "Büyüme stratejisi · Sosyal kampanyalar · Kitle"], ["Editorial · Copywriting · Content planning", "Editoryal · Metin yazarlığı · İçerik planlama"], ["Video · Storyboards · Short-form content", "Video · Storyboard’lar · Kısa içerik"], ["Image production · Layout · Brand consistency", "Görsel üretimi · Yerleşim · Marka tutarlılığı"], ["Paid social · Campaigns · Budget monitoring", "Ücretli sosyal medya · Kampanyalar · Bütçe takibi"], ["Analytics · Metrics · Reporting", "Analiz · Metrikler · Raporlama"], ["Customer support · Triage · Knowledge base", "Müşteri desteği · Önceliklendirme · Bilgi bankası"], ["Operations · Scheduling · Process design", "Operasyon · Zamanlama · Süreç tasarımı"],
    ["Popular", "Popüler"], ["Ads & analytics", "Reklam ve analiz"], ["Email", "E-posta"], ["Documents", "Belgeler"], ["Social", "Sosyal medya"], ["Commerce", "Ticaret"], ["CRM", "CRM"], ["Projects", "Projeler"], ["Design & web", "Tasarım ve web"], ["Chat", "Sohbet"],
    ["Publish approved posts, Reels and stories.", "Onaylı gönderileri, Reels videolarını ve hikâyeleri yayınla."], ["Post to Pages and read comments and insights.", "Sayfalarda paylaşım yap, yorumları ve analizleri oku."], ["Read, sort and summarize email; draft replies.", "E-postaları oku, sırala ve özetle; yanıt taslakları hazırla."], ["Read your calendar and prepare meetings.", "Takvimini oku ve toplantıları hazırla."], ["Find, read and organize files.", "Dosyaları bul, oku ve düzenle."], ["Read sheets and update rows.", "E-tabloları oku ve satırları güncelle."], ["Read campaigns and prepare changes for approval.", "Kampanyaları oku ve onay için değişiklikler hazırla."], ["Read traffic and conversion metrics.", "Trafik ve dönüşüm metriklerini oku."], ["Read pages and databases, and add pages.", "Sayfaları ve veritabanlarını oku, yeni sayfalar ekle."], ["Read channels and prepare messages.", "Kanalları oku ve mesaj taslakları hazırla."], ["Manage contacts, companies and deals.", "Kişileri, şirketleri ve anlaşmaları yönet."], ["Post to a page and read posts.", "Bir sayfada paylaşım yap ve gönderileri oku."], ["Manage channel videos and read performance.", "Kanal videolarını yönet ve performans verilerini oku."], ["Manage boards and cards.", "Panoları ve kartları yönet."], ["Read products and orders.", "Ürünleri ve siparişleri oku."], ["Read and organize design files.", "Tasarım dosyalarını oku ve düzenle."],
    ["Office area: ", "Ofis alanı: "], ["getting coffee", "kahve alıyor"], ["in a meeting", "toplantıda"], ["speaking", "konuşuyor"], ["on a task", "bir görev üzerinde"], ["away", "uzakta"], ["at their desk", "masasında"], ["Working on a task", "Bir görev üzerinde çalışıyor"], ["Not available for work", "Çalışmaya uygun değil"], ["Available for work", "Çalışmaya uygun"], ["Route ready", "Rota hazır"], ["Local runtime is offline", "Yerel runtime çevrimdışı"], ["Save this route to the local runtime", "Bu rotayı yerel runtime’a kaydet"], ["Key configured in local runtime", "Anahtar yerel runtime’da yapılandırıldı"], ["Enter key for this session", "Bu oturum için anahtar gir"],
    ["7 days", "7 gün"], ["14 days", "14 gün"], ["30 days", "30 gün"],
    ["MON", "PZT"], ["TUE", "SAL"], ["WED", "ÇAR"], ["THU", "PER"], ["FRI", "CUM"], ["SAT", "CTS"], ["SUN", "PAZ"],
    ["The key is sent only to this local runtime, held in memory, and cleared when the server exits. The selected provider receives the model prompt.", "Anahtar yalnızca bu yerel runtime’a gönderilir, bellekte tutulur ve sunucu kapandığında temizlenir. Model istemi seçilen sağlayıcıya iletilir."],
    ["Shared workspace could not be initialized. The local workspace is still available.", "Paylaşılan çalışma alanı başlatılamadı. Yerel çalışma alanı kullanılabilir durumda."], ["Emergency stop is on. New tasks are paused.", "Acil durdurma açık. Yeni görevler duraklatıldı."], ["Start the local runtime with npm start first.", "Önce npm start komutuyla yerel runtime’ı başlat."],
    ["Configure a provider, model and API key for Manager under Employees first.", "Önce Çalışanlar bölümünde Yönetici için sağlayıcı, model ve API anahtarı yapılandır."], ["Manager plan is ready. Review it, then choose Run team.", "Yönetici planı hazır. Gözden geçir, ardından Ekibi çalıştır’ı seç."], ["Manager could not create the plan: ", "Yönetici plan oluşturamadı: "],
    ["Emergency stop is on. The team cannot start an office activity.", "Acil durdurma açık. Ekip ofis etkinliği başlatamaz."], ["Finish the current office activity first.", "Önce mevcut ofis etkinliğini bitir."], ["No available employees can take a break right now.", "Şu anda mola verebilecek uygun çalışan yok."], ["The team is heading to the cafe.", "Ekip kafeye gidiyor."],
    ["Choose at least two available team members for a meeting.", "Toplantı için en az iki uygun ekip üyesi seç."], ["The team is gathering in the meeting room.", "Ekip toplantı odasında toplanıyor."], ["Meeting notes are ready in Activity.", "Toplantı notları Etkinlik bölümünde hazır."], ["End the team meeting before starting another goal.", "Yeni bir hedef başlatmadan önce ekip toplantısını bitir."],
    ["Manager's model route is not available. Reconfigure it before running this team.", "Yönetici model rotası kullanılamıyor. Ekibi çalıştırmadan önce yeniden yapılandır."], ["Choose a provider and enter a model ID first.", "Önce bir sağlayıcı seç ve model kimliği gir."], ["Model route saved in the local runtime.", "Model rotası yerel runtime’a kaydedildi."],
    ["Could not save route: ", "Rota kaydedilemedi: "], ["The in-memory provider key was cleared.", "Bellekteki sağlayıcı anahtarı temizlendi."], ["Could not clear key: ", "Anahtar temizlenemedi: "], ["Could not sign out: ", "Oturum kapatılamadı: "],
    ["Employee name saved.", "Çalışan adı kaydedildi."], ["The team will stop after the current model request.", "Ekip mevcut model isteği tamamlandıktan sonra duracak."], ["Budget limits are not enforced by this UI-only prototype.", "Bu yalnızca arayüz prototipinde bütçe sınırları uygulanmaz."],
    ["Only one local workspace is available in this prototype.", "Bu prototipte yalnızca bir yerel çalışma alanı kullanılabilir."], ["No new notifications.", "Yeni bildirim yok."], ["Local demo profile.", "Yerel demo profili."],
    ["Workspace profile saved to your account.", "Çalışma alanı profili hesabına kaydedildi."], ["Local recurring workflow created. No scheduled run was started.", "Yerel yinelenen iş akışı oluşturuldu. Zamanlanmış bir çalıştırma başlatılmadı."],
    ["Texas, USA", "Texas, USA"], ["Son güncelleme: 17 Ekim 2026", "Last updated: October 17, 2026"],
    ["Gizlilik Politikası", "Privacy Policy"], ["Gizlilik Politikası | Codlyio Studio", "Privacy Policy | Codlyio Studio"], ["Kullanım Koşulları | Codlyio Studio", "Terms of Use | Codlyio Studio"], ["Çerez Politikası | Codlyio Studio", "Cookie Policy | Codlyio Studio"], ["CODLYIO STUDIO · YASAL BİLGİLENDİRME", "CODLYIO STUDIO · LEGAL INFORMATION"], ["Codlyio Studio, hesabını ve çalışma alanını sunmak için gerekli verileri işler. Bu metin; web sitesi, hesap ve bulut senkronizasyonu kullanımını açıklar.", "Codlyio Studio processes the data needed to provide your account and workspace. This notice explains how the website, account, and cloud sync work."],
    ["Veri sorumlusu ve iletişim", "Data controller and contact"], ["Codlyio Studio hizmetinin işletmecisi, bu politika kapsamındaki kişisel verilerden sorumludur. Gizlilik ve kişisel veri taleplerinizi info@codly.io adresine iletebilirsiniz.", "The operator of Codlyio Studio is responsible for the personal data covered by this policy. Send privacy and personal data requests to info@codly.io."],
    ["İşlenen veriler", "Data we process"], ["Hesap açarken e-posta adresiniz ve Supabase tarafından oluşturulan kullanıcı kimliğiniz işlenir. Çalışma alanınızı buluta kaydetmeyi seçtiğinizde ekip üyeleri, görevler, hedefler, iş akışları, notlar ve tercihleri içeren çalışma alanı verisi hesabınızla ilişkilendirilerek Supabase veritabanında saklanır. Çalışma alanı verisi ayrıca bu cihazın yerel depolamasında tutulabilir.", "When you create an account, we process your email address and the user ID generated by Supabase. If you choose to save your workspace to the cloud, workspace data—including teammates, tasks, goals, workflows, notes, and preferences—is associated with your account and stored in the Supabase database. Workspace data may also be stored locally on this device."],
    ["Tema tercihiniz ve oturumun sürdürülmesi için gerekli bilgiler tarayıcı depolamasında saklanabilir. Model sağlayıcısına gönderdiğiniz istemler, konuşma içeriği ve yapılandırma bilgileri ilgili model sağlayıcısına iletilir. Gizli API anahtarları buluta senkronize edilen çalışma alanı kaydına dahil edilmez.", "Your theme preference and information needed to maintain your session may be stored in browser storage. Prompts, conversation content, and configuration information you send are transmitted to the selected model provider. Secret API keys are not included in workspace data synced to the cloud."],
    ["İşleme amaçları ve hizmet sağlayıcıları", "Purposes and service providers"], ["Veriler; hesabı doğrulamak, oturum açmayı sağlamak, çalışma alanını cihazlar arasında eşitlemek, kaydedilmiş görevleri göstermek, hizmeti korumak ve destek taleplerine yanıt vermek için kullanılır. Hesap ve eşitleme altyapısında Supabase; yapay zekâ görevlerinde ise sizin seçtiğiniz model sağlayıcısı kullanılır.", "We use data to verify your account, enable sign-in, sync your workspace across devices, show saved tasks, protect the service, and respond to support requests. Supabase provides account and sync infrastructure; your selected model provider handles AI tasks."],
    ["Supabase ve seçtiğiniz yapay zekâ sağlayıcısı verileri kendi altyapısında, Türkiye dışındaki bölgelerde işleyebilir. Bu hizmet sağlayıcıların kendi gizlilik metinleri ve saklama koşulları da geçerlidir. Codlyio Studio kişisel verileri reklam amacıyla satmaz.", "Supabase and your selected AI provider may process data in their own infrastructure outside Türkiye. Their privacy notices and retention terms also apply. Codlyio Studio does not sell personal data for advertising."],
    ["Saklama, güvenlik ve silme", "Retention, security, and deletion"], ["Veriler hesabınız ve hizmetiniz aktif olduğu sürece veya talebinizin tamamlanması ve uygulanabilir yasal yükümlülükler için gerektiği kadar saklanır. Hesap ya da veri silme talebi için info@codly.io adresine yazabilirsiniz; kimlik doğrulaması istenebilir.", "We retain data while your account and service are active, or as needed to complete your request and meet applicable legal obligations. To request account or data deletion, email info@codly.io; we may ask you to verify your identity."],
    ["Hesap ve çalışma alanı verilerini korumak için makul teknik önlemler uygulanır. İnternet üzerinden aktarım veya saklama mutlak güvenlik garantisi vermez.", "We use reasonable technical measures to protect account and workspace data. Transmission or storage over the internet cannot be guaranteed to be completely secure."], ["Haklarınız", "Your rights"], ["Kişisel verilerinizle ilgili bilgi ve talepleriniz için info@codly.io adresinden işletmeciye ulaşabilirsiniz. Başvurular yürürlükteki veri koruma mevzuatına göre değerlendirilir.", "For information or requests about your personal data, contact the operator at info@codly.io. Requests are handled under applicable data protection laws."],
    ["Kullanım Koşulları", "Terms of Use"], ["Bu koşullar Codlyio Studio web sitesi, hesap özellikleri ve yapay zekâ çalışma alanının kullanımını düzenler.", "These terms govern use of the Codlyio Studio website, account features, and AI workspace."],
    ["Hesap ve güvenlik", "Account and security"], ["Hesap açarken doğru bilgi verin ve giriş bilgilerinizi koruyun. Hesabınızdan yapılan işlemlerden siz sorumlusunuz. Yetkisiz erişimden şüphelenirseniz info@codly.io adresine bildirin.", "Provide accurate information when creating an account and keep your credentials secure. You are responsible for activity on your account. If you suspect unauthorized access, notify info@codly.io."],
    ["Kabul edilebilir kullanım", "Acceptable use"], ["Hizmeti hukuka aykırı amaçlarla kullanamaz, hizmetin güvenliğini veya kullanılabilirliğini bozamaz, başkalarının haklarını ihlal edemez ya da zararlı, yanıltıcı veya izinsiz içerik gönderemezsiniz. Bu koşulları ihlal eden erişim sınırlandırılabilir.", "Do not use the service unlawfully, compromise its security or availability, violate others’ rights, or submit harmful, misleading, or unauthorized content. Access may be restricted for violations."],
    ["Yapay zekâ modelleri ve içerik", "AI models and content"], ["Çalıştırdığınız istemler ve konuşma içeriği seçtiğiniz model sağlayıcısına iletilir. Sağlayıcı hesaplarınızın, API anahtarlarınızın, ücretlerinizin ve ilgili sağlayıcı koşullarına uyumun sorumluluğu size aittir. Hassas veya gizli bilgileri göndermeden önce sağlayıcının koşullarını inceleyin.", "Prompts and conversation content you submit are sent to your selected model provider. You are responsible for provider accounts, API keys, fees, and compliance with provider terms. Review those terms before sending sensitive or confidential information."],
    ["Model çıktıları hatalı, eksik veya güncel olmayan bilgiler içerebilir; kritik kararlar öncesinde çıktıları bağımsız olarak doğrulayın. Codlyio Studio belirli bir model çıktısı veya sonuç garantisi vermez.", "Model outputs may be inaccurate, incomplete, or outdated; independently verify them before making important decisions. Codlyio Studio does not guarantee any specific model output or result."],
    ["Fikri mülkiyet ve kullanıcı içerikleri", "Intellectual property and user content"], ["Codlyio Studio’ya ait marka, tasarım, metin ve yazılım unsurları ilgili hak sahiplerine aittir. Önceden yazılı izin olmadan kopyalanamaz veya ticari amaçla kullanılamaz. Yüklediğiniz içerikleri kullanma yetkiniz olduğunu kabul edersiniz.", "Codlyio Studio’s brand, design, text, and software belong to their respective rights holders. They may not be copied or used commercially without prior written permission. You confirm that you have the right to use content you upload."],
    ["Hizmetin kullanılabilirliği ve değişiklikler", "Service availability and changes"], ["Bakım, güvenlik veya teknik nedenlerle hizmet geçici olarak kullanılamayabilir. Bu koşullar güncellendiğinde yeni sürüm bu sayfada yayımlanır. Emredici tüketici hakları ve kanunen sınırlandırılamayan sorumluluklar saklıdır.", "The service may be temporarily unavailable for maintenance, security, or technical reasons. Updated terms will be published on this page. Mandatory consumer rights and liabilities that cannot legally be limited remain unaffected."],
    ["Uygulanacak hukuk ve iletişim", "Governing law and contact"], ["Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda kanunen yetkili mercilere başvuru hakları saklıdır. Sorularınızı info@codly.io adresine gönderebilirsiniz.", "These terms are governed by the laws of the Republic of Türkiye. The right to apply to legally competent authorities in disputes is reserved. Send questions to info@codly.io."],
    ["Çerez ve Tarayıcı Depolama Politikası", "Cookies and Browser Storage Policy"], ["Codlyio Studio bazı tercihleri ve oturum durumunu hatırlamak için tarayıcı depolama teknolojileri kullanır.", "Codlyio Studio uses browser storage technologies to remember certain preferences and session state."],
    ["Kullanılan depolama alanları", "Storage we use"], ["Tema ve arayüz dili tercihleri codlyio.com alt alan adları arasında paylaşılabilen birinci taraf çerezde saklanabilir. Demo çalışma alanı ve yerel çalışma alanının hangi hesaba ait olduğunu hatırlamak için localStorage da kullanılabilir. Supabase Auth, oturumun sürdürülmesi ve yenilenmesi için tarayıcı depolamasında oturum bilgisi tutar. Bunlar temel site ve hesap özelliklerini çalıştırmak içindir.", "Theme and interface language preferences may be stored in a first-party cookie shared across codlyio.com subdomains. localStorage may also be used for the demo workspace and to remember which account a local workspace belongs to. Supabase Auth stores session information in browser storage to maintain and renew your session. These technologies support core site and account features."],
    ["Analiz ve reklam çerezleri", "Analytics and advertising cookies"], ["Mevcut uygulama kodunda analiz veya reklam amacıyla kullanılan çerez/izleyici entegrasyonu bulunmamaktadır. İleride zorunlu olmayan analiz veya pazarlama teknolojileri eklenirse, kullanıma alınmadan önce gerekli bilgilendirme ve tercih mekanizmaları sağlanmalıdır.", "The current application does not integrate cookies or trackers for analytics or advertising. If optional analytics or marketing technologies are added in the future, the required notices and preference controls will be provided before use."],
    ["Tercihleri yönetme", "Manage preferences"], ["Tema tercihini sayfanın altındaki tema düğmesinden veya Studio içindeki Ayarlar bölümünden değiştirebilirsiniz. Tarayıcı ayarlarınızdan bu siteye ait depolama verilerini temizlemek oturumu ve yerel çalışma alanını silebilir; tekrar giriş yapmanız veya bulut yedeğini yeniden yüklemeniz gerekebilir.", "You can change your theme using the footer theme control or the Settings area in Studio. Clearing this site’s storage in your browser settings may remove your session and local workspace; you may need to sign in again or restore a cloud backup."],
    ["Üçüncü taraf hizmetler", "Third-party services"], ["Hesap ve bulut eşitleme Supabase üzerinden, yapay zekâ işlemleri seçtiğiniz model sağlayıcısı üzerinden yürütülür. Bu hizmetler kendi tarayıcı ve gizlilik teknolojilerini kullanabilir; ilgili sağlayıcıların gizlilik metinleri de geçerlidir.", "Accounts and cloud sync are provided through Supabase; AI operations use your selected model provider. These services may use their own browser and privacy technologies, and their privacy notices also apply."],
  ];

  const englishToTurkish = new Map();
  const turkishToEnglish = new Map();
  const appPhrasesStart = phrases.findIndex(([first]) => first === "YOUR AI WORKSPACE");
  const appPhrasesEnd = phrases.findIndex(([first], index) => index > appPhrasesStart && first === "Texas, USA");
  phrases.forEach(([first, second], index) => {
    const [turkish, english] = index >= appPhrasesStart && index < appPhrasesEnd ? [second, first] : [first, second];
    if (turkish !== english) {
      englishToTurkish.set(english, turkish);
      turkishToEnglish.set(turkish, english);
    }
  });

  function getLanguage() {
    try {
      const sharedPreference = readCookie(LANGUAGE_STORE);
      if (sharedPreference === "en" || sharedPreference === "tr") return sharedPreference;
      const saved = localStorage.getItem(LANGUAGE_STORE);
      return saved === "en" ? "en" : "tr";
    } catch {
      return "tr";
    }
  }

  function readCookie(name) {
    return document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="))?.slice(name.length + 1) || "";
  }

  function savePreference(name, value) {
      try { localStorage.setItem(name, value); } catch {}
    if (/(^|\.)codlyio\.com$/i.test(location.hostname)) {
      document.cookie = `${name}=${encodeURIComponent(value)}; domain=.codlyio.com; path=/; max-age=31536000; SameSite=Lax; Secure`;
    }
  }

  function getTheme() {
    const sharedPreference = readCookie(THEME_STORE);
    if (sharedPreference === "dark" || sharedPreference === "light") return sharedPreference;
    try { return localStorage.getItem(THEME_STORE) === "dark" ? "dark" : "light"; } catch { return "light"; }
  }

  function setTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    savePreference(THEME_STORE, nextTheme);
    return nextTheme;
  }

  function translateValue(value, language) {
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    const content = value.slice(leading.length, value.length - trailing.length || undefined);
    const dictionary = language === "en" ? turkishToEnglish : englishToTurkish;
    let translated = dictionary.get(content);
    if (!translated && language === "tr") {
      const teamStatus = content.match(/^Team · (\d+) active$/);
      const workSummary = content.match(/^(\d+) of (\d+) working$/);
      const goalSummary = content.match(/^(\d+) active goal(s)?$/);
      const taskSummary = content.match(/^(\d+) tasks · (.*)$/);
      const plannedTaskSummary = content.match(/^(\d+) planned tasks · (.*)$/);
      const employeeSummary = content.match(/^(\d+) EMPLOYEE(S)?$/i);
      if (teamStatus) translated = `Ekip · ${teamStatus[1]} aktif`;
      else if (workSummary) translated = `${workSummary[1]} / ${workSummary[2]} kişi çalışıyor`;
      else if (goalSummary) translated = `${goalSummary[1]} etkin hedef`;
      else if (taskSummary) translated = `${taskSummary[1]} görev · ${taskSummary[2]}`;
      else if (plannedTaskSummary) translated = `${plannedTaskSummary[1]} planlı görev · ${plannedTaskSummary[2]}`;
      else if (employeeSummary) translated = `${employeeSummary[1]} çalışan`;
    } else if (!translated && language === "en") {
      const teamStatus = content.match(/^Ekip · (\d+) aktif$/);
      const workSummary = content.match(/^(\d+) \/ (\d+) kişi çalışıyor$/);
      const goalSummary = content.match(/^(\d+) etkin hedef$/);
      const taskSummary = content.match(/^(\d+) görev · (.*)$/);
      const plannedTaskSummary = content.match(/^(\d+) planlı görev · (.*)$/);
      const employeeSummary = content.match(/^(\d+) çalışan$/);
      if (teamStatus) translated = `Team · ${teamStatus[1]} active`;
      else if (workSummary) translated = `${workSummary[1]} of ${workSummary[2]} working`;
      else if (goalSummary) translated = `${goalSummary[1]} active goal${Number(goalSummary[1]) === 1 ? "" : "s"}`;
      else if (taskSummary) translated = `${taskSummary[1]} tasks · ${taskSummary[2]}`;
      else if (plannedTaskSummary) translated = `${plannedTaskSummary[1]} planned tasks · ${plannedTaskSummary[2]}`;
      else if (employeeSummary) translated = `${employeeSummary[1]} employee${Number(employeeSummary[1]) === 1 ? "" : "s"}`;
    }
    if (!translated) {
      for (const [source, target] of dictionary) {
        if (source.endsWith(" ") && content.startsWith(source)) {
          translated = target + content.slice(source.length);
          break;
        }
      }
    }
    return translated ? leading + translated + trailing : value;
  }

  function translate(root = document, language = getLanguage()) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest("script, style, code, pre, textarea")) continue;
      const value = node.nodeValue || "";
      const translated = translateValue(value, language);
      if (translated !== value) node.nodeValue = translated;
    }
    root.querySelectorAll?.("[placeholder], [title], [aria-label], [alt], meta[name='description'], meta[property^='og:']").forEach((element) => {
      ["placeholder", "title", "aria-label", "alt", "content"].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const value = element.getAttribute(attribute);
        element.setAttribute(attribute, translateValue(value, language));
      });
    });
    document.documentElement.lang = language;
  }

  function setLanguage(language) {
    const nextLanguage = language === "en" ? "en" : "tr";
    savePreference(LANGUAGE_STORE, nextLanguage);
    translate(document, nextLanguage);
    document.querySelectorAll("[data-language-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.languageChoice === nextLanguage));
      button.classList.toggle("active", button.dataset.languageChoice === nextLanguage);
    });
    document.dispatchEvent(new CustomEvent("codlyio-language-change", { detail: { language: nextLanguage } }));
  }

  window.codlyioI18n = { getLanguage, setLanguage, translate, getTheme, setTheme };
  document.addEventListener("DOMContentLoaded", () => {
    translate(document, getLanguage());
    document.querySelectorAll("[data-language-choice]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.languageChoice));
    });
  });
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === "characterData") {
        const value = record.target.nodeValue || "";
        const translated = translateValue(value, getLanguage());
        if (translated !== value) record.target.nodeValue = translated;
      }
      record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.nodeValue = translateValue(node.nodeValue || "", getLanguage());
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          translate(node, getLanguage());
        }
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true });
  translate(document, getLanguage());
})();
