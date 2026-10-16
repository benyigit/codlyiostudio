const documents = {
  privacy: {
    title: "Gizlilik Politikası",
    intro: "Codlyio Studio, hesabını ve çalışma alanını sunmak için gerekli verileri işler. Bu metin; web sitesi, hesap ve bulut senkronizasyonu kullanımını açıklar.",
    sections: [
      ["Veri sorumlusu ve iletişim", "Codlyio Studio hizmetinin işletmecisi, bu politika kapsamındaki kişisel verilerden sorumludur. Gizlilik ve kişisel veri taleplerinizi info@codly.io adresine iletebilirsiniz."],
      ["İşlenen veriler", "Hesap açarken e-posta adresiniz ve Supabase tarafından oluşturulan kullanıcı kimliğiniz işlenir. Çalışma alanınızı buluta kaydetmeyi seçtiğinizde ekip üyeleri, görevler, hedefler, iş akışları, notlar ve tercihleri içeren çalışma alanı verisi hesabınızla ilişkilendirilerek Supabase veritabanında saklanır. Çalışma alanı verisi ayrıca bu cihazın yerel depolamasında tutulabilir.", "Tema tercihiniz ve oturumun sürdürülmesi için gerekli bilgiler tarayıcı depolamasında saklanabilir. Model sağlayıcısına gönderdiğiniz istemler, konuşma içeriği ve yapılandırma bilgileri ilgili model sağlayıcısına iletilir. Gizli API anahtarları buluta senkronize edilen çalışma alanı kaydına dahil edilmez."],
      ["İşleme amaçları ve hizmet sağlayıcıları", "Veriler; hesabı doğrulamak, oturum açmayı sağlamak, çalışma alanını cihazlar arasında eşitlemek, kaydedilmiş görevleri göstermek, hizmeti korumak ve destek taleplerine yanıt vermek için kullanılır. Hesap ve eşitleme altyapısında Supabase; yapay zekâ görevlerinde ise sizin seçtiğiniz model sağlayıcısı kullanılır.", "Supabase ve seçtiğiniz yapay zekâ sağlayıcısı verileri kendi altyapısında, Türkiye dışındaki bölgelerde işleyebilir. Bu hizmet sağlayıcıların kendi gizlilik metinleri ve saklama koşulları da geçerlidir. Codlyio Studio kişisel verileri reklam amacıyla satmaz."],
      ["Saklama, güvenlik ve silme", "Veriler hesabınız ve hizmetiniz aktif olduğu sürece veya talebinizin tamamlanması ve uygulanabilir yasal yükümlülükler için gerektiği kadar saklanır. Hesap ya da veri silme talebi için info@codly.io adresine yazabilirsiniz; kimlik doğrulaması istenebilir.", "Hesap ve çalışma alanı verilerini korumak için makul teknik önlemler uygulanır. İnternet üzerinden aktarım veya saklama mutlak güvenlik garantisi vermez."],
      ["Haklarınız", "Kişisel verilerinizle ilgili bilgi ve talepleriniz için info@codly.io adresinden işletmeciye ulaşabilirsiniz. Başvurular yürürlükteki veri koruma mevzuatına göre değerlendirilir."],
    ],
  },
  terms: {
    title: "Kullanım Koşulları",
    intro: "Bu koşullar Codlyio Studio web sitesi, hesap özellikleri ve yapay zekâ çalışma alanının kullanımını düzenler.",
    sections: [
      ["Hesap ve güvenlik", "Hesap açarken doğru bilgi verin ve giriş bilgilerinizi koruyun. Hesabınızdan yapılan işlemlerden siz sorumlusunuz. Yetkisiz erişimden şüphelenirseniz info@codly.io adresine bildirin."],
      ["Kabul edilebilir kullanım", "Hizmeti hukuka aykırı amaçlarla kullanamaz, hizmetin güvenliğini veya kullanılabilirliğini bozamaz, başkalarının haklarını ihlal edemez ya da zararlı, yanıltıcı veya izinsiz içerik gönderemezsiniz. Bu koşulları ihlal eden erişim sınırlandırılabilir."],
      ["Yapay zekâ modelleri ve içerik", "Çalıştırdığınız istemler ve konuşma içeriği seçtiğiniz model sağlayıcısına iletilir. Sağlayıcı hesaplarınızın, API anahtarlarınızın, ücretlerinizin ve ilgili sağlayıcı koşullarına uyumun sorumluluğu size aittir. Hassas veya gizli bilgileri göndermeden önce sağlayıcının koşullarını inceleyin.", "Model çıktıları hatalı, eksik veya güncel olmayan bilgiler içerebilir; kritik kararlar öncesinde çıktıları bağımsız olarak doğrulayın. Codlyio Studio belirli bir model çıktısı veya sonuç garantisi vermez."],
      ["Fikri mülkiyet ve kullanıcı içerikleri", "Codlyio Studio’ya ait marka, tasarım, metin ve yazılım unsurları ilgili hak sahiplerine aittir. Önceden yazılı izin olmadan kopyalanamaz veya ticari amaçla kullanılamaz. Yüklediğiniz içerikleri kullanma yetkiniz olduğunu kabul edersiniz."],
      ["Hizmetin kullanılabilirliği ve değişiklikler", "Bakım, güvenlik veya teknik nedenlerle hizmet geçici olarak kullanılamayabilir. Bu koşullar güncellendiğinde yeni sürüm bu sayfada yayımlanır. Emredici tüketici hakları ve kanunen sınırlandırılamayan sorumluluklar saklıdır."],
      ["Uygulanacak hukuk ve iletişim", "Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda kanunen yetkili mercilere başvuru hakları saklıdır. Sorularınızı info@codly.io adresine gönderebilirsiniz."],
    ],
  },
  cookies: {
    title: "Çerez ve Tarayıcı Depolama Politikası",
    intro: "Codlyio Studio bazı tercihleri ve oturum durumunu hatırlamak için tarayıcı depolama teknolojileri kullanır.",
    sections: [
      ["Kullanılan depolama alanları", "Tema seçimi, demo çalışma alanı ve yerel çalışma alanının hangi hesaba ait olduğunu hatırlamak için localStorage kullanılabilir. Supabase Auth, oturumun sürdürülmesi ve yenilenmesi için tarayıcı depolamasında oturum bilgisi tutar. Bunlar temel site ve hesap özelliklerini çalıştırmak içindir."],
      ["Analiz ve reklam çerezleri", "Mevcut uygulama kodunda analiz veya reklam amacıyla kullanılan çerez/izleyici entegrasyonu bulunmamaktadır. İleride zorunlu olmayan analiz veya pazarlama teknolojileri eklenirse, kullanıma alınmadan önce gerekli bilgilendirme ve tercih mekanizmaları sağlanmalıdır."],
      ["Tercihleri yönetme", "Tema tercihini sayfanın üst veya alt kısmındaki tema düğmesinden değiştirebilirsiniz. Tarayıcı ayarlarınızdan bu siteye ait depolama verilerini temizlemek oturumu ve yerel çalışma alanını silebilir; tekrar giriş yapmanız veya bulut yedeğini yeniden yüklemeniz gerekebilir."],
      ["Üçüncü taraf hizmetler", "Hesap ve bulut eşitleme Supabase üzerinden, yapay zekâ işlemleri seçtiğiniz model sağlayıcısı üzerinden yürütülür. Bu hizmetler kendi tarayıcı ve gizlilik teknolojilerini kullanabilir; ilgili sağlayıcıların gizlilik metinleri de geçerlidir."],
    ],
  },
};

const page = document.querySelector("[data-legal-page]");
const pageType = page?.dataset.legalPage;
const content = documents[pageType];

if (page && content) {
  document.title = `${content.title} | Codlyio Studio`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", content.intro);

  const article = document.querySelector("[data-legal-content]");
  const eyebrow = document.createElement("p");
  eyebrow.className = "legal-eyebrow";
  eyebrow.textContent = "CODLYIO STUDIO · YASAL BİLGİLENDİRME";

  const heading = document.createElement("h1");
  heading.textContent = content.title;

  const intro = document.createElement("p");
  intro.className = "legal-intro";
  intro.textContent = content.intro;

  const updated = document.createElement("p");
  updated.className = "legal-updated";
  updated.textContent = "Son güncelleme: 17 Ekim 2026";

  article.append(eyebrow, heading, intro, updated);
  content.sections.forEach(([title, ...paragraphs], index) => {
    const section = document.createElement("section");
    section.className = "legal-section";
    const number = document.createElement("span");
    number.className = "legal-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const text = document.createElement("div");
    const sectionHeading = document.createElement("h2");
    sectionHeading.textContent = title;
    text.append(sectionHeading);
    paragraphs.forEach((copy) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = copy;
      text.append(paragraph);
    });
    section.append(number, text);
    article.append(section);
  });
}
