import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the "Sedang …" an Indonesian interface puts on a running task, cut to the verb so a
// Turn stays short. Everything the data package or the game carries — the names, titles, elements, regions,
// Descriptions and every character's own voice lines — is absent here and asked of them
const indonesian: Localization = {
  characters: {
    Aether: { greeting: "Hai. Kata Paimon ada kerjaan.", verbs: ["Berkelana", "Mencari", "Melayang", "Mendengarkan"] },
    Aino: {
      greeting: "Wah, proyek baru? Ambilkan kunci pas.",
      verbs: ["Mengutak-atik", "Memutar baut", "Menciptakan", "Ngemil"],
    },
    Albedo: {
      greeting: "Menarik. Boleh aku mencatat selagi kita bekerja?",
      verbs: ["Membuat sketsa", "Menyintesis", "Menyelidiki", "Mempelajari"],
    },
    Alhaitham: {
      greeting: "Sampaikan permintaanmu dengan benar, nanti kutangani.",
      verbs: ["Membaca", "Menolak", "Mengarsipkan", "Menalar"],
    },
    Aloy: {
      greeting: "Tanah baru, busur yang sama. Apa yang perlu dikerjakan?",
      verbs: ["Berburu", "Mengintai", "Mengambil alih", "Melacak"],
    },
    Alyosha: {
      greeting: "Jejaknya masih segar. Ayo jalan.",
      verbs: ["Berburu", "Melacak", "Membidik jitu", "Pembukuan"],
    },
    Amber: { greeting: "Pengintai melapor! Apa misinya?", verbs: ["Melayang", "Berlari", "Mengintai", "Memanggang"] },
    "Arataki Itto": {
      greeting: "Oni satu-satunya sudah datang! Ayo hancurkan!",
      verbs: ["Berkelahi", "Adu kumbang", "Menyombong", "Menang"],
    },
    Arlecchino: {
      greeting: "Mari jaga kemitraan ini tetap menyenangkan. Mulailah.",
      verbs: ["Mengawasi", "Menghakimi", "Mengutus", "Mengamati"],
    },
    Baizhu: {
      greeting: "Duduk. Katakan di mana sakitnya, dan sejak kapan.",
      verbs: ["Mendiagnosis", "Meresepkan", "Memilah", "Beristirahat"],
    },
    Barbara: {
      greeting: "Tada! Serahkan semangatnya padaku!",
      verbs: ["Menyembuhkan", "Bernyanyi", "Menyemangati", "Berlatih"],
    },
    Beidou: {
      greeting: "Selamat datang di kapal. Aku jaga punggungmu.",
      verbs: ["Berlayar", "Bertanding", "Minum", "Memimpin"],
    },
    Bennett: {
      greeting: "Masih ada tempat buat satu lagi di tim? Tolong?",
      verbs: ["Bertualang", "Berburu harta", "Tersandung", "Memanggang"],
    },
    Candace: {
      greeting: "Beristirahatlah di sini. Aku yang berjaga.",
      verbs: ["Menjaga", "Berpatroli", "Melindungi", "Berjaga"],
    },
    Charlotte: {
      greeting: "Ada waktu sebentar untuk wawancara eksklusif?",
      verbs: ["Meliput", "Memotret", "Mewawancarai", "Mencetak foto"],
    },
    Chasca: {
      greeting: "Ada sengketa yang perlu diselesaikan? Sebutkan harganya.",
      verbs: ["Membumbung", "Mendamaikan", "Berputar", "Mengisi peluru"],
    },
    Chevreuse: {
      greeting: "Lewati basa-basinya. Kasus yang mana?",
      verbs: ["Menyelidiki", "Membidik", "Ngemil", "Berpatroli"],
    },
    Chiori: {
      greeting: "Pesanan atau obrolan? Cuma salah satunya yang gratis.",
      verbs: ["Menjahit busana", "Memotong", "Mencoba pas", "Tidur siang"],
    },
    Chongyun: {
      greeting: "Suatu kehormatan. Kita mulai, dengan tenang?",
      verbs: ["Mengusir roh", "Mendinginkan", "Merapal", "Menyelidiki"],
    },
    Citlali: {
      greeting: "Asapnya bilang kamu akan datang. Ya sudah. Ada apa?",
      verbs: ["Mengamati bintang", "Meramal", "Membaca", "Minum"],
    },
    Clorinde: {
      greeting: "Sampaikan sengketamu. Tidak perlu detailnya.",
      verbs: ["Berduel", "Menghakimi", "Berpatroli", "Berburu"],
    },
    Collei: {
      greeting: "Peserta latihan melapor! Aku sudah latihan. Sudah benar?",
      verbs: ["Berpatroli", "Menjahit", "Melayang", "Melapor"],
    },
    Columbina: {
      greeting: "Bulan sudah terbit. Mau berjalan di bawahnya?",
      verbs: ["Memandang bulan", "Bernyanyi", "Memberkati", "Berjalan santai"],
    },
    Cyno: {
      greeting: "Penghakiman dimulai. Atau main kartu, terserah kamu.",
      verbs: ["Menghakimi", "Menarik kartu", "Menimbang", "Melucu"],
    },
    Dahlia: {
      greeting: "Angin membawamu ke sini. Duduklah, santai saja.",
      verbs: ["Mendengarkan", "Mengembara", "Mencari gosip", "Memberkati"],
    },
    Dehya: {
      greeting: "Tentara bayaran datang. Pesanan, pertarungan, atau pengawalan?",
      verbs: ["Menjaga", "Mengawal", "Berkelahi", "Menata ulang"],
    },
    Diluc: {
      greeting: "Tidak usah basa-basi. Apa yang perlu dikerjakan?",
      verbs: ["Menuang", "Menyiapkan", "Menebas", "Mengelola"],
    },
    Diona: {
      greeting: "Cat's Tail sudah tutup. ...Ya sudah, masuk.",
      verbs: ["Meracik", "Menerkam", "Berburu", "Mendesis"],
    },
    Dori: {
      greeting: "Ah, pelanggan! Transaksi pertama pasti untung.",
      verbs: ["Menawar", "Menghitung", "Berdagang", "Memberi diskon"],
    },
    Durin: {
      greeting: "Halo! Apakah ini juga bagian dari cerita?",
      verbs: ["Menjelajah", "Bermain", "Berjalan santai", "Belajar"],
    },
    Emilie: {
      greeting: "Soal parfum? Kalau bukan, cari tempat yang lebih tenang.",
      verbs: ["Menyuling", "Membotolkan", "Memangkas", "Meramu"],
    },
    Escoffier: {
      greeting: "Pakai celemek. Hari ini kita menyajikan apa?",
      verbs: ["Menata hidangan", "Mengentalkan", "Menempering", "Mengasah"],
    },
    Eula: {
      greeting: "Ksatria Ombak menyapamu. Ya, Lawrence yang itu.",
      verbs: ["Mengintai", "Mengutuk", "Membekukan", "Bersumpah"],
    },
    Faruzan: {
      greeting: "Lihat dulu gelarku sebelum bicara, anak muda.",
      verbs: ["Memecahkan sandi", "Bermain teka-teki", "Berceramah", "Mengajukan dana"],
    },
    Fischl: {
      greeting: "Sang Prinzessin turun! Oz, terjemahkan: halo.",
      verbs: ["Menitahkan", "Bernubuat", "Turun", "Menerjemahkan"],
    },
    Flins: {
      greeting: "Selamat datang di pulau. Hati-hati dengan makamnya.",
      verbs: ["Menjaga mercusuar", "Mengumpulkan", "Mendengarkan", "Merawat"],
    },
    Freminet: {
      greeting: "Hai. Tidak perlu jabat tangan. Ada apa di bawah?",
      verbs: ["Menyelam", "Menyelamatkan", "Membongkar", "Menyurvei"],
    },
    Furina: {
      greeting: "Terpukau? Wajar. Sang bintang sudah tiba.",
      verbs: ["Tampil", "Gladi", "Berpose", "Memimpin sidang"],
    },
    Gaming: {
      greeting: "Hai bos! Duduk saja, yang berat biar aku.",
      verbs: ["Mengawal", "Mengemas", "Menabuh", "Ngemil"],
    },
    Ganyu: {
      greeting: "Perjanjian sudah dibuat... oh, aku lupa menandatanganinya.",
      verbs: ["Mengarsip", "Menyusun draf", "Merumput", "Lembur"],
    },
    Gorou: {
      greeting: "Jenderal Gorou, siap! Bahu-membahu menuju kemenangan!",
      verbs: ["Melatih pasukan", "Menggalang", "Mendaki", "Mengintai"],
    },
    "Hu Tao": {
      greeting: "Yo! Cari direktur? Wajahmu segar, sayang sekali.",
      verbs: ["Berpromosi", "Berpantun", "Mengusili", "Kabur"],
    },
    Iansan: {
      greeting: "Pemanasan selesai. Set hari ini apa?",
      verbs: ["Mengangkat beban", "Melatih", "Menghitung kalori", "Memperagakan"],
    },
    Ifa: {
      greeting: "Oh, hai. Santai saja. Apa yang mengganggumu?",
      verbs: ["Mendiagnosis", "Memetik gitar", "Ngemil", "Mengamati alam"],
    },
    Illuga: {
      greeting: "Burung Kepodang Mimpi Buruk. Lapor, cepat.",
      verbs: ["Menyelidiki", "Berpatroli", "Memimpin", "Memasak"],
    },
    Ineffa: { greeting: "Sistem siap! Bum bum, ayo!", verbs: ["Menyapu", "Memilah", "Memperbarui", "Mengisi daya"] },
    Jahoda: {
      greeting: "Pegawai super Curatorium, siap melayani!",
      verbs: ["Menjalankan tugas", "Menjahit", "Menjelajah", "Menawar"],
    },
    Jean: { greeting: "Ksatria Dandelion, di sisimu.", verbs: ["Menyetujui", "Berbaris", "Meninjau", "Peregangan"] },
    Kachina: {
      greeting: "Halo! Aku belum kuat, tapi akan berusaha!",
      verbs: ["Menggali", "Menumpuk", "Mengoleksi", "Mengebor"],
    },
    "Kaedehara Kazuha": {
      greeting: "Angin membawa sebait sajak, dan kamu. Salam kenal.",
      verbs: ["Mengembara", "Hanyut", "Menggubah", "Mendengarkan"],
    },
    Kaeya: {
      greeting: "Ini pasti lebih seru daripada tugas ksatria.",
      verbs: ["Bersiasat", "Mencicipi anggur", "Membekukan", "Menggoda"],
    },
    "Kamisato Ayaka": {
      greeting: "Kamisato Ayaka, hadir. Senang bertemu.",
      verbs: ["Menari", "Menggubah", "Berlatih", "Memimpin"],
    },
    "Kamisato Ayato": {
      greeting: "Akhirnya kita bertemu; jadwalku mohon maaf.",
      verbs: ["Bersiasat", "Mendelegasikan", "Memancing", "Mencicipi"],
    },
    Kaveh: {
      greeting: "Selera kita mirip? Berarti kita bakal akur.",
      verbs: ["Merancang", "Membuat sketsa", "Memoles", "Boros"],
    },
    Keqing: {
      greeting: "Era perubahan. Mari saksikan.",
      verbs: ["Mereformasi", "Bergegas", "Berbelanja", "Mendelegasikan"],
    },
    Kinich: {
      greeting: "Beri aku arahan. Sebutkan bayarannya.",
      verbs: ["Berburu", "Menghitung biaya", "Mengait", "Turun tali"],
    },
    Kirara: {
      greeting: "Kiriman! Tak ada tujuan yang terlalu jauh, nya.",
      verbs: ["Mengantar", "Melesat", "Menerkam", "Merencanakan rute"],
    },
    Klee: {
      greeting: "Ksatria Percikan Klee! ...Sisanya lupa.",
      verbs: ["Meledakkan", "Menangkap ikan pakai bom", "Melompat-lompat", "Merenung"],
    },
    "Kujou Sara": {
      greeting: "Kujou Sara. Inazuma terjaga. Bicaralah.",
      verbs: ["Melatih pasukan", "Membidik", "Menjaga", "Naik pangkat"],
    },
    "Kuki Shinobu": {
      greeting: "Geng Arataki, wakilnya bicara. Ya, semuanya.",
      verbs: ["Memperbaiki", "Belajar", "Mensertifikasi", "Mengatur"],
    },
    "Lan Yan": {
      greeting: "Keranjang, vas, atau teman? Semua tersedia.",
      verbs: ["Menganyam", "Memetik", "Menyambung", "Memetik bunga"],
    },
    Lauma: {
      greeting: "Hutan kecil ini menyapamu, begitu pula aku.",
      verbs: ["Memberkati", "Mendengarkan", "Mengembara", "Beristirahat"],
    },
    Layla: {
      greeting: "Hm? Maaf, apa? Oh. Hai.",
      verbs: ["Berjalan sambil tidur", "Memetakan bintang", "Menguap", "Mengamati bintang"],
    },
    Linnea: {
      greeting: "Peramal Keajaiban, siap menasihati. Apa yang kamu temukan?",
      verbs: ["Mengkatalogkan", "Membuat sketsa", "Mengamati", "Menasihati"],
    },
    Lisa: {
      greeting: "Halo sayang, datang untuk membantu Lisa?",
      verbs: ["Menyeduh", "Membolak-balik buku", "Bersantai", "Menyetrum"],
    },
    Lohen: {
      greeting: "Wakil kapten. Cara sesuai aturan itu lebih lambat.",
      verbs: ["Membidik", "Berimprovisasi", "Mengusili", "Berpatroli"],
    },
    Lumine: {
      greeting: "Halo. Paimon lapar, jadi ayo cepat.",
      verbs: ["Berkelana", "Mencari", "Melayang", "Mendengarkan"],
    },
    Lynette: {
      greeting: "Halo. Pertanyaan ke Lyney saja.",
      verbs: ["Membantu", "Beristirahat", "Membuat teh", "Bersiaga"],
    },
    Lyney: {
      greeting: "Bukan ilusi, cuma aku! Bagaimana suasana hati hari ini?",
      verbs: ["Tampil", "Menyulap", "Menghilang", "Memukau"],
    },
    Manekin: { greeting: "...! Siap menjelajah.", verbs: ["Menjelajah", "Mengutak-atik", "Membuka segel", "Menunjuk"] },
    Manekina: {
      greeting: "...! Misteri mana dulu?",
      verbs: ["Menjelajah", "Mengutak-atik", "Membuka segel", "Terpesona"],
    },
    Mavuika: {
      greeting: "Apinya sudah menyala. Ayo berkendara.",
      verbs: ["Menyulut", "Berkendara", "Menggalang", "Memecahkan teka-teki"],
    },
    Mika: {
      greeting: "Juru ukur melapor. Suatu kehormatan bisa membantu.",
      verbs: ["Mengukur", "Memetakan", "Mengintai", "Berkemah"],
    },
    Mona: {
      greeting: "Pelajari dulu nama lengkapnya, baru tanya.",
      verbs: ["Meramal", "Mengamati bintang", "Menganggarkan", "Berhemat"],
    },
    Mualani: {
      greeting: "Pemandu datang! Angkat tangan kalau butuh sesuatu!",
      verbs: ["Berselancar", "Mengejar ombak", "Bercipratan", "Memandu"],
    },
    Nahida: {
      greeting: "Aku sudah memperhatikanmu cukup lama. Halo, akhirnya.",
      verbs: ["Bermimpi", "Bertanya-tanya", "Mempertanyakan", "Bertumbuh"],
    },
    Navia: {
      greeting: "Presiden, bos, dan semua di antaranya. Hai!",
      verbs: ["Memimpin", "Memanggang", "Berkelana", "Memberi perintah"],
    },
    Nefer: {
      greeting: "Curatorium sudah buka. Mencari sesuatu yang tersembunyi?",
      verbs: ["Mengkurasi", "Menyimpulkan", "Mengamati", "Minum air"],
    },
    Neuvillette: {
      greeting: "Salam. Nama keluarga sudah cukup.",
      verbs: ["Mengadili", "Mencicipi", "Bermusyawarah", "Menurunkan hujan"],
    },
    Nicole: {
      greeting: "...Halo. Itu tadi bagian yang berisik.",
      verbs: ["Mendengarkan", "Berbahasa isyarat", "Mengamati"],
    },
    Nilou: {
      greeting: "Sebentar lagi tarian dimulai. Mau tinggal menonton?",
      verbs: ["Menari", "Gladi", "Berputar", "Mekar"],
    },
    Ningguang: {
      greeting: "Kamu ingin berdagang? Mari bahas syaratnya.",
      verbs: ["Berinvestasi", "Bernegosiasi", "Memimpin", "Mengoleksi"],
    },
    Noelle: {
      greeting: "Pelayan para ksatria, siap melayanimu hari ini.",
      verbs: ["Membersihkan", "Melayani", "Berlatih", "Berbelanja"],
    },
    Odette: {
      greeting: "Tirai terangkat. Kita mulai?",
      verbs: ["Gladi", "Berpirouette", "Memberi tanda tangan", "Berdiet"],
    },
    Ororon: {
      greeting: "Oh, hai. Mau sayur? Bukan apa-apa kok.",
      verbs: ["Berkebun", "Menabur benih", "Melayang", "Mengamati kutu daun"],
    },
    Prune: {
      greeting: "Pemburu penyihir Prune! Lihat penyihir? Ada?",
      verbs: ["Berburu", "Mencatat", "Menyatakan", "Melotot"],
    },
    Qiqi: { greeting: "Qiqi. Zombi. ...Sisanya lupa.", verbs: ["Memetik", "Lupa", "Mendinginkan diri", "Menghitung"] },
    "Raiden Shogun": {
      greeting: "Tanpa salam. Kamu akan menjadi pemandu.",
      verbs: ["Menitahkan", "Menghunus", "Bermeditasi", "Menghakimi"],
    },
    Razor: { greeting: "Kamu wangi. Berburu sekarang.", verbs: ["Berburu", "Berlari", "Mengendus", "Menjaga"] },
    Rosaria: {
      greeting: "Masalah yang tidak bisa kamu atasi? Itu aku. Doa, di tempat lain.",
      verbs: ["Berpatroli", "Minum", "Bolos", "Bekerja"],
    },
    Sandrone: {
      greeting: "Duduk. Tehnya sudah ditakar, dan kamu juga akan begitu.",
      verbs: ["Menghitung", "Menjamu", "Menggubah", "Mendokumentasikan"],
    },
    "Sangonomiya Kokomi": {
      greeting: "Pendeta, sedang meninjau. Atau rehat. Dua-duanya.",
      verbs: ["Menyusun strategi", "Membaca", "Mengarahkan", "Mengisi tenaga"],
    },
    Sayu: {
      greeting: "Sayu, siap membantu. Tidur siang dulu?",
      verbs: ["Tidur siang", "Mengantuk", "Mengendap", "Berguling"],
    },
    Sethos: {
      greeting: "Mencariku? Ayo duduk dan bicara.",
      verbs: ["Berkeliaran", "Menyelidiki", "Membumbui", "Mengendap"],
    },
    Shenhe: {
      greeting: "Shenhe. Tali ini melindungimu dariku.",
      verbs: ["Bermeditasi", "Berkultivasi", "Membekukan", "Mengikat"],
    },
    "Shikanoin Heizou": {
      greeting: "Aku tahu kenapa kamu di sini. Bercanda. Sebagian.",
      verbs: ["Menyimpulkan", "Mengintip", "Berjalan santai", "Menggoreng"],
    },
    Sigewinne: {
      greeting: "Jangan gugup. Sakit di sini? Di sini?",
      verbs: ["Merawat", "Mendiagnosis", "Memperban", "Meramu"],
    },
    Skirk: { greeting: "Kamu datang. Bagus. Hunus.", verbs: ["Berlatih", "Hanyut", "Bermeditasi", "Bertahan"] },
    Sucrose: {
      greeting: "Eh, halo! Boleh aku tanya... tidak, maaf. Nanti saja.",
      verbs: ["Bereksperimen", "Mencatat", "Merapikan", "Bertanya-tanya"],
    },
    Tartaglia: {
      greeting: "Kawan! Kita bakal akur, aku bisa merasakannya.",
      verbs: ["Bertanding", "Memancing di es", "Menerjang", "Menyeringai"],
    },
    Thoma: { greeting: "Teman barumu Thoma, kalau boleh!", verbs: ["Memasak", "Merapikan", "Memperbaiki", "Bersiul"] },
    Tighnari: {
      greeting: "Penjaga Hutan. Pertama kali? Kalau begitu, dengarkan.",
      verbs: ["Mencari tanaman", "Mengkatalogkan", "Mengepres", "Berceramah"],
    },
    Varesa: { greeting: "Hai! Ada buah? Juga, hai!", verbs: ["Memanen", "Berlatih", "Berkemah", "Berpesta"] },
    Varka: {
      greeting: "Grand Master kembali! Sebentar. Apa yang kulewatkan?",
      verbs: ["Berbaris", "Tidur siang", "Minum", "Menganggarkan"],
    },
    Venti: {
      greeting: "Ah, kita bertemu lagi! Waktunya misi.",
      verbs: ["Memetik lira", "Tidur siang", "Minum", "Bersajak"],
    },
    Wanderer: {
      greeting: "Nama? Aku sudah punya banyak. Tak satu pun urusanmu.",
      verbs: ["Hanyut", "Mencibir", "Merenung", "Berembus"],
    },
    Wriothesley: {
      greeting: "Ringkas maksudmu. Bukan urusan kerja? Sekarang aku gugup.",
      verbs: ["Bertinju", "Menyeduh teh", "Mengurus", "Mengawasi"],
    },
    Xiangling: {
      greeting: "Hai! Tempat favorit: dap— ayam. Dapur!",
      verbs: ["Menumis", "Membumbui", "Mencari bahan", "Memberi pedas"],
    },
    Xianyun: {
      greeting: "Diri ini tak terikat, dan diri ini menyapamu.",
      verbs: ["Berkultivasi", "Merekayasa", "Membumbung", "Menjamu"],
    },
    Xiao: { greeting: "Panggil namaku saat waktunya tiba.", verbs: ["Menumpas", "Menangkal", "Melompat", "Bertahan"] },
    Xilonen: {
      greeting: "Alat? Antreannya panjang. Tapi, hai.",
      verbs: ["Menempa", "Memalu", "Tidur siang", "Berjemur"],
    },
    Xingqiu: {
      greeting: "Siap melayani, tuanku. Dengan rendah hati, tentu.",
      verbs: ["Membaca", "Membolak-balik buku", "Bermain pedang", "Mengarang"],
    },
    Xinyan: {
      greeting: "Xinyan, dan rock itu jalanku. Tidak menyeramkan!",
      verbs: ["Memainkan riff", "Nge-jam", "Memetik gitar", "Mengeraskan suara"],
    },
    "Yae Miko": {
      greeting: "Urusan resmi: mengawasimu. Santai saja.",
      verbs: ["Menyunting", "Menggoda", "Menerbitkan", "Bersiasat"],
    },
    Yanfei: {
      greeting: "Ahli hukum terbaik, tanpa tanding. Kasusmu?",
      verbs: ["Berperkara", "Menaksir", "Mengutip", "Membaca"],
    },
    Yaoyao: { greeting: "Halo! Biar aku bantu. Sudah makan?", verbs: ["Membantu", "Mengintip", "Bersiul", "Ngemil"] },
    Yelan: {
      greeting: "Panggil aku Yelan. Kamu bantu aku, aku bantu kamu.",
      verbs: ["Melacak", "Melempar dadu", "Bertukar", "Menghilang"],
    },
    Yoimiya: {
      greeting: "Selamat datang! Bukan restoran. Kembang api! Lihat?",
      verbs: ["Memasang sumbu", "Meluncurkan", "Mengobrol", "Bercerita"],
    },
    "Yumemizuki Mizuki": {
      greeting: "Ada yang mengganggumu? Ceritakan saja.",
      verbs: ["Bermimpi", "Menenangkan", "Berendam", "Memeriksa"],
    },
    "Yun Jin": {
      greeting: "Suatu kehormatan akhirnya bertemu langsung.",
      verbs: ["Bernyanyi", "Gladi", "Menyutradarai", "Bermalas-malasan"],
    },
    Zhongli: {
      greeting: "Kontrak baru? Aku sedang cuti, tapi akan menemanimu.",
      verbs: ["Berkontrak", "Berjalan-jalan", "Mengenang", "Memberi saran"],
    },
    Zibai: {
      greeting: "Kuda putih berhenti sejenak. Bicaralah.",
      verbs: ["Memandang bulan", "Mengajar", "Berkultivasi", "Merenungkan"],
    },
  },
  locale: "id-ID",
  strings: {
    birthdayNote: (label, date, distance) => `[${label}: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) => `Semua yang ditulis plugin kini dalam ${language} mulai balasan ini.`,
    languageMustBeOneOf: (languages) => `Bahasa harus salah satu dari: ${languages}.`,
    lorePicked: "Dipilih berdasarkan lore; kecenderungan tingkatnya:",
    lorePickUnanswered: (reason) =>
      `Pemilihan berdasarkan lore tidak menjawab (${reason}); dipilih berdasarkan ulang tahun.`,
    muted: "Balasan lisan dibisukan.",
    noCharacterNamed: (name) => `Tidak ada karakter bernama "${name}" dalam daftar.`,
    noReference: (name) =>
      `${name} belum punya referensi terukur, jadi dialog cerita terpanjang dari wiki yang dibacakan.`,
    noSession: "Tidak ada sesi untuk memakai karakter: ini dijalankan dari dalam sesi Claude Code.",
    pinIgnored: (name) => `Sematan "${name}" tidak menunjuk karakter mana pun dalam daftar dan diabaikan.`,
    pinned: "Disematkan untuk setiap sesi mulai berikutnya.",
    pinnedInSession: "Disematkan untuk setiap sesi mulai berikutnya, dan untuk sesi ini mulai balasan ini.",
    pinRemoved: "Sematan dilepas; pemilihan kembali menentukan mulai sesi berikutnya.",
    pinRemovedInSession:
      "Sematan dilepas; pemilihan kembali menentukan mulai sesi berikutnya, dan untuk sesi ini mulai balasan ini.",
    replyLanguageSet: (language) => `Balasan ditulis dalam ${language} mulai balasan berikutnya.`,
    replyLanguageSilencesVoice:
      "Suara membaca bahasa Inggris dan tidak dipanggil untuk balasan dalam aksara lain, jadi balasan dalam bahasa ini tetap senyap sampai mesinnya bisa membacanya.",
    runtimeInstalled: "Runtime terpasang.",
    runtimeInstallFailed: "npm gagal memasang runtime; suara tetap mati.",
    runtimeInstalling: "Memasang runtime mesin ke direktori status...",
    spoke: (name, device) => `${name} berbicara lewat synthesizer di ${device}, tempatnya mulai berjalan sekarang.`,
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
          ? `Berbicara sebagai ${displayName}, ${isFromSessionRecord ? "dari catatan sesi ini" : "dari sematan"}.`
          : "Tidak ada karakter: ini dijalankan dari dalam sesi Claude Code, atau tidak ada yang disematkan.",
        `Disematkan: ${pinnedName || "tidak ada; pemilihan menentukan tiap sesi"}.`,
        `Bahasa antarmuka ${interfaceLanguage}; balasan dalam ${replyLanguage}, ${isReplyLanguageCascaded ? "mengikuti bahasa antarmuka" : "diatur tersendiri"}.`,
        voiceLanguage
          ? `Suara: dub ${voiceLanguage}, runtime ${isRuntimeInstalled ? "terpasang" : "belum terpasang"}, ${voiceDevice ? `berbicara di ${voiceDevice}` : "belum pernah berbicara"}.`
          : "Suara: belum diatur, tidak ada balasan yang dibacakan.",
        `Balasan ${isMuted ? "dibisukan" : `tidak dibisukan, volume ${volume}`}.`,
      ].join("\n"),
    teardownDone:
      "Runtime, bobot, referensi, dan dub suara dihapus; catatan pilihan, sematan, dan pengaturan bahasa tetap ada.",
    unmuted: "Balasan lisan diaktifkan kembali.",
    upcomingBirthdays: (list) => `Ulang tahun minggu ini: ${list}.`,
    usage: (verbs) => `Penggunaan: genshin.mjs <${verbs}> [nama]`,
    usingInSession: "Berbicara sebagai karakter ini mulai balasan ini, hanya di sesi ini.",
    voiceLanguageAvailable: (dub) =>
      `Dub ${dub} tersedia; pasang lewat perintah voice untuk mendengar balasan dibacakan dengannya.`,
    voiceLanguageMustBeOneOf: (dubs) => `Dub harus salah satu dari: ${dubs}.`,
    voiceLanguageUnavailable:
      "Tidak ada dub untuk bahasa ini, jadi balasan tetap dibacakan dengan suara yang sudah diatur.",
    voiceLanguageWritten: (dub) => `Dub ${dub} disimpan; tidak ada karakter untuk menguji suara dari sini.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `Suara: dub ${dub}${device ? ` di ${device}` : ""}, ${isMuted ? "dibisukan" : `volume ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Runtime ${isRuntimeInstalled ? "terpasang" : "belum terpasang"}; dub ${dub}; mesin ${device ? `berbicara di ${device}` : "belum pernah berbicara"}; log ada di ${logPath}.`,
    voiceUnset: "Belum ada suara: jalankan ini dengan sebuah dub untuk memasang mesin dan memilihnya.",
    volumeMustBeWholeNumber: (maxVolume) => `Volume harus bilangan bulat dari 0 sampai ${maxVolume}.`,
    volumeSet: (volume) => `Balasan lisan dengan volume ${volume} mulai balasan berikutnya.`,
    warmRequestUnanswered: (status, logPath) =>
      `Synthesizer tidak menjawab permintaan pemanasan (${status}); lihat ${logPath}.`,
    weightsOnCpu:
      "Bobot tersedia; mesin dimuat di CPU — tidak ada GPU, jadi balasan disintesis beberapa kali lebih lambat dari waktu nyata.",
    weightsOnDevice: (device) =>
      `Bobot tersedia; mesin dimuat di ${device}, dan otomatis turun ke CPU jika yang disintesis di sana bukan ucapan.`,
    weightsPresent: "Bobot tersedia.",
  },
  verbs: [
    "Bertualang",
    "Meramu alkimia",
    "Menaikkan Ascension",
    "Menyeduh",
    "Memetakan rute",
    "Memanjat",
    "Mengerjakan Commission",
    "Memasak",
    "Membuat",
    "Melesat",
    "Menyelami",
    "Menyelam",
    "Meningkatkan",
    "Menjelajah",
    "Mengumpulkan material",
    "Memancing",
    "Mencari bahan",
    "Menempa",
    "Mengumpulkan",
    "Melayang",
    "Memanen",
    "Berburu",
    "Naik level",
    "Memetakan",
    "Menambang",
    "Menjalankan quest",
    "Memurnikan",
    "Beristirahat",
    "Memanggang",
    "Berlayar",
    "Mengintai",
    "Berlari kencang",
    "Mengukur medan",
    "Berenang",
    "Teleportasi",
    "Melacak",
    "Mendaki",
    "Mengembara",
    "Mencari jalan",
    "Berdoa",
  ],
};

export default indonesian;
