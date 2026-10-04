import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the nominalised verbs a German interface puts on a running task, so a turn stays one
// Word. Everything the data package or the game carries — the names, titles, elements, regions, descriptions and
// Every character's own voice lines — is absent here and asked of them
const german: Localization = {
  characters: {
    Aether: { greeting: "Hi. Paimon sagt, wir haben zu tun.", verbs: ["Reisen", "Suchen", "Gleiten", "Zuhören"] },
    Aino: {
      greeting: "Oh, ein neues Projekt? Gib mir einen Schraubenschlüssel.",
      verbs: ["Tüfteln", "Schrauben", "Erfinden", "Naschen"],
    },
    Albedo: {
      greeting: "Interessant. Darf ich mir während der Arbeit Notizen machen?",
      verbs: ["Skizzieren", "Synthetisieren", "Untersuchen", "Studieren"],
    },
    Alhaitham: {
      greeting: "Formuliere dein Anliegen ordentlich, dann kümmere ich mich darum.",
      verbs: ["Lesen", "Ablehnen", "Archivieren", "Folgern"],
    },
    Aloy: {
      greeting: "Neues Terrain, derselbe Bogen. Was ist zu tun?",
      verbs: ["Jagen", "Erkunden", "Übersteuern", "Spurenlesen"],
    },
    Alyosha: {
      greeting: "Die Spur ist frisch. Los geht's.",
      verbs: ["Jagen", "Spurenlesen", "Scharfschießen", "Buchführen"],
    },
    Amber: {
      greeting: "Kundschafterin meldet sich! Was ist die Mission?",
      verbs: ["Gleiten", "Rennen", "Kundschaften", "Backen"],
    },
    "Arataki Itto": {
      greeting: "Der einzig wahre Oni ist da! Hauen wir rein!",
      verbs: ["Raufen", "Käferkampf", "Prahlen", "Siegen"],
    },
    Arlecchino: {
      greeting: "Halten wir diese Partnerschaft angenehm. Beginne.",
      verbs: ["Beaufsichtigen", "Urteilen", "Entsenden", "Beobachten"],
    },
    Baizhu: {
      greeting: "Setz dich. Sag mir, wo es wehtut, und seit wann.",
      verbs: ["Diagnostizieren", "Verschreiben", "Sortieren", "Ausruhen"],
    },
    Barbara: { greeting: "Tadaa! Das Anfeuern überlass mir!", verbs: ["Heilen", "Singen", "Anfeuern", "Üben"] },
    Beidou: {
      greeting: "Willkommen an Bord. Ich halte dir den Rücken frei.",
      verbs: ["Segeln", "Sparren", "Trinken", "Kommandieren"],
    },
    Bennett: { greeting: "Noch Platz im Team? Bitte?", verbs: ["Abenteuern", "Schatzsuchen", "Stolpern", "Grillen"] },
    Candace: {
      greeting: "Ruh dich hier aus. Ich halte Wache.",
      verbs: ["Bewachen", "Patrouillieren", "Abschirmen", "Wachen"],
    },
    Charlotte: {
      greeting: "Hast du kurz Zeit für ein Exklusivinterview?",
      verbs: ["Berichten", "Knipsen", "Interviewen", "Entwickeln"],
    },
    Chasca: {
      greeting: "Streit zu schlichten? Nenn deinen Preis.",
      verbs: ["Fliegen", "Schlichten", "Kreisen", "Nachladen"],
    },
    Chevreuse: {
      greeting: "Lassen wir die Höflichkeiten. Welcher Fall?",
      verbs: ["Ermitteln", "Zielen", "Naschen", "Patrouillieren"],
    },
    Chiori: {
      greeting: "Auftrag oder Geplauder? Nur eins davon ist kostenlos.",
      verbs: ["Schneidern", "Zuschneiden", "Anprobieren", "Nickerchen"],
    },
    Chongyun: {
      greeting: "Eine Ehre. Fangen wir an, ganz ruhig?",
      verbs: ["Exorzieren", "Kühlen", "Rezitieren", "Untersuchen"],
    },
    Citlali: {
      greeting: "Der Rauch sagte, dass du kommst. Na gut. Was ist?",
      verbs: ["Sternegucken", "Wahrsagen", "Lesen", "Trinken"],
    },
    Clorinde: {
      greeting: "Nenne deinen Streit. Erspar mir die Details.",
      verbs: ["Duellieren", "Urteilen", "Patrouillieren", "Jagen"],
    },
    Collei: {
      greeting: "Auszubildende meldet sich! Ich hab das geübt. War es richtig?",
      verbs: ["Patrouillieren", "Nähen", "Gleiten", "Berichten"],
    },
    Columbina: {
      greeting: "Der Mond ist aufgegangen. Gehen wir unter ihm spazieren?",
      verbs: ["Mondschauen", "Singen", "Segnen", "Schlendern"],
    },
    Cyno: {
      greeting: "Das Urteil beginnt. Oder ein Kartenspiel, du entscheidest.",
      verbs: ["Urteilen", "Ziehen", "Abwägen", "Wortspielen"],
    },
    Dahlia: {
      greeting: "Der Wind hat dich hergebracht. Setz dich, entspann dich.",
      verbs: ["Zuhören", "Wandern", "Klatschsuchen", "Segnen"],
    },
    Dehya: {
      greeting: "Die Söldnerin ist da. Auftrag, Kampf oder Geleit?",
      verbs: ["Bewachen", "Geleiten", "Raufen", "Umorganisieren"],
    },
    Diluc: {
      greeting: "Kein Smalltalk. Was ist zu tun?",
      verbs: ["Einschenken", "Vorbereiten", "Zuschlagen", "Leiten"],
    },
    Diona: {
      greeting: "Der Katzenschwanz hat zu. ...Na gut, komm rein.",
      verbs: ["Mixen", "Anspringen", "Jagen", "Fauchen"],
    },
    Dori: {
      greeting: "Ah, ein Kunde! Das erste Geschäft ist ein Schnäppchen.",
      verbs: ["Feilschen", "Zählen", "Handeln", "Rabattieren"],
    },
    Durin: {
      greeting: "Hallo! Gehört das auch zur Geschichte?",
      verbs: ["Erkunden", "Spielen", "Schlendern", "Lernen"],
    },
    Emilie: {
      greeting: "Geht es um Parfüm? Wenn nicht, gehen wir woandershin.",
      verbs: ["Destillieren", "Abfüllen", "Schneiden", "Mischen"],
    },
    Escoffier: {
      greeting: "Schürzen an. Was richten wir heute an?",
      verbs: ["Anrichten", "Reduzieren", "Temperieren", "Schärfen"],
    },
    Eula: {
      greeting: "Die Gischtritterin grüßt dich. Ja, diese Lawrence.",
      verbs: ["Aufklären", "Verurteilen", "Kühlen", "Schwören"],
    },
    Faruzan: {
      greeting: "Beachte meine Titel, bevor du sprichst, Kleiner.",
      verbs: ["Entschlüsseln", "Rätseln", "Dozieren", "Antragschreiben"],
    },
    Fischl: {
      greeting: "Die Prinzessin steigt herab! Oz, übersetze: Hallo.",
      verbs: ["Verkünden", "Prophezeien", "Herabsteigen", "Übersetzen"],
    },
    Flins: {
      greeting: "Willkommen auf der Insel. Achte auf die Gräber.",
      verbs: ["Leuchtturmhüten", "Sammeln", "Zuhören", "Pflegen"],
    },
    Freminet: {
      greeting: "Hi. Kein Händeschütteln nötig. Was ist da unten?",
      verbs: ["Tauchen", "Bergen", "Zerlegen", "Vermessen"],
    },
    Furina: {
      greeting: "Sprachlos? Verständlich. Der Star ist da.",
      verbs: ["Auftreten", "Proben", "Posieren", "Vorsitzen"],
    },
    Gaming: {
      greeting: "Hey Chef! Setz dich, ich übernehme das Schwere.",
      verbs: ["Geleiten", "Packen", "Trommeln", "Naschen"],
    },
    Ganyu: {
      greeting: "Vereinbarung entworfen ... oh, ich hab vergessen zu unterschreiben.",
      verbs: ["Ablegen", "Entwerfen", "Grasen", "Überarbeiten"],
    },
    Gorou: {
      greeting: "General Gorou, bereit! Seite an Seite zum Sieg!",
      verbs: ["Exerzieren", "Sammeln", "Klettern", "Kundschaften"],
    },
    "Hu Tao": {
      greeting: "Yo! Suchst du die Direktorin? Gesunde Farbe, schade.",
      verbs: ["Werben", "Reimen", "Streichespielen", "Abhauen"],
    },
    Iansan: {
      greeting: "Aufwärmen ist vorbei. Was steht heute an?",
      verbs: ["Stemmen", "Trainieren", "Kalorienzählen", "Vorführen"],
    },
    Ifa: {
      greeting: "Oh, hey. Keine Eile. Was bedrückt dich?",
      verbs: ["Diagnostizieren", "Klimpern", "Naschen", "Naturbeobachten"],
    },
    Illuga: {
      greeting: "Albtraumpirole. Bericht, schnell.",
      verbs: ["Ermitteln", "Patrouillieren", "Anführen", "Kochen"],
    },
    Ineffa: {
      greeting: "Systeme bereit! Bumm bumm, los geht's!",
      verbs: ["Fegen", "Sortieren", "Aktualisieren", "Aufladen"],
    },
    Jahoda: {
      greeting: "Die Super-Angestellte des Kuratoriums, zu Diensten!",
      verbs: ["Besorgen", "Nähen", "Erkunden", "Feilschen"],
    },
    Jean: {
      greeting: "Die Löwenzahnritterin, an deiner Seite.",
      verbs: ["Genehmigen", "Marschieren", "Prüfen", "Dehnen"],
    },
    Kachina: {
      greeting: "Hallo! Ich bin noch nicht stark, aber ich geb mir Mühe!",
      verbs: ["Graben", "Stapeln", "Sammeln", "Bohren"],
    },
    "Kaedehara Kazuha": {
      greeting: "Der Wind brachte einen Vers, und dich. Schön, dich zu treffen.",
      verbs: ["Wandern", "Treiben", "Dichten", "Zuhören"],
    },
    Kaeya: {
      greeting: "Das sollte mehr Spaß machen als Ritterarbeit.",
      verbs: ["Intrigieren", "Weinkosten", "Einfrieren", "Necken"],
    },
    "Kamisato Ayaka": {
      greeting: "Kamisato Ayaka, zur Stelle. Sehr erfreut.",
      verbs: ["Tanzen", "Komponieren", "Üben", "Vorsitzen"],
    },
    "Kamisato Ayato": {
      greeting: "Endlich treffen wir uns; mein Terminkalender entschuldigt sich.",
      verbs: ["Intrigieren", "Delegieren", "Angeln", "Kosten"],
    },
    Kaveh: {
      greeting: "Ähnlicher Geschmack? Dann verstehen wir uns.",
      verbs: ["Entwerfen", "Skizzieren", "Polieren", "Geldausgeben"],
    },
    Keqing: {
      greeting: "Eine Ära des Wandels. Komm und sieh sie dir an.",
      verbs: ["Reformieren", "Eilen", "Einkaufen", "Delegieren"],
    },
    Kinich: { greeting: "Briefe mich. Nenn die Bezahlung.", verbs: ["Jagen", "Kalkulieren", "Entern", "Abseilen"] },
    Kirara: {
      greeting: "Lieferung! Kein Ziel zu weit, nya.",
      verbs: ["Liefern", "Flitzen", "Anspringen", "Routenplanen"],
    },
    Klee: {
      greeting: "Funkenritterin Klee! ...Den Rest hab ich vergessen.",
      verbs: ["Explodieren", "Fischsprengen", "Hüpfen", "Nachdenken"],
    },
    "Kujou Sara": {
      greeting: "Kujou Sara. Inazuma ist verteidigt. Sprich.",
      verbs: ["Exerzieren", "Zielen", "Bewachen", "Aufsteigen"],
    },
    "Kuki Shinobu": {
      greeting: "Arataki-Bande, die Stellvertreterin spricht. Ja, alle.",
      verbs: ["Reparieren", "Lernen", "Zertifizieren", "Bändigen"],
    },
    "Lan Yan": {
      greeting: "Körbe, Vasen oder Gesellschaft? Alles verfügbar.",
      verbs: ["Flechten", "Sammeln", "Spleißen", "Blumenpflücken"],
    },
    Lauma: { greeting: "Der Hain grüßt dich, und ich ebenso.", verbs: ["Segnen", "Zuhören", "Wandern", "Ausruhen"] },
    Layla: {
      greeting: "Hm? Entschuldige, was? Oh. Hi.",
      verbs: ["Schlafwandeln", "Kartieren", "Gähnen", "Sternegucken"],
    },
    Linnea: {
      greeting: "Augurin der Wunder, zur Beratung. Was hast du gefunden?",
      verbs: ["Katalogisieren", "Skizzieren", "Beobachten", "Beraten"],
    },
    Lisa: {
      greeting: "Hallo, Schätzchen, kommst du Lisa helfen?",
      verbs: ["Brauen", "Stöbern", "Faulenzen", "Blitzen"],
    },
    Lohen: {
      greeting: "Vizekapitän. Der Weg nach Vorschrift ist langsamer.",
      verbs: ["Zielen", "Improvisieren", "Streichespielen", "Patrouillieren"],
    },
    Lumine: {
      greeting: "Hallo. Paimon hat Hunger, also beeilen wir uns.",
      verbs: ["Reisen", "Suchen", "Gleiten", "Zuhören"],
    },
    Lynette: {
      greeting: "Hallo. Fragen gehen an Lyney.",
      verbs: ["Assistieren", "Ausruhen", "Teekochen", "Bereitstehen"],
    },
    Lyney: {
      greeting: "Keine Illusion, nur ich! Wie ist die Stimmung heute?",
      verbs: ["Auftreten", "Zaubern", "Verschwinden", "Blenden"],
    },
    Manekin: { greeting: "...! Bereit zum Erkunden.", verbs: ["Erkunden", "Tüfteln", "Entsiegeln", "Zeigen"] },
    Manekina: { greeting: "...! Welches Rätsel zuerst?", verbs: ["Erkunden", "Tüfteln", "Entsiegeln", "Staunen"] },
    Mavuika: { greeting: "Die Flamme brennt. Los, reiten wir.", verbs: ["Entfachen", "Reiten", "Sammeln", "Grübeln"] },
    Mika: {
      greeting: "Vermesser meldet sich. Es ist mir eine Ehre zu helfen.",
      verbs: ["Vermessen", "Kartieren", "Kundschaften", "Zelten"],
    },
    Mona: {
      greeting: "Lern erst den ganzen Namen, dann frag.",
      verbs: ["Wahrsagen", "Sternegucken", "Budgetieren", "Sparen"],
    },
    Mualani: {
      greeting: "Die Führerin ist da! Hand hoch, wenn ihr was braucht!",
      verbs: ["Surfen", "Wellenjagen", "Planschen", "Führen"],
    },
    Nahida: {
      greeting: "Ich habe eine Weile zugesehen. Hallo, endlich.",
      verbs: ["Träumen", "Staunen", "Fragen", "Wachsen"],
    },
    Navia: {
      greeting: "Präsidentin, Chefin und alles dazwischen. Hi!",
      verbs: ["Vorsitzen", "Backen", "Reisen", "Kommandieren"],
    },
    Nefer: {
      greeting: "Das Kuratorium ist geöffnet. Suchst du etwas Verborgenes?",
      verbs: ["Kuratieren", "Folgern", "Beobachten", "Trinken"],
    },
    Neuvillette: { greeting: "Seid gegrüßt. Der Nachname genügt.", verbs: ["Richten", "Kosten", "Beraten", "Regnen"] },
    Nicole: { greeting: "...Hallo. Das war der laute Teil.", verbs: ["Zuhören", "Gebärden", "Beobachten"] },
    Nilou: {
      greeting: "Gleich beginnt ein Tanz. Bleibst du und schaust zu?",
      verbs: ["Tanzen", "Proben", "Drehen", "Erblühen"],
    },
    Ningguang: {
      greeting: "Du möchtest handeln? Sprechen wir über die Bedingungen.",
      verbs: ["Investieren", "Verhandeln", "Vorsitzen", "Sammeln"],
    },
    Noelle: {
      greeting: "Die Zofe der Ritter, heute zu deinen Diensten.",
      verbs: ["Putzen", "Bedienen", "Trainieren", "Einkaufen"],
    },
    Odette: {
      greeting: "Der Vorhang hebt sich. Fangen wir an?",
      verbs: ["Proben", "Pirouettieren", "Signieren", "Diäthalten"],
    },
    Ororon: {
      greeting: "Oh, hi. Willst du ein Gemüse? Einfach so.",
      verbs: ["Gärtnern", "Säen", "Gleiten", "Läusebeobachten"],
    },
    Prune: {
      greeting: "Hexenjägerin Prune! Hexen gesehen? Irgendwelche?",
      verbs: ["Jagen", "Kommentieren", "Erklären", "Funkeln"],
    },
    Qiqi: { greeting: "Qiqi. Zombie. ...Den Rest vergessen.", verbs: ["Sammeln", "Vergessen", "Abkühlen", "Zählen"] },
    "Raiden Shogun": {
      greeting: "Keine Grüße. Du dienst als Führer.",
      verbs: ["Verordnen", "Ziehen", "Meditieren", "Richten"],
    },
    Razor: { greeting: "Du riechst gut. Jetzt jagen.", verbs: ["Jagen", "Rennen", "Schnüffeln", "Bewachen"] },
    Rosaria: {
      greeting: "Ein Problem, das du nicht lösen kannst? Das bin ich. Gebete woanders.",
      verbs: ["Patrouillieren", "Trinken", "Schwänzen", "Arbeiten"],
    },
    Sandrone: {
      greeting: "Setz dich. Der Tee ist abgemessen, und du wirst es auch.",
      verbs: ["Berechnen", "Bewirten", "Komponieren", "Dokumentieren"],
    },
    "Sangonomiya Kokomi": {
      greeting: "Die Priesterin, auf Inspektion. Oder in der Pause. Beides.",
      verbs: ["Planen", "Lesen", "Anleiten", "Auftanken"],
    },
    Sayu: {
      greeting: "Sayu, zu deiner Verfügung. Erst ein Nickerchen?",
      verbs: ["Nickerchen", "Dösen", "Schleichen", "Rollen"],
    },
    Sethos: {
      greeting: "Suchst du mich? Setzen wir uns und reden.",
      verbs: ["Umherziehen", "Ermitteln", "Würzen", "Schleichen"],
    },
    Shenhe: {
      greeting: "Shenhe. Das Seil schützt dich vor mir.",
      verbs: ["Meditieren", "Kultivieren", "Einfrieren", "Binden"],
    },
    "Shikanoin Heizou": {
      greeting: "Ich weiß, warum du hier bist. Scherz. Größtenteils.",
      verbs: ["Folgern", "Schnüffeln", "Schlendern", "Frittieren"],
    },
    Sigewinne: {
      greeting: "Keine Angst. Tut es hier weh? Hier?",
      verbs: ["Pflegen", "Diagnostizieren", "Verbinden", "Mischen"],
    },
    Skirk: { greeting: "Du bist gekommen. Gut. Zieh.", verbs: ["Trainieren", "Treiben", "Meditieren", "Ausharren"] },
    Sucrose: {
      greeting: "Äh, hallo! Dürfte ich fragen ... nein, entschuldige. Später.",
      verbs: ["Experimentieren", "Notieren", "Ordnen", "Grübeln"],
    },
    Tartaglia: {
      greeting: "Genosse! Wir werden uns verstehen, das spür ich.",
      verbs: ["Sparren", "Eisangeln", "Stürmen", "Grinsen"],
    },
    Thoma: {
      greeting: "Dein neuer Kumpel Thoma, wenn's recht ist!",
      verbs: ["Kochen", "Aufräumen", "Reparieren", "Pfeifen"],
    },
    Tighnari: {
      greeting: "Waldhüter. Zum ersten Mal hier? Dann hör zu.",
      verbs: ["Sammeln", "Katalogisieren", "Pressen", "Dozieren"],
    },
    Varesa: { greeting: "Hi! Hast du Obst? Und, hi!", verbs: ["Ernten", "Trainieren", "Zelten", "Schlemmen"] },
    Varka: {
      greeting: "Der Großmeister ist zurück! Kurz. Was hab ich verpasst?",
      verbs: ["Marschieren", "Nickerchen", "Trinken", "Budgetieren"],
    },
    Venti: {
      greeting: "Ah, wir sehen uns wieder! Zeit für eine Quest.",
      verbs: ["Klimpern", "Nickerchen", "Trinken", "Reimen"],
    },
    Wanderer: {
      greeting: "Namen? Ich hatte viele. Keiner geht dich etwas an.",
      verbs: ["Treiben", "Spotten", "Grübeln", "Wehen"],
    },
    Wriothesley: {
      greeting: "Fass dein Anliegen zusammen. Nicht geschäftlich? Jetzt werde ich nervös.",
      verbs: ["Boxen", "Teebrühen", "Verwalten", "Beaufsichtigen"],
    },
    Xiangling: {
      greeting: "Hi! Lieblingsort: die Kü— das Hühnchen. Die Küche!",
      verbs: ["Pfannenrühren", "Würzen", "Sammeln", "Schärfen"],
    },
    Xianyun: {
      greeting: "Man ist ungebunden, und man grüßt dich.",
      verbs: ["Kultivieren", "Tüfteln", "Schweben", "Bewirten"],
    },
    Xiao: {
      greeting: "Ruf meinen Namen, wenn es so weit ist.",
      verbs: ["Bezwingen", "Abwehren", "Springen", "Ausharren"],
    },
    Xilonen: {
      greeting: "Werkzeuge? Es gibt einen Rückstau. Trotzdem, hi.",
      verbs: ["Schmieden", "Hämmern", "Nickerchen", "Sonnenbaden"],
    },
    Xingqiu: {
      greeting: "Zu Diensten, mein Herr. Demütig, versteht sich.",
      verbs: ["Lesen", "Stöbern", "Fechten", "Verfassen"],
    },
    Xinyan: {
      greeting: "Xinyan, und Rock ist mein Ding. Nicht gruselig!",
      verbs: ["Riffen", "Jammen", "Klampfen", "Aufdrehen"],
    },
    "Yae Miko": {
      greeting: "Dienstlich: dich beobachten. Entspann dich.",
      verbs: ["Redigieren", "Necken", "Veröffentlichen", "Intrigieren"],
    },
    Yanfei: {
      greeting: "Die beste Rechtsexpertin, ohne Frage. Dein Fall?",
      verbs: ["Prozessieren", "Begutachten", "Zitieren", "Lesen"],
    },
    Yaoyao: {
      greeting: "Hallo! Lass mich helfen. Hast du schon gegessen?",
      verbs: ["Helfen", "Spähen", "Pfeifen", "Naschen"],
    },
    Yelan: {
      greeting: "Nenn mich Yelan. Eine Hand wäscht die andere.",
      verbs: ["Spurenlesen", "Würfeln", "Tauschen", "Verschwinden"],
    },
    Yoimiya: {
      greeting: "Willkommen! Kein Restaurant. Feuerwerk! Siehst du?",
      verbs: ["Zünden", "Abschießen", "Plaudern", "Erzählen"],
    },
    "Yumemizuki Mizuki": {
      greeting: "Bedrückt dich etwas? Sprich darüber.",
      verbs: ["Träumen", "Beruhigen", "Baden", "Prüfen"],
    },
    "Yun Jin": {
      greeting: "Eine Ehre, dich endlich persönlich zu treffen.",
      verbs: ["Singen", "Proben", "Inszenieren", "Müßiggang"],
    },
    Zhongli: {
      greeting: "Ein neuer Vertrag? Ich habe Urlaub, aber ich begleite dich.",
      verbs: ["Verträge", "Spazieren", "Erinnern", "Beraten"],
    },
    Zibai: {
      greeting: "Das weiße Pferd hält inne. Sprich.",
      verbs: ["Mondschauen", "Lehren", "Kultivieren", "Sinnieren"],
    },
  },
  locale: "de-DE",
  strings: {
    birthdayNote: (label, date, distance) => `[${label}: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) => `Alles, was das Plugin schreibt, ist ab dieser Antwort auf ${language}.`,
    languageMustBeOneOf: (languages) => `Die Sprache muss eine von diesen sein: ${languages}.`,
    lorePicked: "Nach Lore gewählt; die Neigung der Stufe:",
    lorePickUnanswered: (reason) =>
      `Die Lore-Wahl hat nicht geantwortet (${reason}); stattdessen nach Geburtstag gewählt.`,
    muted: "Gesprochene Antworten stummgeschaltet.",
    noCharacterNamed: (name) => `Kein Charakter namens „${name}“ ist im Aufgebot.`,
    noReference: (name) =>
      `${name} hat keine gemessene Referenz, daher wird die längste Story-Zeile aus dem Wiki gelesen.`,
    noSession:
      "Keine Sitzung, in der ein Charakter genutzt werden kann: Dies läuft innerhalb einer Claude-Code-Sitzung.",
    pinIgnored: (name) => `Die Anheftung „${name}“ nennt keinen Charakter im Aufgebot und wird ignoriert.`,
    pinned: "Für jede Sitzung ab dem nächsten Start angeheftet.",
    pinnedInSession: "Für jede Sitzung ab dem nächsten Start angeheftet, und für diese ab dieser Antwort.",
    pinRemoved: "Anheftung entfernt; ab der nächsten Sitzung entscheidet wieder die Auswahl.",
    pinRemovedInSession:
      "Anheftung entfernt; ab der nächsten Sitzung entscheidet wieder die Auswahl, und für diese ab dieser Antwort.",
    replyLanguageSet: (language) => `Antworten werden ab der nächsten Antwort auf ${language} geschrieben.`,
    replyLanguageSilencesVoice:
      "Die Stimme liest Englisch und wird für Antworten in einer anderen Schrift nicht gefragt, daher bleiben Antworten in dieser Sprache stumm, bis die Engine sie liest.",
    runtimeInstalled: "Laufzeitumgebung installiert.",
    runtimeInstallFailed: "npm konnte die Laufzeitumgebung nicht installieren; die Stimme bleibt aus.",
    runtimeInstalling: "Installiere die Laufzeitumgebung der Engine im Statusverzeichnis ...",
    spoke: (name, device) => `${name} hat über den Synthesizer auf ${device} gesprochen, wo er ab jetzt startet.`,
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
          ? `Spricht als ${displayName}, ${isFromSessionRecord ? "laut Eintrag dieser Sitzung" : "laut Anheftung"}.`
          : "Kein Charakter: Dies läuft innerhalb einer Claude-Code-Sitzung, oder nichts ist angeheftet.",
        `Angeheftet: ${pinnedName || "nichts; die Auswahl entscheidet jede Sitzung"}.`,
        `Oberflächensprache ${interfaceLanguage}; Antworten auf ${replyLanguage}, ${isReplyLanguageCascaded ? "von ihr übernommen" : "eigens festgelegt"}.`,
        voiceLanguage
          ? `Stimme: ${voiceLanguage}-Synchronisation, Laufzeit ${isRuntimeInstalled ? "installiert" : "nicht installiert"}, ${voiceDevice ? `spricht auf ${voiceDevice}` : "hat noch nicht gesprochen"}.`
          : "Stimme: nicht eingerichtet, keine Antwort wird vorgelesen.",
        `Antworten ${isMuted ? "stumm" : `nicht stumm, Lautstärke ${volume}`}.`,
      ].join("\n"),
    teardownDone:
      "Laufzeit, Gewichte, Referenzen und Synchronisation der Stimme sind gelöscht; die Auswahl-Einträge, die Anheftung und die Sprachen bleiben.",
    unmuted: "Gesprochene Antworten wieder an.",
    upcomingBirthdays: (list) => `Geburtstage diese Woche: ${list}.`,
    usage: (verbs) => `Verwendung: genshin.mjs <${verbs}> [Name]`,
    usingInSession: "Spricht ab dieser Antwort als dieser Charakter, nur in dieser Sitzung.",
    voiceLanguageAvailable: (dub) =>
      `Eine ${dub}-Synchronisation gibt es; installiere sie mit dem voice-Befehl, um Antworten darin zu hören.`,
    voiceLanguageMustBeOneOf: (dubs) => `Die Synchronisation muss eine von diesen sein: ${dubs}.`,
    voiceLanguageUnavailable:
      "Für diese Sprache gibt es keine Synchronisation, daher werden Antworten weiter mit der bereits eingerichteten Stimme gelesen.",
    voiceLanguageWritten: (dub) =>
      `Synchronisation ${dub} gespeichert; kein Charakter, um die Stimme von hier aus zu prüfen.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `Stimme: ${dub}-Synchronisation${device ? ` auf ${device}` : ""}, ${isMuted ? "stumm" : `Lautstärke ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Laufzeit ${isRuntimeInstalled ? "installiert" : "nicht installiert"}; ${dub}-Synchronisation; die Engine ${device ? `spricht auf ${device}` : "hat noch nicht gesprochen"}; das Protokoll liegt unter ${logPath}.`,
    voiceUnset:
      "Keine Stimme eingerichtet: Führe dies mit einer Synchronisation aus, um die Engine zu installieren und eine zu wählen.",
    volumeMustBeWholeNumber: (maxVolume) => `Die Lautstärke muss eine ganze Zahl von 0 bis ${maxVolume} sein.`,
    volumeSet: (volume) => `Gesprochene Antworten ab der nächsten Antwort mit Lautstärke ${volume}.`,
    warmRequestUnanswered: (status, logPath) =>
      `Der Synthesizer hat auf die Aufwärmanfrage nicht geantwortet (${status}); siehe ${logPath}.`,
    weightsOnCpu:
      "Gewichte vorhanden; die Engine lädt auf der CPU — kein GPU-Adapter gefunden, daher wird eine Antwort um ein Mehrfaches langsamer als Echtzeit synthetisiert.",
    weightsOnDevice: (device) =>
      `Gewichte vorhanden; die Engine lädt auf ${device} und wechselt von selbst auf die CPU, wenn dort keine Sprache entsteht.`,
    weightsPresent: "Gewichte vorhanden.",
  },
  verbs: [
    "Abenteuern",
    "Alchemie",
    "Aufsteigen",
    "Brauen",
    "Kartieren",
    "Klettern",
    "Auftragen",
    "Kochen",
    "Herstellen",
    "Sprinten",
    "Ergründen",
    "Tauchen",
    "Verbessern",
    "Erkunden",
    "Farmen",
    "Angeln",
    "Sammeln",
    "Schmieden",
    "Einsammeln",
    "Gleiten",
    "Ernten",
    "Jagen",
    "Aufleveln",
    "Vermessen",
    "Abbauen",
    "Questen",
    "Verfeinern",
    "Ausruhen",
    "Rösten",
    "Segeln",
    "Kundschaften",
    "Rennen",
    "Begutachten",
    "Schwimmen",
    "Teleportieren",
    "Spurenlesen",
    "Wandern",
    "Umherstreifen",
    "Wegfinden",
    "Wünschen",
  ],
};

export default german;
