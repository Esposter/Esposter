import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the "-iyor" a Turkish interface puts on a running task, so a turn stays one word.
// Everything the data package or the game carries — the names, titles, elements, regions, descriptions and every
// Character's own voice lines — is absent here and asked of them
const turkish: Localization = {
  characters: {
    Aether: {
      greeting: "Selam. Paimon işimiz olduğunu söylüyor.",
      verbs: ["Yolculuk ediyor", "Arıyor", "Süzülüyor", "Dinliyor"],
    },
    Aino: {
      greeting: "Ooo, yeni bir proje mi? Bana bir anahtar uzat.",
      verbs: ["Kurcalıyor", "Vida sıkıyor", "İcat ediyor", "Atıştırıyor"],
    },
    Albedo: {
      greeting: "İlginç. Çalışırken not alabilir miyim?",
      verbs: ["Eskiz çiziyor", "Sentezliyor", "Araştırıyor", "İnceliyor"],
    },
    Alhaitham: {
      greeting: "Talebini düzgünce ifade et, ben de ilgileneyim.",
      verbs: ["Okuyor", "Reddediyor", "Arşivliyor", "Akıl yürütüyor"],
    },
    Aloy: {
      greeting: "Yeni topraklar, aynı yay. Ne yapılması gerekiyor?",
      verbs: ["Avlanıyor", "Keşfe çıkıyor", "Ele geçiriyor", "İz sürüyor"],
    },
    Alyosha: {
      greeting: "İz taze. Hadi gidelim.",
      verbs: ["Avlanıyor", "İz sürüyor", "Nişan alıyor", "Hesap tutuyor"],
    },
    Amber: {
      greeting: "Öncü rapor veriyor! Görev ne?",
      verbs: ["Süzülüyor", "Koşuyor", "Gözcülük ediyor", "Fırında pişiriyor"],
    },
    "Arataki Itto": {
      greeting: "Tek ve eşsiz oni geldi! Ezip geçelim!",
      verbs: ["Kavga ediyor", "Böcek dövüştürüyor", "Böbürleniyor", "Kazanıyor"],
    },
    Arlecchino: {
      greeting: "Bu ortaklığı hoş tutalım. Başla.",
      verbs: ["Denetliyor", "Yargılıyor", "Gönderiyor", "Gözlemliyor"],
    },
    Baizhu: {
      greeting: "Otur. Neren ağrıyor, ne zamandan beri söyle.",
      verbs: ["Teşhis koyuyor", "Reçete yazıyor", "Ayıklıyor", "Dinleniyor"],
    },
    Barbara: {
      greeting: "Tadaa! Moral vermeyi bana bırak!",
      verbs: ["İyileştiriyor", "Şarkı söylüyor", "Tezahürat yapıyor", "Prova ediyor"],
    },
    Beidou: {
      greeting: "Gemiye hoş geldin. Arkanı ben kollarım.",
      verbs: ["Seyrediyor", "İdman yapıyor", "İçiyor", "Komuta ediyor"],
    },
    Bennett: {
      greeting: "Takımda bir kişilik daha yer var mı? Lütfen?",
      verbs: ["Maceraya atılıyor", "Hazine arıyor", "Tökezliyor", "Izgara yapıyor"],
    },
    Candace: {
      greeting: "Burada dinlen. Nöbeti ben tutuyorum.",
      verbs: ["Koruyor", "Devriye geziyor", "Kalkan tutuyor", "Nöbet tutuyor"],
    },
    Charlotte: {
      greeting: "Özel bir röportaja bir dakikan var mı?",
      verbs: ["Haber yapıyor", "Fotoğraf çekiyor", "Röportaj yapıyor", "Fotoğraf basıyor"],
    },
    Chasca: {
      greeting: "Çözülecek bir anlaşmazlık var mı? Fiyatını söyle.",
      verbs: ["Süzülerek yükseliyor", "Arabuluculuk ediyor", "Daire çiziyor", "Şarjör değiştiriyor"],
    },
    Chevreuse: {
      greeting: "Nezaket faslını geçelim. Hangi dava?",
      verbs: ["Soruşturuyor", "Nişan alıyor", "Atıştırıyor", "Devriye geziyor"],
    },
    Chiori: {
      greeting: "Sipariş mi, sohbet mi? Sadece biri bedava.",
      verbs: ["Terzilik yapıyor", "Kesiyor", "Prova ettiriyor", "Kestiriyor"],
    },
    Chongyun: {
      greeting: "Bir onur. Sakince başlayalım mı?",
      verbs: ["Ruh kovuyor", "Serinletiyor", "Okuyor", "Araştırıyor"],
    },
    Citlali: {
      greeting: "Duman geleceğini söyledi. Peki. Ne var?",
      verbs: ["Yıldız izliyor", "Kehanette bulunuyor", "Okuyor", "İçiyor"],
    },
    Clorinde: {
      greeting: "Anlaşmazlığını söyle. Ayrıntıları atla.",
      verbs: ["Düello ediyor", "Yargılıyor", "Devriye geziyor", "Avlanıyor"],
    },
    Collei: {
      greeting: "Stajyer rapor veriyor! Bunu çalıştım. Doğru oldu mu?",
      verbs: ["Devriye geziyor", "Dikiyor", "Süzülüyor", "Rapor veriyor"],
    },
    Columbina: {
      greeting: "Ay doğdu. Altında yürüyelim mi?",
      verbs: ["Ayı izliyor", "Şarkı söylüyor", "Kutsuyor", "Geziniyor"],
    },
    Cyno: {
      greeting: "Yargı başlıyor. Ya da bir kart oyunu, sen seç.",
      verbs: ["Yargılıyor", "Kart çekiyor", "Tartıyor", "Kelime oyunu yapıyor"],
    },
    Dahlia: {
      greeting: "Seni rüzgâr getirdi. Otur, rahatına bak.",
      verbs: ["Dinliyor", "Dolaşıyor", "Dedikodu arıyor", "Kutsuyor"],
    },
    Dehya: {
      greeting: "Paralı asker burada. Sipariş, kavga, yoksa eskort mu?",
      verbs: ["Koruyor", "Eşlik ediyor", "Kavga ediyor", "Yeniden düzenliyor"],
    },
    Diluc: {
      greeting: "Lafı uzatma. Ne yapılması gerekiyor?",
      verbs: ["Dolduruyor", "Hazırlıyor", "Vuruyor", "Yönetiyor"],
    },
    Diona: {
      greeting: "Kedi Kuyruğu kapalı. ...Peki, gir.",
      verbs: ["Karıştırıyor", "Atılıyor", "Avlanıyor", "Tıslıyor"],
    },
    Dori: {
      greeting: "Ah, bir müşteri! İlk alışveriş kelepir.",
      verbs: ["Pazarlık ediyor", "Sayıyor", "Ticaret yapıyor", "İndirim yapıyor"],
    },
    Durin: {
      greeting: "Merhaba! Bu da hikâyenin bir parçası mı?",
      verbs: ["Keşfediyor", "Oynuyor", "Geziniyor", "Öğreniyor"],
    },
    Emilie: {
      greeting: "Parfümle mi ilgili? Değilse, daha sessiz bir yere.",
      verbs: ["Damıtıyor", "Şişeliyor", "Buduyor", "Harmanlıyor"],
    },
    Escoffier: {
      greeting: "Önlükler takılsın. Bugün ne servis ediyoruz?",
      verbs: ["Tabak hazırlıyor", "Koyulaştırıyor", "Temperliyor", "Biliyor"],
    },
    Eula: {
      greeting: "Köpük Şövalyesi selam verir. Evet, o Lawrence.",
      verbs: ["Keşif yapıyor", "Kınıyor", "Donduruyor", "Yemin ediyor"],
    },
    Faruzan: {
      greeting: "Konuşmadan önce unvanlarıma bak, genç.",
      verbs: ["Şifre çözüyor", "Bilmece çözüyor", "Ders veriyor", "Fon başvurusu yazıyor"],
    },
    Fischl: {
      greeting: "Prinzessin iniyor! Oz, çevir: merhaba.",
      verbs: ["Ferman veriyor", "Kehanette bulunuyor", "İniyor", "Çeviriyor"],
    },
    Flins: {
      greeting: "Adaya hoş geldin. Mezarlara dikkat et.",
      verbs: ["Fener bekliyor", "Topluyor", "Dinliyor", "Bakım yapıyor"],
    },
    Freminet: {
      greeting: "Selam. Tokalaşmaya gerek yok. Aşağıda ne var?",
      verbs: ["Dalıyor", "Kurtarıyor", "Söküyor", "Ölçüm yapıyor"],
    },
    Furina: {
      greeting: "Büyülendin mi? Anlaşılır. Yıldız geldi.",
      verbs: ["Sahneye çıkıyor", "Prova ediyor", "Poz veriyor", "Başkanlık ediyor"],
    },
    Gaming: {
      greeting: "Selam patron! Otur, ağır işleri ben hallederim.",
      verbs: ["Eşlik ediyor", "Paketliyor", "Davul çalıyor", "Atıştırıyor"],
    },
    Ganyu: {
      greeting: "Anlaşma hazırlandı... ah, imzalamayı unuttum.",
      verbs: ["Dosyalıyor", "Taslak yazıyor", "Otluyor", "Fazla mesai yapıyor"],
    },
    Gorou: {
      greeting: "General Gorou hazır! Omuz omuza zafere!",
      verbs: ["Tatbikat yapıyor", "Toparlıyor", "Tırmanıyor", "Gözcülük ediyor"],
    },
    "Hu Tao": {
      greeting: "Yo! Müdürü mü arıyorsun? Yüzün pek sağlıklı, yazık.",
      verbs: ["Reklam yapıyor", "Kafiye yapıyor", "Şaka yapıyor", "Kaçıyor"],
    },
    Iansan: {
      greeting: "Isınma bitti. Bugünün seti ne?",
      verbs: ["Ağırlık kaldırıyor", "Antrenörlük yapıyor", "Kalori sayıyor", "Gösteriyor"],
    },
    Ifa: {
      greeting: "Ah, selam. Acele yok. Seni ne rahatsız ediyor?",
      verbs: ["Teşhis koyuyor", "Tıngırdatıyor", "Atıştırıyor", "Doğayı izliyor"],
    },
    Illuga: {
      greeting: "Kâbus Sarıasmaları. Rapor, çabuk.",
      verbs: ["Soruşturuyor", "Devriye geziyor", "Önderlik ediyor", "Yemek yapıyor"],
    },
    Ineffa: {
      greeting: "Sistemler hazır! Bum bum, hadi!",
      verbs: ["Süpürüyor", "Ayıklıyor", "Güncelliyor", "Şarj oluyor"],
    },
    Jahoda: {
      greeting: "Kuratoryum'un süper çalışanı, hizmetinizde!",
      verbs: ["Ayak işi yapıyor", "Dikiyor", "Keşfediyor", "Pazarlık ediyor"],
    },
    Jean: {
      greeting: "Karahindiba Şövalyesi, yanında.",
      verbs: ["Onaylıyor", "Yürüyor", "Gözden geçiriyor", "Esneme yapıyor"],
    },
    Kachina: {
      greeting: "Merhaba! Henüz güçlü değilim ama deneyeceğim!",
      verbs: ["Kazıyor", "İstifliyor", "Biriktiriyor", "Deliyor"],
    },
    "Kaedehara Kazuha": {
      greeting: "Rüzgâr bir dize getirdi, bir de seni. Memnun oldum.",
      verbs: ["Dolaşıyor", "Sürükleniyor", "Şiir yazıyor", "Dinliyor"],
    },
    Kaeya: {
      greeting: "Bu şövalye işinden daha eğlenceli olmalı.",
      verbs: ["Entrika çeviriyor", "Şarap tadıyor", "Donduruyor", "Takılıyor"],
    },
    "Kamisato Ayaka": {
      greeting: "Kamisato Ayaka, burada. Memnun oldum.",
      verbs: ["Dans ediyor", "Beste yapıyor", "Çalışıyor", "Başkanlık ediyor"],
    },
    "Kamisato Ayato": {
      greeting: "Sonunda tanışıyoruz; ajandam özür diler.",
      verbs: ["Entrika çeviriyor", "Devrediyor", "Olta sarıyor", "Tadına bakıyor"],
    },
    Kaveh: {
      greeting: "Zevklerimiz benzer mi? O zaman anlaşırız.",
      verbs: ["Tasarlıyor", "Eskiz çiziyor", "Cilalıyor", "Har vurup harman savuruyor"],
    },
    Keqing: {
      greeting: "Bir değişim çağı. Gel, tanık ol.",
      verbs: ["Reform yapıyor", "Acele ediyor", "Alışveriş yapıyor", "Devrediyor"],
    },
    Kinich: {
      greeting: "Beni bilgilendir. Ücreti söyle.",
      verbs: ["Avlanıyor", "Maliyet hesaplıyor", "Kanca atıyor", "İpe iniyor"],
    },
    Kirara: {
      greeting: "Teslimat! Hiçbir adres çok uzak değil, nya.",
      verbs: ["Teslim ediyor", "Fırlıyor", "Atılıyor", "Rota planlıyor"],
    },
    Klee: {
      greeting: "Kıvılcım Şövalyesi Klee! ...Gerisini unuttum.",
      verbs: ["Patlatıyor", "Bombayla balık tutuyor", "Zıplıyor", "Düşünüyor"],
    },
    "Kujou Sara": {
      greeting: "Kujou Sara. Inazuma korunuyor. Konuş.",
      verbs: ["Tatbikat yapıyor", "Nişan alıyor", "Koruyor", "Yükseliyor"],
    },
    "Kuki Shinobu": {
      greeting: "Arataki Çetesi, yardımcı konuşuyor. Evet, hepsi.",
      verbs: ["Tamir ediyor", "Ders çalışıyor", "Sertifika alıyor", "Zapt ediyor"],
    },
    "Lan Yan": {
      greeting: "Sepet, vazo, yoksa arkadaşlık mı? Hepsi mevcut.",
      verbs: ["Örüyor", "Topluyor", "Ekliyor", "Çiçek topluyor"],
    },
    Lauma: { greeting: "Koru seni selamlıyor, ben de.", verbs: ["Kutsuyor", "Dinliyor", "Dolaşıyor", "Dinleniyor"] },
    Layla: {
      greeting: "Hm? Pardon, ne? Ah. Selam.",
      verbs: ["Uyurgezerlik ediyor", "Yıldız haritası çiziyor", "Esniyor", "Yıldız izliyor"],
    },
    Linnea: {
      greeting: "Harikalar Kâhini, danışmanlıkta. Ne buldun?",
      verbs: ["Kataloglıyor", "Eskiz çiziyor", "Gözlemliyor", "Danışmanlık yapıyor"],
    },
    Lisa: {
      greeting: "Merhaba tatlım, Lisa'ya yardıma mı geldin?",
      verbs: ["Demliyor", "Göz gezdiriyor", "Uzanıyor", "Çarpıyor"],
    },
    Lohen: {
      greeting: "Kaptan yardımcısı. Kurallara uygun yol daha yavaş.",
      verbs: ["Nişan alıyor", "Doğaçlıyor", "Şaka yapıyor", "Devriye geziyor"],
    },
    Lumine: {
      greeting: "Merhaba. Paimon acıktı, o yüzden çabuk olalım.",
      verbs: ["Yolculuk ediyor", "Arıyor", "Süzülüyor", "Dinliyor"],
    },
    Lynette: {
      greeting: "Merhaba. Sorular Lyney'ye.",
      verbs: ["Yardım ediyor", "Dinleniyor", "Çay yapıyor", "Bekliyor"],
    },
    Lyney: {
      greeting: "İllüzyon yok, sadece ben! Bugün keyifler nasıl?",
      verbs: ["Gösteri yapıyor", "Sihir yapıyor", "Kayboluyor", "Göz kamaştırıyor"],
    },
    Manekin: { greeting: "...! Keşfe hazır.", verbs: ["Keşfediyor", "Kurcalıyor", "Mühür açıyor", "İşaret ediyor"] },
    Manekina: {
      greeting: "...! Önce hangi gizem?",
      verbs: ["Keşfediyor", "Kurcalıyor", "Mühür açıyor", "Hayran kalıyor"],
    },
    Mavuika: { greeting: "Alev yandı. Haydi sürelim.", verbs: ["Ateşliyor", "Sürüyor", "Toparlıyor", "Kafa yoruyor"] },
    Mika: {
      greeting: "Haritacı rapor veriyor. Yardım etmek bir onur.",
      verbs: ["Ölçüm yapıyor", "Harita çiziyor", "Gözcülük ediyor", "Kamp kuruyor"],
    },
    Mona: {
      greeting: "Önce tam adı öğren, sonra sor.",
      verbs: ["Kehanette bulunuyor", "Yıldız izliyor", "Bütçe yapıyor", "Tasarruf ediyor"],
    },
    Mualani: {
      greeting: "Rehber geldi! Bir şey lazımsa el kaldırın!",
      verbs: ["Sörf yapıyor", "Dalga kovalıyor", "Su sıçratıyor", "Rehberlik ediyor"],
    },
    Nahida: {
      greeting: "Bir süredir seni izliyordum. Sonunda, merhaba.",
      verbs: ["Rüya görüyor", "Merak ediyor", "Soruyor", "Büyüyor"],
    },
    Navia: {
      greeting: "Başkan, patron, ve aradaki her şey. Selam!",
      verbs: ["Başkanlık ediyor", "Fırında pişiriyor", "Yolculuk ediyor", "Komuta ediyor"],
    },
    Nefer: {
      greeting: "Kuratoryum açık. Gizli bir şey mi arıyorsun?",
      verbs: ["Küratörlük yapıyor", "Çıkarım yapıyor", "Gözlemliyor", "Su içiyor"],
    },
    Neuvillette: {
      greeting: "Selamlar. Soyadı yeterli.",
      verbs: ["Hüküm veriyor", "Tadına bakıyor", "Müzakere ediyor", "Yağmur yağdırıyor"],
    },
    Nicole: {
      greeting: "...Merhaba. O gürültülü kısımdı.",
      verbs: ["Dinliyor", "İşaret diliyle anlatıyor", "Gözlemliyor"],
    },
    Nilou: {
      greeting: "Birazdan bir dans başlıyor. Kalıp izler misin?",
      verbs: ["Dans ediyor", "Prova ediyor", "Dönüyor", "Çiçek açıyor"],
    },
    Ningguang: {
      greeting: "Ticaret mi yapmak istiyorsun? Şartları konuşalım.",
      verbs: ["Yatırım yapıyor", "Müzakere ediyor", "Başkanlık ediyor", "Koleksiyon yapıyor"],
    },
    Noelle: {
      greeting: "Şövalyelerin hizmetçisi, bugün hizmetinizde.",
      verbs: ["Temizlik yapıyor", "Hizmet ediyor", "Antrenman yapıyor", "Alışveriş yapıyor"],
    },
    Odette: {
      greeting: "Perde açılıyor. Başlayalım mı?",
      verbs: ["Prova ediyor", "Piruet yapıyor", "İmza dağıtıyor", "Diyet yapıyor"],
    },
    Ororon: {
      greeting: "Ah, selam. Sebze ister misin? Öylesine.",
      verbs: ["Bahçe işi yapıyor", "Tohum ekiyor", "Süzülüyor", "Yaprak biti izliyor"],
    },
    Prune: {
      greeting: "Cadı Avcısı Prune! Cadı gördün mü? Hiç mi?",
      verbs: ["Avlanıyor", "Not düşüyor", "İlan ediyor", "Ters ters bakıyor"],
    },
    Qiqi: {
      greeting: "Qiqi. Zombi. ...Gerisini unuttum.",
      verbs: ["Ot topluyor", "Unutuyor", "Serinliyor", "Sayıyor"],
    },
    "Raiden Shogun": {
      greeting: "Selamlaşma yok. Rehber olarak hizmet edeceksin.",
      verbs: ["Hükmediyor", "Kılıç çekiyor", "Meditasyon yapıyor", "Yargılıyor"],
    },
    Razor: { greeting: "Güzel kokuyorsun. Şimdi avlan.", verbs: ["Avlanıyor", "Koşuyor", "Kokluyor", "Koruyor"] },
    Rosaria: {
      greeting: "Çözemediğin bir sorun mu? O benim. Dualar başka yerde.",
      verbs: ["Devriye geziyor", "İçiyor", "Kaytarıyor", "Çalışıyor"],
    },
    Sandrone: {
      greeting: "Otur. Çay ölçülü, sen de ölçüleceksin.",
      verbs: ["Hesaplıyor", "Ağırlıyor", "Beste yapıyor", "Belgeliyor"],
    },
    "Sangonomiya Kokomi": {
      greeting: "Rahibe, teftişte. Ya da molada. İkisi de.",
      verbs: ["Strateji kuruyor", "Okuyor", "Yönlendiriyor", "Dinleniyor"],
    },
    Sayu: {
      greeting: "Sayu, emrinde. Önce bir kestirme mi?",
      verbs: ["Kestiriyor", "Uyukluyor", "Sinsice ilerliyor", "Yuvarlanıyor"],
    },
    Sethos: {
      greeting: "Beni mi arıyorsun? Oturup konuşalım.",
      verbs: ["Dolaşıyor", "Araştırıyor", "Baharatlıyor", "Gizlice ilerliyor"],
    },
    Shenhe: {
      greeting: "Shenhe. Halat seni benden korur.",
      verbs: ["Meditasyon yapıyor", "Riyazet çekiyor", "Donduruyor", "Bağlıyor"],
    },
    "Shikanoin Heizou": {
      greeting: "Neden burada olduğunu biliyorum. Şaka. Çoğunlukla.",
      verbs: ["Çıkarım yapıyor", "Kurcalıyor", "Aylak geziyor", "Kızartıyor"],
    },
    Sigewinne: {
      greeting: "Gerilme. Burası acıyor mu? Burası?",
      verbs: ["Bakıyor", "Teşhis koyuyor", "Sargı yapıyor", "Harmanlıyor"],
    },
    Skirk: {
      greeting: "Geldin. Güzel. Çek.",
      verbs: ["Antrenman yapıyor", "Sürükleniyor", "Meditasyon yapıyor", "Dayanıyor"],
    },
    Sucrose: {
      greeting: "Şey, merhaba! Sorabilir miyim... hayır, pardon. Sonra.",
      verbs: ["Deney yapıyor", "Not alıyor", "Düzenliyor", "Merak ediyor"],
    },
    Tartaglia: {
      greeting: "Yoldaş! Anlaşacağız, hissediyorum.",
      verbs: ["Dövüşüyor", "Buzda balık tutuyor", "Hücum ediyor", "Sırıtıyor"],
    },
    Thoma: {
      greeting: "Senin uygunsa yeni dostun Thoma!",
      verbs: ["Yemek yapıyor", "Topluyor", "Tamir ediyor", "Islık çalıyor"],
    },
    Tighnari: {
      greeting: "Orman Bekçisi. İlk kez mi? O zaman dinle.",
      verbs: ["Ot topluyor", "Kataloglıyor", "Kurutuyor", "Ders veriyor"],
    },
    Varesa: {
      greeting: "Selam! Meyve var mı? Bir de, selam!",
      verbs: ["Hasat ediyor", "Antrenman yapıyor", "Kamp kuruyor", "Ziyafet çekiyor"],
    },
    Varka: {
      greeting: "Büyük Üstat döndü! Kısaca. Ne kaçırdım?",
      verbs: ["Yürüyor", "Kestiriyor", "İçiyor", "Bütçe yapıyor"],
    },
    Venti: {
      greeting: "Ah, yine karşılaştık! Görev zamanı.",
      verbs: ["Tıngırdatıyor", "Kestiriyor", "İçiyor", "Kafiye yapıyor"],
    },
    Wanderer: {
      greeting: "İsimler mi? Çok oldu. Hiçbiri seni ilgilendirmez.",
      verbs: ["Sürükleniyor", "Alay ediyor", "Kara kara düşünüyor", "Esiyor"],
    },
    Wriothesley: {
      greeting: "Niyetini özetle. İş değil mi? Şimdi tedirgin oldum.",
      verbs: ["Boks yapıyor", "Çay demliyor", "Yönetiyor", "Denetliyor"],
    },
    Xiangling: {
      greeting: "Selam! En sevdiğim yer: mut— tavuk. Mutfak!",
      verbs: ["Soteliyor", "Baharatlıyor", "Malzeme topluyor", "Acılıyor"],
    },
    Xianyun: {
      greeting: "Bu kişi bağsızdır, ve bu kişi seni selamlar.",
      verbs: ["Riyazet çekiyor", "Tasarlıyor", "Yükseliyor", "Ağırlıyor"],
    },
    Xiao: { greeting: "Zamanı gelince adımı çağır.", verbs: ["Yok ediyor", "Savuşturuyor", "Sıçrıyor", "Dayanıyor"] },
    Xilonen: {
      greeting: "Aletler mi? Sıra var. Yine de, selam.",
      verbs: ["Dövüyor", "Çekiçliyor", "Kestiriyor", "Güneşleniyor"],
    },
    Xingqiu: {
      greeting: "Hizmetinizdeyim efendim. Alçakgönüllülükle, elbette.",
      verbs: ["Okuyor", "Göz gezdiriyor", "Kılıç talimi yapıyor", "Yazıyor"],
    },
    Xinyan: {
      greeting: "Xinyan, ve rock benim işim. Korkutucu değil!",
      verbs: ["Riff çalıyor", "Jam yapıyor", "Tıngırdatıyor", "Sesi açıyor"],
    },
    "Yae Miko": {
      greeting: "Resmî iş: seni izlemek. Rahatla.",
      verbs: ["Düzenliyor", "Takılıyor", "Yayımlıyor", "Entrika çeviriyor"],
    },
    Yanfei: {
      greeting: "En iyi hukuk uzmanı, rakipsiz. Davan ne?",
      verbs: ["Dava yürütüyor", "Değerlendiriyor", "Alıntı yapıyor", "Okuyor"],
    },
    Yaoyao: {
      greeting: "Merhaba! Yardım edeyim. Yemek yedin mi?",
      verbs: ["Yardım ediyor", "Gözetliyor", "Islık çalıyor", "Atıştırıyor"],
    },
    Yelan: {
      greeting: "Bana Yelan de. Sen benim işimi gör, ben de seninkini.",
      verbs: ["İz sürüyor", "Zar atıyor", "Takas yapıyor", "Kayboluyor"],
    },
    Yoimiya: {
      greeting: "Hoş geldin! Restoran değil. Havai fişek! Gördün mü?",
      verbs: ["Fitil hazırlıyor", "Fırlatıyor", "Sohbet ediyor", "Hikâye anlatıyor"],
    },
    "Yumemizuki Mizuki": {
      greeting: "Seni dertlendiren bir şey mi var? Anlat.",
      verbs: ["Rüya görüyor", "Yatıştırıyor", "Banyo yapıyor", "Denetim yapıyor"],
    },
    "Yun Jin": {
      greeting: "Sonunda sizinle şahsen tanışmak bir onur.",
      verbs: ["Şarkı söylüyor", "Prova ediyor", "Yönetiyor", "Boş duruyor"],
    },
    Zhongli: {
      greeting: "Yeni bir sözleşme mi? İzindeyim ama sana eşlik ederim.",
      verbs: ["Sözleşme yapıyor", "Geziniyor", "Anıyor", "Danışmanlık yapıyor"],
    },
    Zibai: {
      greeting: "Beyaz at duraksıyor. Konuş.",
      verbs: ["Ayı izliyor", "Öğretiyor", "Riyazet çekiyor", "Düşünüyor"],
    },
  },
  locale: "tr-TR",
  strings: {
    birthdayNote: (label, date, distance) => `[${label}: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) => `Eklentinin yazdığı her şey bu yanıttan itibaren ${language}.`,
    languageMustBeOneOf: (languages) => `Dil şunlardan biri olmalı: ${languages}.`,
    lorePicked: "Hikâyeye göre seçildi; seviyenin eğilimi:",
    lorePickUnanswered: (reason) => `Hikâyeye göre seçim yanıt vermedi (${reason}); doğum gününe göre seçildi.`,
    muted: "Sesli yanıtlar sessize alındı.",
    noCharacterNamed: (name) => `Listede "${name}" adında bir karakter yok.`,
    noReference: (name) =>
      `${name} için ölçülmüş bir referans yok, bu yüzden vikideki en uzun hikâye repliği okunuyor.`,
    noSession: "Karakter kullanılacak bir oturum yok: bu bir Claude Code oturumu içinden çalışır.",
    pinIgnored: (name) => `"${name}" sabitlemesi listedeki hiçbir karakteri göstermiyor ve yok sayılıyor.`,
    pinned: "Bir sonraki başlangıçtan itibaren her oturum için sabitlendi.",
    pinnedInSession:
      "Bir sonraki başlangıçtan itibaren her oturum için, bu oturum için de bu yanıttan itibaren sabitlendi.",
    pinRemoved: "Sabitleme kaldırıldı; bir sonraki oturumdan itibaren seçim yeniden karar verir.",
    pinRemovedInSession:
      "Sabitleme kaldırıldı; bir sonraki oturumdan itibaren seçim yeniden karar verir, bu oturum için de bu yanıttan itibaren.",
    replyLanguageSet: (language) => `Yanıtlar bir sonraki yanıttan itibaren ${language} yazılır.`,
    replyLanguageSilencesVoice:
      "Ses İngilizce okur ve başka bir alfabedeki yanıt için çağrılmaz, bu yüzden bu dildeki yanıtlar motor onu okuyana kadar sessiz kalır.",
    runtimeInstalled: "Çalışma ortamı kuruldu.",
    runtimeInstallFailed: "npm çalışma ortamını kuramadı; ses kapalı kalıyor.",
    runtimeInstalling: "Motorun çalışma ortamı durum dizinine kuruluyor...",
    spoke: (name, device) => `${name}, ${device} üzerindeki sentezleyiciyle konuştu; artık orada başlıyor.`,
    status: ({
      displayName,
      interfaceLanguage,
      isFromSessionRecord,
      isMuted,
      isReplyLanguageCascaded,
      isRuntimeInstalled,
      pinnedName,
      replyLanguage,
      voiceDevice,
      voiceLanguage,
      volume,
    }) =>
      [
        displayName
          ? `${displayName} olarak konuşuyor, ${isFromSessionRecord ? "bu oturumun kaydından" : "sabitlemeden"}.`
          : "Karakter yok: bu bir Claude Code oturumu içinden çalışır ya da hiçbir şey sabitlenmedi.",
        `Sabitlenen: ${pinnedName || "hiçbiri; her oturumda seçim karar verir"}.`,
        `Arayüz dili ${interfaceLanguage}; yanıtlar ${replyLanguage}, ${isReplyLanguageCascaded ? "ondan devralındı" : "ayrıca ayarlandı"}.`,
        voiceLanguage
          ? `Ses: ${voiceLanguage} dublajı, çalışma ortamı ${isRuntimeInstalled ? "kurulu" : "kurulu değil"}, ${voiceDevice ? `${voiceDevice} üzerinde konuşuyor` : "henüz konuşmadı"}.`
          : "Ses: ayarlanmadı, hiçbir yanıt sesli okunmuyor.",
        `Yanıtlar ${isMuted ? "sessizde" : `açık, ses düzeyi ${volume}`}.`,
      ]
        .filter(Boolean)
        .join("\n"),
    teardownDone:
      "Sesin çalışma ortamı, ağırlıkları, referansları ve dublajı silindi; seçim kayıtları, sabitleme ve diller kalıyor.",
    unmuted: "Sesli yanıtlar yeniden açıldı.",
    upcomingBirthdays: (list) => `Bu haftanın doğum günleri: ${list}.`,
    usage: (verbs) => `Kullanım: genshin.mjs <${verbs}> [ad]`,
    usingInSession: "Bu yanıttan itibaren yalnızca bu oturumda bu karakter olarak konuşuyor.",
    voiceLanguageAvailable: (dub) => `Bir ${dub} dublajı var; yanıtları onunla duymak için voice komutuyla kur.`,
    voiceLanguageMustBeOneOf: (dubs) => `Dublaj şunlardan biri olmalı: ${dubs}.`,
    voiceLanguageUnavailable: "Bu dilde dublaj yok, bu yüzden yanıtlar zaten ayarlı olan sesle okunmaya devam eder.",
    voiceLanguageWritten: (dub) => `${dub} dublajı kaydedildi; buradan sesi denemek için bir karakter yok.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `Ses: ${dub} dublajı${device ? `, ${device} üzerinde` : ""}, ${isMuted ? "sessizde" : `ses düzeyi ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Çalışma ortamı ${isRuntimeInstalled ? "kurulu" : "kurulu değil"}; ${dub} dublajı; motor ${device ? `${device} üzerinde konuşuyor` : "henüz konuşmadı"}; günlük ${logPath} konumunda.`,
    voiceUnset: "Ses ayarlanmadı: motoru kurup birini seçmek için bunu bir dublajla çalıştır.",
    volumeMustBeWholeNumber: (maxVolume) => `Ses düzeyi 0 ile ${maxVolume} arasında bir tam sayı olmalı.`,
    volumeSet: (volume) => `Sesli yanıtlar bir sonraki yanıttan itibaren ${volume} ses düzeyinde.`,
    warmRequestUnanswered: (status, logPath) =>
      `Sentezleyici ısınma isteğine yanıt vermedi (${status}); ${logPath} dosyasına bak.`,
    weightsOnCpu:
      "Ağırlıklar mevcut; motor CPU'da yükleniyor — GPU bulunamadı, bu yüzden bir yanıt gerçek zamandan birkaç kat yavaş sentezleniyor.",
    weightsOnDevice: (device) =>
      `Ağırlıklar mevcut; motor ${device} üzerinde yükleniyor ve orada sentezlediği şey konuşma değilse kendiliğinden CPU'ya iniyor.`,
    weightsPresent: "Ağırlıklar mevcut.",
  },
  verbs: [
    "Maceraya atılıyor",
    "Simya yapıyor",
    "Yükseltiyor",
    "Demliyor",
    "Rota çiziyor",
    "Tırmanıyor",
    "Görev alıyor",
    "Yemek yapıyor",
    "Üretiyor",
    "Atılıyor",
    "Derinlere iniyor",
    "Dalıyor",
    "Geliştiriyor",
    "Keşfediyor",
    "Kasılıyor",
    "Balık tutuyor",
    "Toplayıcılık yapıyor",
    "Dövüyor",
    "Topluyor",
    "Süzülüyor",
    "Hasat ediyor",
    "Avlanıyor",
    "Seviye atlıyor",
    "Haritalıyor",
    "Maden kazıyor",
    "Görevde",
    "Arıtıyor",
    "Dinleniyor",
    "Kavuruyor",
    "Yelken açıyor",
    "Gözcülük ediyor",
    "Koşuyor",
    "Arazi ölçüyor",
    "Yüzüyor",
    "Işınlanıyor",
    "İz sürüyor",
    "Yürüyüş yapıyor",
    "Dolaşıyor",
    "Yol buluyor",
    "Dilek tutuyor",
  ],
};

export default turkish;
