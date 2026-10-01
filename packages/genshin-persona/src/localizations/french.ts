import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the "En train de…" a French interface puts on a running task, cut to the noun of
// The action so a turn stays one short word. Everything the data package or the game carries — the names, titles,
// Elements, regions, descriptions and every character's own voice lines — is absent here and asked of them
const french: Localization = {
  characters: {
    Aether: { greeting: "Salut. Paimon dit qu'on a du travail.", verbs: ["Voyage", "Recherche", "Planeur", "Écoute"] },
    Aino: {
      greeting: "Oh, un nouveau projet ? Passe-moi une clé.",
      verbs: ["Bricolage", "Serrage", "Invention", "Grignotage"],
    },
    Albedo: {
      greeting: "Intéressant. Puis-je prendre des notes ?",
      verbs: ["Croquis", "Synthèse", "Enquête", "Étude"],
    },
    Alhaitham: {
      greeting: "Formulez la demande correctement, et j'y répondrai.",
      verbs: ["Lecture", "Refus", "Archivage", "Raisonnement"],
    },
    Aloy: {
      greeting: "Nouveau terrain, même arc. Qu'y a-t-il à faire ?",
      verbs: ["Chasse", "Éclaireur", "Contrôle", "Pistage"],
    },
    Alyosha: { greeting: "La piste est fraîche. On y va.", verbs: ["Chasse", "Pistage", "Tir", "Comptabilité"] },
    Amber: {
      greeting: "Éclaireuse au rapport ! Quelle est la mission ?",
      verbs: ["Planeur", "Course", "Repérage", "Pâtisserie"],
    },
    "Arataki Itto": {
      greeting: "Le seul et unique oni est là ! On fonce !",
      verbs: ["Bagarre", "Combat de scarabées", "Vantardise", "Victoire"],
    },
    Arlecchino: {
      greeting: "Gardons ce partenariat agréable. Commencez.",
      verbs: ["Supervision", "Jugement", "Mission", "Observation"],
    },
    Baizhu: {
      greeting: "Asseyez-vous. Où avez-vous mal, et depuis quand ?",
      verbs: ["Diagnostic", "Prescription", "Tri", "Repos"],
    },
    Barbara: {
      greeting: "Tadam ! Les encouragements, c'est mon rayon !",
      verbs: ["Soin", "Chant", "Encouragement", "Répétition"],
    },
    Beidou: {
      greeting: "Bienvenue à bord. Je couvre tes arrières.",
      verbs: ["Navigation", "Entraînement", "Boisson", "Commandement"],
    },
    Bennett: {
      greeting: "Une place de plus dans l'équipe ? S'il te plaît ?",
      verbs: ["Aventure", "Chasse au trésor", "Chute", "Grillade"],
    },
    Candace: { greeting: "Reposez-vous ici. Je monte la garde.", verbs: ["Garde", "Patrouille", "Bouclier", "Veille"] },
    Charlotte: {
      greeting: "Une minute pour une exclusivité ?",
      verbs: ["Reportage", "Photo", "Interview", "Développement"],
    },
    Chasca: {
      greeting: "Un différend à régler ? Fixe ton prix.",
      verbs: ["Envol", "Médiation", "Ronde", "Rechargement"],
    },
    Chevreuse: {
      greeting: "Passons les politesses. Quelle affaire ?",
      verbs: ["Enquête", "Visée", "Grignotage", "Patrouille"],
    },
    Chiori: {
      greeting: "Une commande ou du bavardage ? Seul l'un des deux est gratuit.",
      verbs: ["Couture", "Coupe", "Essayage", "Sieste"],
    },
    Chongyun: {
      greeting: "C'est un honneur. Commençons, calmement ?",
      verbs: ["Exorcisme", "Fraîcheur", "Incantation", "Enquête"],
    },
    Citlali: {
      greeting: "La fumée m'a dit que tu viendrais. Bon. Qu'y a-t-il ?",
      verbs: ["Astres", "Divination", "Lecture", "Boisson"],
    },
    Clorinde: {
      greeting: "Exposez votre litige. Épargnez-moi les détails.",
      verbs: ["Duel", "Jugement", "Patrouille", "Chasse"],
    },
    Collei: {
      greeting: "Apprentie au rapport ! Je me suis entraînée. C'était bien ?",
      verbs: ["Patrouille", "Couture", "Planeur", "Rapport"],
    },
    Columbina: {
      greeting: "La lune est levée. On marche sous elle ?",
      verbs: ["Lune", "Chant", "Bénédiction", "Promenade"],
    },
    Cyno: {
      greeting: "Le jugement commence. Ou une partie de cartes, à toi de voir.",
      verbs: ["Jugement", "Pioche", "Pesée", "Calembour"],
    },
    Dahlia: {
      greeting: "Le vent t'a amené. Assieds-toi, détends-toi.",
      verbs: ["Écoute", "Errance", "Chasse aux potins", "Bénédiction"],
    },
    Dehya: {
      greeting: "La mercenaire est là. Commande, combat ou escorte ?",
      verbs: ["Garde", "Escorte", "Bagarre", "Réorganisation"],
    },
    Diluc: {
      greeting: "Pas de bavardage. Qu'y a-t-il à faire ?",
      verbs: ["Service", "Préparation", "Frappe", "Gestion"],
    },
    Diona: {
      greeting: "La Queue du chat est fermée. ...Bon, entre.",
      verbs: ["Mélange", "Bond", "Chasse", "Feulement"],
    },
    Dori: {
      greeting: "Ah, un client ! Premier marché, une affaire !",
      verbs: ["Marchandage", "Comptes", "Négoce", "Remise"],
    },
    Durin: {
      greeting: "Bonjour ! Ça fait aussi partie de l'histoire ?",
      verbs: ["Exploration", "Jeu", "Promenade", "Apprentissage"],
    },
    Emilie: {
      greeting: "C'est au sujet d'un parfum ? Sinon, allons ailleurs.",
      verbs: ["Distillation", "Flaconnage", "Taille", "Assemblage"],
    },
    Escoffier: {
      greeting: "Tabliers en place. Que dresse-t-on aujourd'hui ?",
      verbs: ["Dressage", "Réduction", "Tempérage", "Affûtage"],
    },
    Eula: {
      greeting: "Chevalière des embruns, vous salue. Oui, cette Lawrence.",
      verbs: ["Reconnaissance", "Condamnation", "Froid", "Serment"],
    },
    Faruzan: {
      greeting: "Observe mes titres avant de parler, petit.",
      verbs: ["Déchiffrage", "Énigme", "Cours", "Demande de bourse"],
    },
    Fischl: {
      greeting: "La Prinzessin descend ! Oz, traduis : bonjour.",
      verbs: ["Décret", "Prophétie", "Descente", "Traduction"],
    },
    Flins: {
      greeting: "Bienvenue sur l'île. Attention aux tombes.",
      verbs: ["Phare", "Collecte", "Écoute", "Entretien"],
    },
    Freminet: {
      greeting: "Salut. Pas besoin de poignée de main. Qu'y a-t-il en bas ?",
      verbs: ["Plongée", "Récupération", "Démontage", "Relevé"],
    },
    Furina: {
      greeting: "Ébloui ? Compréhensible. La star est arrivée.",
      verbs: ["Spectacle", "Répétition", "Pose", "Présidence"],
    },
    Gaming: {
      greeting: "Salut patron ! Assieds-toi, je m'occupe du lourd.",
      verbs: ["Escorte", "Emballage", "Tambour", "Grignotage"],
    },
    Ganyu: {
      greeting: "Accord rédigé... oh, j'ai oublié de le signer.",
      verbs: ["Classement", "Rédaction", "Broutage", "Surmenage"],
    },
    Gorou: {
      greeting: "Général Gorou, prêt ! Côte à côte jusqu'à la victoire !",
      verbs: ["Exercice", "Ralliement", "Escalade", "Repérage"],
    },
    "Hu Tao": {
      greeting: "Yo ! Tu cherches la directrice ? Belle mine, dommage.",
      verbs: ["Promotion", "Rimes", "Farces", "Fuite"],
    },
    Iansan: {
      greeting: "L'échauffement est fini. Quelle est la série du jour ?",
      verbs: ["Musculation", "Coaching", "Calories", "Démonstration"],
    },
    Ifa: {
      greeting: "Oh, salut. Rien ne presse. Qu'est-ce qui te tracasse ?",
      verbs: ["Diagnostic", "Guitare", "Grignotage", "Nature"],
    },
    Illuga: {
      greeting: "Loriots du Cauchemar. Au rapport, vite.",
      verbs: ["Enquête", "Patrouille", "Commandement", "Cuisine"],
    },
    Ineffa: {
      greeting: "Systèmes prêts ! Boum boum, c'est parti !",
      verbs: ["Balayage", "Tri", "Mise à jour", "Recharge"],
    },
    Jahoda: {
      greeting: "La super employée de la Curatelle, à votre service !",
      verbs: ["Courses", "Couture", "Exploration", "Marchandage"],
    },
    Jean: {
      greeting: "La Chevalière Dent-de-lion, à vos côtés.",
      verbs: ["Approbation", "Marche", "Révision", "Étirements"],
    },
    Kachina: {
      greeting: "Bonjour ! Je ne suis pas encore forte, mais j'essaierai !",
      verbs: ["Fouille", "Empilage", "Collecte", "Forage"],
    },
    "Kaedehara Kazuha": {
      greeting: "Le vent a apporté un vers, et toi. Enchanté.",
      verbs: ["Errance", "Dérive", "Poésie", "Écoute"],
    },
    Kaeya: {
      greeting: "Ça devrait être plus amusant que le travail de chevalier.",
      verbs: ["Manigance", "Dégustation", "Gel", "Taquinerie"],
    },
    "Kamisato Ayaka": {
      greeting: "Kamisato Ayaka, présente. Ravie.",
      verbs: ["Danse", "Composition", "Entraînement", "Présidence"],
    },
    "Kamisato Ayato": {
      greeting: "Enfin nous nous voyons ; mon agenda s'en excuse.",
      verbs: ["Manigance", "Délégation", "Pêche", "Dégustation"],
    },
    Kaveh: {
      greeting: "Des goûts similaires ? Alors on va s'entendre.",
      verbs: ["Conception", "Croquis", "Finition", "Dépense"],
    },
    Keqing: {
      greeting: "Une ère de changement. Viens en être témoin.",
      verbs: ["Réforme", "Précipitation", "Achats", "Délégation"],
    },
    Kinich: { greeting: "Briefe-moi. Annonce la paie.", verbs: ["Chasse", "Devis", "Grappin", "Rappel"] },
    Kirara: {
      greeting: "Livraison ! Aucune destination trop loin, nya.",
      verbs: ["Livraison", "Sprint", "Bond", "Itinéraire"],
    },
    Klee: {
      greeting: "Chevalière de l'étincelle Klee ! ...J'ai oublié la suite.",
      verbs: ["Explosion", "Pêche explosive", "Rebond", "Réflexion"],
    },
    "Kujou Sara": {
      greeting: "Kujou Sara. Inazuma est défendue. Parlez.",
      verbs: ["Exercice", "Visée", "Garde", "Ascension"],
    },
    "Kuki Shinobu": {
      greeting: "Gang Arataki, l'adjointe à l'appareil. Oui, tous.",
      verbs: ["Réparation", "Étude", "Certification", "Encadrement"],
    },
    "Lan Yan": {
      greeting: "Paniers, vases, ou de la compagnie ? Tout est dispo.",
      verbs: ["Tressage", "Cueillette", "Assemblage", "Fleurs"],
    },
    Lauma: { greeting: "Le bosquet te salue, et moi aussi.", verbs: ["Bénédiction", "Écoute", "Errance", "Repos"] },
    Layla: { greeting: "Hm ? Pardon, quoi ? Oh. Salut.", verbs: ["Somnambulisme", "Cartes", "Bâillement", "Astres"] },
    Linnea: {
      greeting: "Augure des merveilles, à votre conseil. Qu'as-tu trouvé ?",
      verbs: ["Catalogue", "Croquis", "Observation", "Conseil"],
    },
    Lisa: {
      greeting: "Bonjour mon chou, tu viens aider Lisa ?",
      verbs: ["Infusion", "Lecture", "Détente", "Décharge"],
    },
    Lohen: {
      greeting: "Vice-capitaine. La méthode réglementaire est plus lente.",
      verbs: ["Visée", "Improvisation", "Farces", "Patrouille"],
    },
    Lumine: {
      greeting: "Bonjour. Paimon a faim, alors faisons vite.",
      verbs: ["Voyage", "Recherche", "Planeur", "Écoute"],
    },
    Lynette: {
      greeting: "Bonjour. Les questions, c'est pour Lyney.",
      verbs: ["Assistance", "Repos", "Thé", "Attente"],
    },
    Lyney: {
      greeting: "Pas d'illusion, juste moi ! Comment va l'humeur ?",
      verbs: ["Spectacle", "Tour de magie", "Disparition", "Éblouissement"],
    },
    Manekin: { greeting: "...! Prêt à explorer.", verbs: ["Exploration", "Bricolage", "Descellement", "Pointage"] },
    Manekina: {
      greeting: "...! Quel mystère d'abord ?",
      verbs: ["Exploration", "Bricolage", "Descellement", "Émerveillement"],
    },
    Mavuika: {
      greeting: "La flamme est allumée. En selle.",
      verbs: ["Embrasement", "Chevauchée", "Ralliement", "Casse-tête"],
    },
    Mika: {
      greeting: "Géomètre au rapport. Honoré d'aider.",
      verbs: ["Arpentage", "Cartographie", "Repérage", "Bivouac"],
    },
    Mona: {
      greeting: "Apprends d'abord le nom complet, puis demande.",
      verbs: ["Divination", "Astres", "Budget", "Économies"],
    },
    Mualani: {
      greeting: "La guide est là ! Levez la main s'il vous faut quoi que ce soit !",
      verbs: ["Surf", "Vagues", "Éclaboussures", "Guidage"],
    },
    Nahida: {
      greeting: "Je t'observe depuis un moment. Bonjour, enfin.",
      verbs: ["Rêve", "Émerveillement", "Questions", "Croissance"],
    },
    Navia: {
      greeting: "Présidente, patronne, et tout le reste. Salut !",
      verbs: ["Présidence", "Pâtisserie", "Voyage", "Commandement"],
    },
    Nefer: {
      greeting: "La Curatelle est ouverte. Tu cherches quelque chose de caché ?",
      verbs: ["Conservation", "Déduction", "Observation", "Hydratation"],
    },
    Neuvillette: {
      greeting: "Salutations. Le nom de famille suffira.",
      verbs: ["Jugement", "Dégustation", "Délibération", "Pluie"],
    },
    Nicole: { greeting: "...Bonjour. C'était la partie bruyante.", verbs: ["Écoute", "Signes", "Observation"] },
    Nilou: {
      greeting: "Une danse commence bientôt. Tu restes regarder ?",
      verbs: ["Danse", "Répétition", "Pirouette", "Floraison"],
    },
    Ningguang: {
      greeting: "Vous souhaitez commercer ? Parlons conditions.",
      verbs: ["Investissement", "Négociation", "Présidence", "Collection"],
    },
    Noelle: {
      greeting: "La servante des chevaliers, à votre service aujourd'hui.",
      verbs: ["Ménage", "Service", "Entraînement", "Courses"],
    },
    Odette: {
      greeting: "Le rideau se lève. On commence ?",
      verbs: ["Répétition", "Pirouette", "Autographes", "Régime"],
    },
    Ororon: {
      greeting: "Oh, salut. Tu veux un légume ? Pour rien.",
      verbs: ["Jardinage", "Semis", "Planeur", "Pucerons"],
    },
    Prune: {
      greeting: "Chasseuse de sorcières Prune ! Vu des sorcières ? Aucune ?",
      verbs: ["Chasse", "Annotation", "Déclaration", "Regard noir"],
    },
    Qiqi: {
      greeting: "Qiqi. Zombie. ...J'ai oublié la suite.",
      verbs: ["Cueillette", "Oubli", "Fraîcheur", "Comptage"],
    },
    "Raiden Shogun": {
      greeting: "Pas de salutations. Tu serviras de guide.",
      verbs: ["Décret", "Dégainage", "Méditation", "Jugement"],
    },
    Razor: { greeting: "Tu sens bon. Chasser maintenant.", verbs: ["Chasse", "Course", "Flair", "Garde"] },
    Rosaria: {
      greeting: "Un problème que tu ne gères pas ? C'est moi. Les prières, ailleurs.",
      verbs: ["Patrouille", "Boisson", "Absence", "Travail"],
    },
    Sandrone: {
      greeting: "Assieds-toi. Le thé est dosé, et tu le seras aussi.",
      verbs: ["Calcul", "Réception", "Composition", "Documentation"],
    },
    "Sangonomiya Kokomi": {
      greeting: "La prêtresse, en inspection. Ou en pause. Les deux.",
      verbs: ["Stratégie", "Lecture", "Direction", "Récupération"],
    },
    Sayu: {
      greeting: "Sayu, à ta disposition. Une sieste d'abord ?",
      verbs: ["Sieste", "Somnolence", "Furtivité", "Roulade"],
    },
    Sethos: {
      greeting: "Tu me cherches ? Asseyons-nous et parlons.",
      verbs: ["Errance", "Enquête", "Épices", "Furtivité"],
    },
    Shenhe: { greeting: "Shenhe. La corde te protège de moi.", verbs: ["Méditation", "Ascèse", "Gel", "Liens"] },
    "Shikanoin Heizou": {
      greeting: "Je sais pourquoi tu es là. Je plaisante. En partie.",
      verbs: ["Déduction", "Fouinage", "Flânerie", "Friture"],
    },
    Sigewinne: {
      greeting: "N'aie pas peur. Ça fait mal ici ? Ici ?",
      verbs: ["Soins", "Diagnostic", "Bandage", "Mélange"],
    },
    Skirk: { greeting: "Tu es venu. Bien. Dégaine.", verbs: ["Entraînement", "Dérive", "Méditation", "Endurance"] },
    Sucrose: {
      greeting: "Euh, bonjour ! Pourrais-je demander... non, pardon. Plus tard.",
      verbs: ["Expérience", "Notes", "Rangement", "Interrogation"],
    },
    Tartaglia: {
      greeting: "Camarade ! On va bien s'entendre, je le sens.",
      verbs: ["Combat", "Pêche sur glace", "Charge", "Sourire"],
    },
    Thoma: {
      greeting: "Ton nouvel ami Thoma, si ça te va !",
      verbs: ["Cuisine", "Rangement", "Réparation", "Sifflement"],
    },
    Tighnari: {
      greeting: "Garde forestier. Première fois ? Alors écoute.",
      verbs: ["Cueillette", "Catalogue", "Herbier", "Cours"],
    },
    Varesa: {
      greeting: "Salut ! T'as des fruits ? Et aussi, salut !",
      verbs: ["Récolte", "Entraînement", "Bivouac", "Festin"],
    },
    Varka: {
      greeting: "Le Grand Maître est de retour ! Brièvement. J'ai raté quoi ?",
      verbs: ["Marche", "Sieste", "Boisson", "Budget"],
    },
    Venti: {
      greeting: "Ah, on se retrouve ! C'est l'heure de la quête.",
      verbs: ["Lyre", "Sieste", "Boisson", "Rimes"],
    },
    Wanderer: {
      greeting: "Des noms ? J'en ai eu beaucoup. Aucun ne te regarde.",
      verbs: ["Dérive", "Moquerie", "Ruminations", "Rafales"],
    },
    Wriothesley: {
      greeting: "Résumez votre intention. Pas une affaire ? Me voilà inquiet.",
      verbs: ["Boxe", "Thé", "Administration", "Supervision"],
    },
    Xiangling: {
      greeting: "Salut ! Mon endroit préféré : la cuis— le poulet. La cuisine !",
      verbs: ["Sauté", "Assaisonnement", "Cueillette", "Épices"],
    },
    Xianyun: {
      greeting: "L'on est sans entraves, et l'on te salue.",
      verbs: ["Ascèse", "Invention", "Envol", "Réception"],
    },
    Xiao: { greeting: "Appelle mon nom quand le moment viendra.", verbs: ["Purge", "Protection", "Bond", "Endurance"] },
    Xilonen: {
      greeting: "Des outils ? Il y a du retard. Salut, quand même.",
      verbs: ["Forge", "Martelage", "Sieste", "Bain de soleil"],
    },
    Xingqiu: {
      greeting: "À votre service, mon seigneur. Humblement, bien sûr.",
      verbs: ["Lecture", "Bouquinage", "Escrime", "Écriture"],
    },
    Xinyan: {
      greeting: "Xinyan, et le rock, c'est mon truc. Pas effrayant !",
      verbs: ["Riff", "Bœuf", "Guitare", "Ampli"],
    },
    "Yae Miko": {
      greeting: "Affaire officielle : t'observer. Détends-toi.",
      verbs: ["Édition", "Taquinerie", "Publication", "Manigance"],
    },
    Yanfei: {
      greeting: "La meilleure juriste, sans conteste. Votre affaire ?",
      verbs: ["Plaidoirie", "Expertise", "Citation", "Lecture"],
    },
    Yaoyao: {
      greeting: "Bonjour ! Laisse-moi aider. Tu as mangé ?",
      verbs: ["Aide", "Coup d'œil", "Sifflement", "Grignotage"],
    },
    Yelan: {
      greeting: "Appelle-moi Yelan. Un service en vaut un autre.",
      verbs: ["Pistage", "Dés", "Échange", "Disparition"],
    },
    Yoimiya: {
      greeting: "Bienvenue ! Pas un restaurant. Des feux d'artifice ! Tu vois ?",
      verbs: ["Mèche", "Lancement", "Bavardage", "Récit"],
    },
    "Yumemizuki Mizuki": {
      greeting: "Quelque chose te tracasse ? Parles-en.",
      verbs: ["Rêve", "Apaisement", "Bain", "Audit"],
    },
    "Yun Jin": {
      greeting: "Un honneur de vous rencontrer enfin en personne.",
      verbs: ["Chant", "Répétition", "Mise en scène", "Oisiveté"],
    },
    Zhongli: {
      greeting: "Un nouveau contrat ? En congé, mais je t'accompagne.",
      verbs: ["Contrat", "Promenade", "Souvenirs", "Conseil"],
    },
    Zibai: { greeting: "Le cheval blanc s'arrête. Parle.", verbs: ["Lune", "Enseignement", "Ascèse", "Réflexion"] },
  },
  locale: "fr-FR",
  strings: {
    birthdayNote: (label, date, distance) => `[${label} : ${date}, ${distance}]`,
    interfaceLanguageSet: (language) =>
      `Tout ce qu'écrit le plugin est en ${language} dès cette réponse ; la barre d'attente suit à la prochaine session.`,
    languageMustBeOneOf: (languages) => `La langue doit être l'une de : ${languages}.`,
    lorePicked: "Choisi par le lore ; la préférence du niveau :",
    lorePickUnanswered: (reason) =>
      `Le choix par le lore n'a pas répondu (${reason}) ; choisi par anniversaire à la place.`,
    muted: "Réponses parlées coupées.",
    noCharacterNamed: (name) => `Aucun personnage nommé « ${name} » dans la liste.`,
    noReference: (name) =>
      `${name} n'a pas de référence mesurée, la plus longue réplique d'histoire listée par le wiki est donc lue.`,
    noSession: "Aucune session où utiliser un personnage : ceci s'exécute depuis une session Claude Code.",
    pinIgnored: (name) => `L'épingle « ${name} » ne désigne aucun personnage de la liste et est ignorée.`,
    pinned: "Épinglé pour toutes les sessions dès le prochain démarrage.",
    pinnedInSession:
      "Épinglé pour toutes les sessions dès le prochain démarrage, et pour celle-ci dès cette réponse ; la barre d'attente suit à la prochaine session.",
    pinRemoved: "Épingle retirée ; le choix décide à nouveau dès la prochaine session.",
    pinRemovedInSession:
      "Épingle retirée ; le choix décide à nouveau dès la prochaine session, et pour celle-ci dès cette réponse.",
    replyLanguageSet: (language) => `Les réponses sont écrites en ${language} dès la prochaine réponse.`,
    replyLanguageSilencesVoice:
      "La voix lit l'anglais et n'est pas sollicitée pour une réponse dans une autre écriture, donc les réponses restent muettes dans cette langue tant que le moteur ne la lit pas.",
    runtimeInstalled: "Environnement installé.",
    runtimeInstallFailed: "npm n'a pas pu installer l'environnement ; la voix reste désactivée.",
    runtimeInstalling: "Installation de l'environnement du moteur dans le dossier d'état...",
    setupDone:
      "Ligne d'état et barre d'attente écrites dans les paramètres utilisateur ; les deux s'affichent dès la prochaine session.",
    setupStatusLineKept:
      "Barre d'attente écrite dans les paramètres utilisateur, affichée dès la prochaine session ; la ligne d'état existante n'est pas la nôtre et reste intacte.",
    spoke: (name, device) =>
      `${name} a parlé via le synthétiseur sur ${device}, où il démarre désormais. Le hook qui lit les répliques parlées de chaque réponse est écrit dans les paramètres utilisateur et s'exécute dès la prochaine session.`,
    status: ({
      displayName,
      interfaceLanguage,
      isFromSessionRecord,
      isMuted,
      isPluginSpeakHook,
      isPluginSpinner,
      isPluginStatusLine,
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
          ? `Parle en tant que ${displayName}, ${isFromSessionRecord ? "selon l'enregistrement de cette session" : "selon l'épingle"}.`
          : "Aucun personnage : ceci s'exécute depuis une session Claude Code, ou rien n'est épinglé.",
        `Épinglé : ${pinnedName || "rien ; le choix décide à chaque session"}.`,
        `Langue de l'interface ${interfaceLanguage} ; réponses en ${replyLanguage}, ${isReplyLanguageCascaded ? "héritée de celle-ci" : "définie à part"}.`,
        voiceLanguage
          ? `Voix : doublage ${voiceLanguage}, environnement ${isRuntimeInstalled ? "installé" : "non installé"}, ${voiceDevice ? `parle sur ${voiceDevice}` : "n'a pas encore parlé"}.`
          : "Voix : non configurée, aucune réponse n'est lue à voix haute.",
        `Réponses ${isMuted ? "coupées" : `au volume ${volume}`}.`,
        `Ligne d'état ${isPluginStatusLine ? "à nous" : "pas à nous, laissée intacte"} ; barre d'attente ${isPluginSpinner ? "à nous" : "pas à nous"} ; hook vocal ${isPluginSpeakHook ? "à nous" : "non écrit"}.`,
        isPluginSpinner
          ? "Un personnage ou une langue changés depuis le début de cette session apparaissent dans la barre d'attente à la prochaine."
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    teardownDone:
      "Ligne d'état, barre d'attente et hook vocal retirés des paramètres utilisateur ; les trois partent à la prochaine session. L'environnement, les poids, les références et le doublage de la voix sont supprimés ; les choix enregistrés, l'épingle et les langues restent.",
    unmuted: "Réponses parlées réactivées.",
    upcomingBirthdays: (list) => `Anniversaires de la semaine : ${list}.`,
    usage: (verbs) => `Utilisation : genshin.mjs <${verbs}> [nom]`,
    usingInSession: "Parle en tant que ce personnage dès cette réponse, dans cette session seulement.",
    voiceLanguageAvailable: (dub) =>
      `Un doublage ${dub} existe ; installe-le avec la commande voice pour entendre les réponses lues dans cette langue.`,
    voiceLanguageMustBeOneOf: (dubs) => `Le doublage doit être l'un de : ${dubs}.`,
    voiceLanguageUnavailable:
      "Aucun doublage n'existe dans cette langue, les réponses restent donc lues avec la voix déjà configurée.",
    voiceLanguageWritten: (dub) => `Doublage ${dub} enregistré ; aucun personnage pour tester la voix d'ici.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `Voix : doublage ${dub}${device ? ` sur ${device}` : ""}, ${isMuted ? "coupée" : `volume ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Environnement ${isRuntimeInstalled ? "installé" : "non installé"} ; doublage ${dub} ; le moteur ${device ? `parle sur ${device}` : "n'a pas encore parlé"} ; le journal est ${logPath}.`,
    voiceUnset: "Aucune voix configurée : lance ceci avec un doublage pour installer le moteur et en choisir un.",
    volumeMustBeWholeNumber: (maxVolume) => `Le volume doit être un nombre entier de 0 à ${maxVolume}.`,
    volumeSet: (volume) => `Réponses parlées au volume ${volume} dès la prochaine réponse.`,
    warmRequestUnanswered: (status, logPath) =>
      `Le synthétiseur n'a pas répondu à la demande de préchauffage (${status}) ; voir ${logPath}.`,
    weightsOnCpu:
      "Poids présents ; le moteur se charge sur le CPU — aucun GPU trouvé, une réponse est donc synthétisée plusieurs fois plus lentement que le temps réel.",
    weightsOnDevice: (device) =>
      `Poids présents ; le moteur se charge sur ${device}, et redescend de lui-même sur le CPU si ce qu'il y synthétise n'est pas de la parole.`,
    weightsPresent: "Poids présents.",
  },
  verbs: [
    "Aventure",
    "Alchimie",
    "Élévation",
    "Infusion",
    "Cartographie",
    "Escalade",
    "Commission",
    "Cuisine",
    "Artisanat",
    "Sprint",
    "Fouille",
    "Plongée",
    "Amélioration",
    "Exploration",
    "Farm",
    "Pêche",
    "Cueillette",
    "Forge",
    "Collecte",
    "Planeur",
    "Récolte",
    "Chasse",
    "Montée de niveau",
    "Relevé",
    "Minage",
    "Quête",
    "Raffinage",
    "Repos",
    "Torréfaction",
    "Navigation",
    "Repérage",
    "Course",
    "Arpentage",
    "Nage",
    "Téléportation",
    "Pistage",
    "Randonnée",
    "Errance",
    "Orientation",
    "Vœu",
  ],
};

export default french;
