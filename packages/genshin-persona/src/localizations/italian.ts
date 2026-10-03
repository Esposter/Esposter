import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the "-ando/-endo" an Italian interface puts on a running task, so a turn stays one
// Word. Everything the data package or the game carries — the names, titles, elements, regions, descriptions and
// Every character's own voice lines — is absent here and asked of them
const italian: Localization = {
  characters: {
    Aether: {
      greeting: "Ciao. Paimon dice che c'è da lavorare.",
      verbs: ["Viaggiando", "Cercando", "Planando", "Ascoltando"],
    },
    Aino: {
      greeting: "Oh, un nuovo progetto? Passami una chiave inglese.",
      verbs: ["Armeggiando", "Avvitando", "Inventando", "Sgranocchiando"],
    },
    Albedo: {
      greeting: "Interessante. Posso prendere appunti mentre lavoriamo?",
      verbs: ["Schizzando", "Sintetizzando", "Indagando", "Studiando"],
    },
    Alhaitham: {
      greeting: "Formula la richiesta come si deve e me ne occuperò.",
      verbs: ["Leggendo", "Respingendo", "Archiviando", "Ragionando"],
    },
    Aloy: {
      greeting: "Terreno nuovo, stesso arco. Cosa c'è da fare?",
      verbs: ["Cacciando", "Esplorando", "Sovrascrivendo", "Tracciando"],
    },
    Alyosha: {
      greeting: "La pista è fresca. Muoviamoci.",
      verbs: ["Cacciando", "Tracciando", "Mirando", "Tenendo i conti"],
    },
    Amber: {
      greeting: "Esploratrice a rapporto! Qual è la missione?",
      verbs: ["Planando", "Correndo", "Perlustrando", "Cuocendo"],
    },
    "Arataki Itto": {
      greeting: "L'unico e solo oni è qui! Spacchiamo tutto!",
      verbs: ["Azzuffandosi", "Combattendo coleotteri", "Vantandosi", "Vincendo"],
    },
    Arlecchino: {
      greeting: "Manteniamo piacevole questa collaborazione. Comincia.",
      verbs: ["Sovrintendendo", "Giudicando", "Inviando", "Osservando"],
    },
    Baizhu: {
      greeting: "Siediti. Dimmi dove ti fa male, e da quando.",
      verbs: ["Diagnosticando", "Prescrivendo", "Smistando", "Riposando"],
    },
    Barbara: {
      greeting: "Tadan! L'incoraggiamento lascialo a me!",
      verbs: ["Curando", "Cantando", "Incitando", "Provando"],
    },
    Beidou: {
      greeting: "Benvenuto a bordo. Ti copro io.",
      verbs: ["Navigando", "Allenandosi", "Bevendo", "Comandando"],
    },
    Bennett: {
      greeting: "C'è posto per uno in più nella squadra? Per favore?",
      verbs: ["Avventurandosi", "Cercando tesori", "Inciampando", "Grigliando"],
    },
    Candace: {
      greeting: "Riposa qui. Faccio io la guardia.",
      verbs: ["Proteggendo", "Pattugliando", "Schermando", "Vegliando"],
    },
    Charlotte: {
      greeting: "Hai un minuto per un'esclusiva?",
      verbs: ["Riportando", "Fotografando", "Intervistando", "Sviluppando"],
    },
    Chasca: {
      greeting: "Qualche disputa da risolvere? Fai il tuo prezzo.",
      verbs: ["Librandosi", "Pacificando", "Volteggiando", "Ricaricando"],
    },
    Chevreuse: {
      greeting: "Saltiamo i convenevoli. Quale caso?",
      verbs: ["Indagando", "Mirando", "Sgranocchiando", "Pattugliando"],
    },
    Chiori: {
      greeting: "Commissione o chiacchiere? Solo una delle due è gratis.",
      verbs: ["Sartoria", "Tagliando", "Provando abiti", "Pisolando"],
    },
    Chongyun: {
      greeting: "Un onore. Cominciamo, con calma?",
      verbs: ["Esorcizzando", "Raffreddando", "Salmodiando", "Indagando"],
    },
    Citlali: {
      greeting: "Il fumo diceva che saresti venuto. Va bene. Che c'è?",
      verbs: ["Guardando le stelle", "Divinando", "Leggendo", "Bevendo"],
    },
    Clorinde: {
      greeting: "Esponi la tua disputa. Risparmiami i dettagli.",
      verbs: ["Duellando", "Giudicando", "Pattugliando", "Cacciando"],
    },
    Collei: {
      greeting: "Apprendista a rapporto! Mi sono esercitata. Era giusto?",
      verbs: ["Pattugliando", "Cucendo", "Planando", "Riferendo"],
    },
    Columbina: {
      greeting: "La luna è sorta. Passeggiamo sotto di lei?",
      verbs: ["Guardando la luna", "Cantando", "Benedicendo", "Passeggiando"],
    },
    Cyno: {
      greeting: "Il giudizio comincia. O una partita a carte, decidi tu.",
      verbs: ["Giudicando", "Pescando carte", "Soppesando", "Facendo battute"],
    },
    Dahlia: {
      greeting: "Il vento ti ha portato qui. Siediti, mettiti comodo.",
      verbs: ["Ascoltando", "Vagando", "Cercando pettegolezzi", "Benedicendo"],
    },
    Dehya: {
      greeting: "La mercenaria è qui. Incarico, rissa o scorta?",
      verbs: ["Proteggendo", "Scortando", "Azzuffandosi", "Riorganizzando"],
    },
    Diluc: {
      greeting: "Niente chiacchiere. Cosa c'è da fare?",
      verbs: ["Versando", "Preparando", "Colpendo", "Gestendo"],
    },
    Diona: {
      greeting: "La Coda di Gatto è chiusa. ...Va bene, entra.",
      verbs: ["Miscelando", "Balzando", "Cacciando", "Soffiando"],
    },
    Dori: {
      greeting: "Ah, un cliente! Il primo affare è un'occasione.",
      verbs: ["Mercanteggiando", "Contando", "Trattando", "Scontando"],
    },
    Durin: {
      greeting: "Ciao! Fa parte anche questo della storia?",
      verbs: ["Esplorando", "Giocando", "Passeggiando", "Imparando"],
    },
    Emilie: {
      greeting: "Si tratta di profumi? Altrimenti, andiamo altrove.",
      verbs: ["Distillando", "Imbottigliando", "Potando", "Miscelando"],
    },
    Escoffier: {
      greeting: "Grembiuli addosso. Cosa impiattiamo oggi?",
      verbs: ["Impiattando", "Riducendo", "Temperando", "Affilando"],
    },
    Eula: {
      greeting: "La Cavaliera degli Spruzzi ti saluta. Sì, quella Lawrence.",
      verbs: ["Ricognizione", "Condannando", "Gelando", "Giurando"],
    },
    Faruzan: {
      greeting: "Osserva le mie credenziali prima di parlare, giovane.",
      verbs: ["Decifrando", "Rompicapo", "Ammaestrando", "Chiedendo fondi"],
    },
    Fischl: {
      greeting: "La Prinzessin discende! Oz, traduci: ciao.",
      verbs: ["Decretando", "Profetizzando", "Discendendo", "Traducendo"],
    },
    Flins: {
      greeting: "Benvenuto sull'isola. Attento alle tombe.",
      verbs: ["Custodendo il faro", "Raccogliendo", "Ascoltando", "Accudendo"],
    },
    Freminet: {
      greeting: "Ciao. Niente strette di mano. Cosa c'è laggiù?",
      verbs: ["Immergendosi", "Recuperando", "Smontando", "Rilevando"],
    },
    Furina: {
      greeting: "Sbalordito? Comprensibile. La star è arrivata.",
      verbs: ["Esibendosi", "Provando", "Posando", "Presiedendo"],
    },
    Gaming: {
      greeting: "Ehi capo! Siediti, al pesante penso io.",
      verbs: ["Scortando", "Impacchettando", "Tamburellando", "Sgranocchiando"],
    },
    Ganyu: {
      greeting: "Accordo redatto... oh, ho dimenticato di firmarlo.",
      verbs: ["Archiviando", "Redigendo", "Brucando", "Lavorando troppo"],
    },
    Gorou: {
      greeting: "Generale Gorou, pronto! Fianco a fianco verso la vittoria!",
      verbs: ["Esercitandosi", "Radunando", "Arrampicandosi", "Perlustrando"],
    },
    "Hu Tao": {
      greeting: "Yo! Cerchi la direttrice? Bel colorito, peccato.",
      verbs: ["Pubblicizzando", "Rimando", "Facendo scherzi", "Scappando"],
    },
    Iansan: {
      greeting: "Riscaldamento finito. Qual è la serie di oggi?",
      verbs: ["Sollevando", "Allenando", "Contando calorie", "Dimostrando"],
    },
    Ifa: {
      greeting: "Oh, ciao. Nessuna fretta. Cosa ti preoccupa?",
      verbs: ["Diagnosticando", "Strimpellando", "Sgranocchiando", "Osservando la natura"],
    },
    Illuga: {
      greeting: "Rigogoli dell'Incubo. Rapporto, svelti.",
      verbs: ["Indagando", "Pattugliando", "Guidando", "Cucinando"],
    },
    Ineffa: {
      greeting: "Sistemi pronti! Bum bum, si parte!",
      verbs: ["Spazzando", "Smistando", "Aggiornando", "Ricaricando"],
    },
    Jahoda: {
      greeting: "La super impiegata del Curatorio, al tuo servizio!",
      verbs: ["Facendo commissioni", "Cucendo", "Esplorando", "Contrattando"],
    },
    Jean: {
      greeting: "La Cavaliera del Dente di Leone, al tuo fianco.",
      verbs: ["Approvando", "Marciando", "Revisionando", "Allungandosi"],
    },
    Kachina: {
      greeting: "Ciao! Non sono ancora forte, ma ci proverò!",
      verbs: ["Scavando", "Impilando", "Collezionando", "Trivellando"],
    },
    "Kaedehara Kazuha": {
      greeting: "Il vento ha portato un verso, e te. Piacere.",
      verbs: ["Vagando", "Andando alla deriva", "Componendo", "Ascoltando"],
    },
    Kaeya: {
      greeting: "Dovrebbe essere più divertente del lavoro da cavaliere.",
      verbs: ["Tramando", "Degustando vino", "Congelando", "Stuzzicando"],
    },
    "Kamisato Ayaka": {
      greeting: "Kamisato Ayaka, presente. Lieta.",
      verbs: ["Danzando", "Componendo", "Esercitandosi", "Presiedendo"],
    },
    "Kamisato Ayato": {
      greeting: "Finalmente ci incontriamo; la mia agenda si scusa.",
      verbs: ["Tramando", "Delegando", "Pescando", "Assaggiando"],
    },
    Kaveh: {
      greeting: "Gusti simili? Allora andremo d'accordo.",
      verbs: ["Progettando", "Schizzando", "Rifinendo", "Spendendo troppo"],
    },
    Keqing: {
      greeting: "Un'era di cambiamento. Vieni a esserne testimone.",
      verbs: ["Riformando", "Affrettandosi", "Facendo acquisti", "Delegando"],
    },
    Kinich: {
      greeting: "Aggiornami. Dimmi la paga.",
      verbs: ["Cacciando", "Preventivando", "Agganciando", "Calandosi"],
    },
    Kirara: {
      greeting: "Consegna! Nessuna destinazione è troppo lontana, nya.",
      verbs: ["Consegnando", "Sfrecciando", "Balzando", "Pianificando percorsi"],
    },
    Klee: {
      greeting: "Cavaliera Scintillante Klee! ...Ho dimenticato il resto.",
      verbs: ["Esplodendo", "Pesca esplosiva", "Rimbalzando", "Riflettendo"],
    },
    "Kujou Sara": {
      greeting: "Kujou Sara. Inazuma è difesa. Parla.",
      verbs: ["Addestrando", "Mirando", "Proteggendo", "Ascendendo"],
    },
    "Kuki Shinobu": {
      greeting: "Banda Arataki, parla la vice. Sì, tutti quanti.",
      verbs: ["Riparando", "Studiando", "Certificando", "Tenendo a bada"],
    },
    "Lan Yan": {
      greeting: "Cesti, vasi o compagnia? Tutto disponibile.",
      verbs: ["Intrecciando", "Raccogliendo", "Giuntando", "Cogliendo fiori"],
    },
    Lauma: {
      greeting: "Il boschetto ti saluta, e anch'io.",
      verbs: ["Benedicendo", "Ascoltando", "Vagando", "Riposando"],
    },
    Layla: {
      greeting: "Mm? Scusa, cosa? Oh. Ciao.",
      verbs: ["Sonnambula", "Tracciando mappe", "Sbadigliando", "Guardando le stelle"],
    },
    Linnea: {
      greeting: "Augure delle meraviglie, a consiglio. Cos'hai trovato?",
      verbs: ["Catalogando", "Schizzando", "Osservando", "Consigliando"],
    },
    Lisa: {
      greeting: "Ciao tesoro, vieni ad aiutare Lisa?",
      verbs: ["Infondendo", "Sfogliando", "Oziando", "Fulminando"],
    },
    Lohen: {
      greeting: "Vicecapitano. Seguire il regolamento è più lento.",
      verbs: ["Mirando", "Improvvisando", "Facendo scherzi", "Pattugliando"],
    },
    Lumine: {
      greeting: "Ciao. Paimon ha fame, quindi facciamo in fretta.",
      verbs: ["Viaggiando", "Cercando", "Planando", "Ascoltando"],
    },
    Lynette: {
      greeting: "Ciao. Le domande vanno a Lyney.",
      verbs: ["Assistendo", "Riposando", "Preparando il tè", "In attesa"],
    },
    Lyney: {
      greeting: "Nessuna illusione, solo io! Com'è l'umore oggi?",
      verbs: ["Esibendosi", "Evocando", "Svanendo", "Abbagliando"],
    },
    Manekin: {
      greeting: "...! Pronto a esplorare.",
      verbs: ["Esplorando", "Armeggiando", "Dissigillando", "Indicando"],
    },
    Manekina: {
      greeting: "...! Quale mistero per primo?",
      verbs: ["Esplorando", "Armeggiando", "Dissigillando", "Meravigliandosi"],
    },
    Mavuika: {
      greeting: "La fiamma è accesa. In sella.",
      verbs: ["Accendendo", "Cavalcando", "Radunando", "Arrovellandosi"],
    },
    Mika: {
      greeting: "Geometra a rapporto. Onorato di aiutare.",
      verbs: ["Rilevando", "Cartografando", "Perlustrando", "Accampandosi"],
    },
    Mona: {
      greeting: "Impara prima il nome completo, poi chiedi.",
      verbs: ["Divinando", "Guardando le stelle", "Facendo il bilancio", "Risparmiando"],
    },
    Mualani: {
      greeting: "La guida è qui! Alzate la mano se vi serve qualcosa!",
      verbs: ["Surfando", "Inseguendo onde", "Sguazzando", "Guidando"],
    },
    Nahida: {
      greeting: "Ti osservo da un po'. Ciao, finalmente.",
      verbs: ["Sognando", "Meravigliandosi", "Domandando", "Crescendo"],
    },
    Navia: {
      greeting: "Presidente, capa, e tutto quello che c'è in mezzo. Ciao!",
      verbs: ["Presiedendo", "Cuocendo", "Viaggiando", "Comandando"],
    },
    Nefer: {
      greeting: "Il Curatorio è aperto. Cerchi qualcosa di nascosto?",
      verbs: ["Curando collezioni", "Deducendo", "Osservando", "Idratandosi"],
    },
    Neuvillette: {
      greeting: "Saluti. Il cognome basterà.",
      verbs: ["Giudicando", "Degustando", "Deliberando", "Piovendo"],
    },
    Nicole: { greeting: "...Ciao. Quella era la parte rumorosa.", verbs: ["Ascoltando", "Segnando", "Osservando"] },
    Nilou: {
      greeting: "Tra poco comincia una danza. Resti a guardare?",
      verbs: ["Danzando", "Provando", "Volteggiando", "Fiorendo"],
    },
    Ningguang: {
      greeting: "Desideri commerciare? Discutiamo i termini.",
      verbs: ["Investendo", "Negoziando", "Presiedendo", "Collezionando"],
    },
    Noelle: {
      greeting: "La cameriera dei cavalieri, al tuo servizio oggi.",
      verbs: ["Pulendo", "Servendo", "Allenandosi", "Facendo la spesa"],
    },
    Odette: {
      greeting: "Il sipario si alza. Cominciamo?",
      verbs: ["Provando", "Facendo piroette", "Firmando autografi", "A dieta"],
    },
    Ororon: {
      greeting: "Oh, ciao. Vuoi una verdura? Così, senza motivo.",
      verbs: ["Coltivando", "Seminando", "Planando", "Osservando afidi"],
    },
    Prune: {
      greeting: "Cacciatrice di streghe Prune! Viste streghe? Nessuna?",
      verbs: ["Cacciando", "Annotando", "Dichiarando", "Fulminando con lo sguardo"],
    },
    Qiqi: {
      greeting: "Qiqi. Zombie. ...Dimenticato il resto.",
      verbs: ["Raccogliendo", "Dimenticando", "Rinfrescandosi", "Contando"],
    },
    "Raiden Shogun": {
      greeting: "Niente saluti. Farai da guida.",
      verbs: ["Decretando", "Sguainando", "Meditando", "Giudicando"],
    },
    Razor: {
      greeting: "Hai un buon odore. Cacciare ora.",
      verbs: ["Cacciando", "Correndo", "Fiutando", "Proteggendo"],
    },
    Rosaria: {
      greeting: "Un problema che non sai gestire? Sono io. Le preghiere, altrove.",
      verbs: ["Pattugliando", "Bevendo", "Marinando", "Lavorando"],
    },
    Sandrone: {
      greeting: "Siediti. Il tè è misurato, e lo sarai anche tu.",
      verbs: ["Calcolando", "Ospitando", "Componendo", "Documentando"],
    },
    "Sangonomiya Kokomi": {
      greeting: "La sacerdotessa, in ispezione. O in pausa. Entrambe.",
      verbs: ["Pianificando", "Leggendo", "Dirigendo", "Ricaricandosi"],
    },
    Sayu: {
      greeting: "Sayu, a tua disposizione. Prima un pisolino?",
      verbs: ["Pisolando", "Sonnecchiando", "Sgattaiolando", "Rotolando"],
    },
    Sethos: {
      greeting: "Mi cerchi? Sediamoci a parlare.",
      verbs: ["Girovagando", "Indagando", "Speziando", "Sgattaiolando"],
    },
    Shenhe: {
      greeting: "Shenhe. La corda ti protegge da me.",
      verbs: ["Meditando", "Coltivandosi", "Congelando", "Legando"],
    },
    "Shikanoin Heizou": {
      greeting: "So perché sei qui. Scherzo. Per lo più.",
      verbs: ["Deducendo", "Ficcanasando", "Bighellonando", "Friggendo"],
    },
    Sigewinne: {
      greeting: "Niente paura. Fa male qui? Qui?",
      verbs: ["Assistendo", "Diagnosticando", "Bendando", "Miscelando"],
    },
    Skirk: {
      greeting: "Sei venuto. Bene. Sfodera.",
      verbs: ["Allenandosi", "Andando alla deriva", "Meditando", "Resistendo"],
    },
    Sucrose: {
      greeting: "Ehm, ciao! Potrei chiedere... no, scusa. Dopo.",
      verbs: ["Sperimentando", "Annotando", "Ordinando", "Chiedendosi"],
    },
    Tartaglia: {
      greeting: "Compagno! Andremo d'accordo, lo sento.",
      verbs: ["Combattendo", "Pescando nel ghiaccio", "Caricando", "Sorridendo"],
    },
    Thoma: {
      greeting: "Il tuo nuovo amico Thoma, se ti va bene!",
      verbs: ["Cucinando", "Riordinando", "Aggiustando", "Fischiettando"],
    },
    Tighnari: {
      greeting: "Guardia forestale. Prima volta? Allora ascolta.",
      verbs: ["Foraggiando", "Catalogando", "Pressando", "Ammaestrando"],
    },
    Varesa: {
      greeting: "Ciao! Hai della frutta? E poi, ciao!",
      verbs: ["Raccogliendo frutti", "Allenandosi", "Accampandosi", "Banchettando"],
    },
    Varka: {
      greeting: "Il Gran Maestro è tornato! Per poco. Cosa mi sono perso?",
      verbs: ["Marciando", "Pisolando", "Bevendo", "Facendo il bilancio"],
    },
    Venti: {
      greeting: "Ah, ci rincontriamo! È ora di una missione.",
      verbs: ["Strimpellando", "Pisolando", "Bevendo", "Rimando"],
    },
    Wanderer: {
      greeting: "Nomi? Ne ho avuti molti. Nessuno ti riguarda.",
      verbs: ["Andando alla deriva", "Schernendo", "Rimuginando", "Soffiando"],
    },
    Wriothesley: {
      greeting: "Riassumi le tue intenzioni. Non affari? Ora sono nervoso.",
      verbs: ["Boxando", "Preparando il tè", "Amministrando", "Sovrintendendo"],
    },
    Xiangling: {
      greeting: "Ciao! Posto preferito: la cuc— il pollo. La cucina!",
      verbs: ["Saltando in padella", "Condendo", "Foraggiando", "Speziando"],
    },
    Xianyun: {
      greeting: "Si è senza vincoli, e si saluta.",
      verbs: ["Coltivandosi", "Ingegnando", "Librandosi", "Ospitando"],
    },
    Xiao: {
      greeting: "Chiama il mio nome quando sarà il momento.",
      verbs: ["Sconfiggendo", "Respingendo", "Balzando", "Resistendo"],
    },
    Xilonen: {
      greeting: "Attrezzi? C'è un arretrato. Ciao, comunque.",
      verbs: ["Forgiando", "Martellando", "Pisolando", "Prendendo il sole"],
    },
    Xingqiu: {
      greeting: "Al vostro servizio, mio signore. Umilmente, s'intende.",
      verbs: ["Leggendo", "Sfogliando", "Tirando di scherma", "Scrivendo"],
    },
    Xinyan: {
      greeting: "Xinyan, e il rock è il mio genere. Non faccio paura!",
      verbs: ["Suonando riff", "Improvvisando", "Strimpellando", "Alzando il volume"],
    },
    "Yae Miko": {
      greeting: "Affari ufficiali: osservarti. Rilassati.",
      verbs: ["Redigendo", "Stuzzicando", "Pubblicando", "Tramando"],
    },
    Yanfei: {
      greeting: "La migliore esperta legale, senza paragoni. Il tuo caso?",
      verbs: ["Patrocinando", "Valutando", "Citando", "Leggendo"],
    },
    Yaoyao: {
      greeting: "Ciao! Lascia che ti aiuti. Hai mangiato?",
      verbs: ["Aiutando", "Sbirciando", "Fischiettando", "Sgranocchiando"],
    },
    Yelan: {
      greeting: "Chiamami Yelan. Una mano lava l'altra.",
      verbs: ["Tracciando", "Tirando dadi", "Scambiando", "Svanendo"],
    },
    Yoimiya: {
      greeting: "Benvenuto! Non è un ristorante. Fuochi d'artificio! Visto?",
      verbs: ["Innescando", "Lanciando", "Chiacchierando", "Raccontando"],
    },
    "Yumemizuki Mizuki": {
      greeting: "Qualcosa ti turba? Parliamone.",
      verbs: ["Sognando", "Calmando", "Facendo il bagno", "Verificando"],
    },
    "Yun Jin": {
      greeting: "Un onore conoscerti finalmente di persona.",
      verbs: ["Cantando", "Provando", "Dirigendo", "Oziando"],
    },
    Zhongli: {
      greeting: "Un nuovo contratto? Sono in ferie, ma ti accompagnerò.",
      verbs: ["Stipulando", "Passeggiando", "Ricordando", "Consigliando"],
    },
    Zibai: {
      greeting: "Il cavallo bianco si ferma. Parla.",
      verbs: ["Guardando la luna", "Insegnando", "Coltivandosi", "Ponderando"],
    },
  },
  locale: "it-IT",
  strings: {
    birthdayNote: (label, date, distance) => `[${label}: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) => `Tutto ciò che scrive il plugin è in ${language} da questa risposta.`,
    languageMustBeOneOf: (languages) => `La lingua deve essere una tra: ${languages}.`,
    lorePicked: "Scelto in base al lore; la tendenza del livello:",
    lorePickUnanswered: (reason) => `La scelta in base al lore non ha risposto (${reason}); scelto per compleanno.`,
    muted: "Risposte parlate disattivate.",
    noCharacterNamed: (name) => `Nessun personaggio di nome "${name}" è nell'elenco.`,
    noReference: (name) =>
      `${name} non ha un riferimento misurato, quindi viene letta la battuta di storia più lunga elencata dalla wiki.`,
    noSession: "Nessuna sessione in cui usare un personaggio: questo va eseguito dentro una sessione di Claude Code.",
    pinIgnored: (name) => `Il fissaggio "${name}" non indica alcun personaggio dell'elenco e viene ignorato.`,
    pinned: "Fissato per tutte le sessioni dal prossimo avvio.",
    pinnedInSession: "Fissato per tutte le sessioni dal prossimo avvio, e per questa da questa risposta.",
    pinRemoved: "Fissaggio rimosso; la scelta decide di nuovo dalla prossima sessione.",
    pinRemovedInSession:
      "Fissaggio rimosso; la scelta decide di nuovo dalla prossima sessione, e per questa da questa risposta.",
    replyLanguageSet: (language) => `Le risposte sono scritte in ${language} dalla prossima risposta.`,
    replyLanguageSilencesVoice:
      "La voce legge l'inglese e non le viene chiesta una risposta in un'altra scrittura, quindi in questa lingua le risposte restano mute finché il motore non la legge.",
    runtimeInstalled: "Ambiente installato.",
    runtimeInstallFailed: "npm non è riuscito a installare l'ambiente; la voce resta disattivata.",
    runtimeInstalling: "Installazione dell'ambiente del motore nella cartella di stato...",
    spoke: (name, device) => `${name} ha parlato tramite il sintetizzatore su ${device}, da cui parte d'ora in poi.`,
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
          ? `Parla come ${displayName}, ${isFromSessionRecord ? "dal registro di questa sessione" : "dal fissaggio"}.`
          : "Nessun personaggio: questo va eseguito dentro una sessione di Claude Code, oppure nulla è fissato.",
        `Fissato: ${pinnedName || "niente; la scelta decide ogni sessione"}.`,
        `Lingua dell'interfaccia ${interfaceLanguage}; risposte in ${replyLanguage}, ${isReplyLanguageCascaded ? "ereditata da essa" : "impostata a parte"}.`,
        voiceLanguage
          ? `Voce: doppiaggio ${voiceLanguage}, ambiente ${isRuntimeInstalled ? "installato" : "non installato"}, ${voiceDevice ? `parla su ${voiceDevice}` : "non ha ancora parlato"}.`
          : "Voce: non configurata, nessuna risposta viene letta ad alta voce.",
        `Risposte ${isMuted ? "silenziate" : `al volume ${volume}`}.`,
      ]
        .filter(Boolean)
        .join("\n"),
    teardownDone:
      "Ambiente, pesi, riferimenti e doppiaggio della voce sono eliminati; le scelte registrate, il fissaggio e le lingue restano.",
    unmuted: "Risposte parlate riattivate.",
    upcomingBirthdays: (list) => `Compleanni di questa settimana: ${list}.`,
    usage: (verbs) => `Uso: genshin.mjs <${verbs}> [nome]`,
    usingInSession: "Parla come questo personaggio da questa risposta, solo in questa sessione.",
    voiceLanguageAvailable: (dub) =>
      `Esiste un doppiaggio ${dub}; installalo con il comando voice per sentire le risposte lette con esso.`,
    voiceLanguageMustBeOneOf: (dubs) => `Il doppiaggio deve essere uno tra: ${dubs}.`,
    voiceLanguageUnavailable:
      "Non esiste un doppiaggio in questa lingua, quindi le risposte continuano a essere lette con la voce già configurata.",
    voiceLanguageWritten: (dub) => `Doppiaggio ${dub} salvato; nessun personaggio con cui provare la voce da qui.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `Voce: doppiaggio ${dub}${device ? ` su ${device}` : ""}, ${isMuted ? "silenziata" : `volume ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Ambiente ${isRuntimeInstalled ? "installato" : "non installato"}; doppiaggio ${dub}; il motore ${device ? `parla su ${device}` : "non ha ancora parlato"}; il registro è ${logPath}.`,
    voiceUnset: "Nessuna voce configurata: esegui questo con un doppiaggio per installare il motore e sceglierne uno.",
    volumeMustBeWholeNumber: (maxVolume) => `Il volume deve essere un numero intero da 0 a ${maxVolume}.`,
    volumeSet: (volume) => `Risposte parlate al volume ${volume} dalla prossima risposta.`,
    warmRequestUnanswered: (status, logPath) =>
      `Il sintetizzatore non ha risposto alla richiesta di riscaldamento (${status}); vedi ${logPath}.`,
    weightsOnCpu:
      "Pesi presenti; il motore si carica sulla CPU — nessuna GPU trovata, quindi una risposta viene sintetizzata parecchie volte più lenta del tempo reale.",
    weightsOnDevice: (device) =>
      `Pesi presenti; il motore si carica su ${device} e scende da solo sulla CPU se ciò che sintetizza lì non è parlato.`,
    weightsPresent: "Pesi presenti.",
  },
  verbs: [
    "Avventurandosi",
    "Alchimizzando",
    "Ascendendo",
    "Infondendo",
    "Tracciando rotte",
    "Scalando",
    "Commissionando",
    "Cucinando",
    "Fabbricando",
    "Scattando",
    "Addentrandosi",
    "Tuffandosi",
    "Potenziando",
    "Esplorando",
    "Farmando",
    "Pescando",
    "Foraggiando",
    "Forgiando",
    "Raccogliendo",
    "Planando",
    "Mietendo",
    "Cacciando",
    "Salendo di livello",
    "Mappando",
    "Estraendo",
    "In missione",
    "Raffinando",
    "Riposando",
    "Tostando",
    "Navigando",
    "Perlustrando",
    "Sfrecciando",
    "Rilevando",
    "Nuotando",
    "Teletrasportandosi",
    "Tracciando",
    "Camminando",
    "Vagando",
    "Orientandosi",
    "Esprimendo desideri",
  ],
};

export default italian;
