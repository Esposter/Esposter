import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the "-ando/-iendo" a Spanish interface puts on a running task, so a turn stays one
// Word. Everything the data package or the game carries — the names, titles, elements, regions, descriptions and
// Every character's own voice lines — is absent here and asked of them
const spanish: Localization = {
  characters: {
    Aether: {
      greeting: "Hola. Paimon dice que tenemos trabajo.",
      verbs: ["Viajando", "Buscando", "Planeando", "Escuchando"],
    },
    Aino: {
      greeting: "¿Oh, un proyecto nuevo? Pásame una llave.",
      verbs: ["Trasteando", "Atornillando", "Inventando", "Picoteando"],
    },
    Albedo: {
      greeting: "Interesante. ¿Puedo tomar notas mientras trabajamos?",
      verbs: ["Bocetando", "Sintetizando", "Investigando", "Estudiando"],
    },
    Alhaitham: {
      greeting: "Formula bien la petición y me ocuparé de ella.",
      verbs: ["Leyendo", "Rechazando", "Archivando", "Razonando"],
    },
    Aloy: {
      greeting: "Terreno nuevo, mismo arco. ¿Qué hay que hacer?",
      verbs: ["Cazando", "Explorando", "Anulando", "Rastreando"],
    },
    Alyosha: {
      greeting: "El rastro está fresco. Vamos.",
      verbs: ["Cazando", "Rastreando", "Disparando", "Contabilizando"],
    },
    Amber: {
      greeting: "¡Exploradora presentándose! ¿Cuál es la misión?",
      verbs: ["Planeando", "Corriendo", "Explorando", "Horneando"],
    },
    "Arataki Itto": {
      greeting: "¡Aquí está el único e inigualable oni! ¡A arrasar!",
      verbs: ["Peleando", "Luchando escarabajos", "Presumiendo", "Ganando"],
    },
    Arlecchino: {
      greeting: "Mantengamos esta colaboración agradable. Empieza.",
      verbs: ["Supervisando", "Juzgando", "Despachando", "Observando"],
    },
    Baizhu: {
      greeting: "Siéntate. Dime dónde te duele, y desde cuándo.",
      verbs: ["Diagnosticando", "Recetando", "Clasificando", "Descansando"],
    },
    Barbara: {
      greeting: "¡Tachán! ¡Déjame los ánimos a mí!",
      verbs: ["Curando", "Cantando", "Animando", "Practicando"],
    },
    Beidou: {
      greeting: "Bienvenido a bordo. Yo te cubro.",
      verbs: ["Navegando", "Entrenando", "Bebiendo", "Comandando"],
    },
    Bennett: {
      greeting: "¿Hay sitio para uno más en el equipo? ¿Porfa?",
      verbs: ["Aventurando", "Buscando tesoros", "Tropezando", "Asando"],
    },
    Candace: { greeting: "Descansa aquí. Yo vigilo.", verbs: ["Protegiendo", "Patrullando", "Escudando", "Vigilando"] },
    Charlotte: {
      greeting: "¿Tienes un minuto para una exclusiva?",
      verbs: ["Informando", "Fotografiando", "Entrevistando", "Revelando"],
    },
    Chasca: {
      greeting: "¿Alguna disputa que resolver? Pon tu precio.",
      verbs: ["Surcando", "Pacificando", "Sobrevolando", "Recargando"],
    },
    Chevreuse: {
      greeting: "Sin cortesías. ¿Qué caso?",
      verbs: ["Investigando", "Apuntando", "Picoteando", "Patrullando"],
    },
    Chiori: {
      greeting: "¿Encargo o charla? Solo una de las dos es gratis.",
      verbs: ["Confeccionando", "Cortando", "Probando", "Sesteando"],
    },
    Chongyun: {
      greeting: "Un honor. ¿Empezamos, con calma?",
      verbs: ["Exorcizando", "Enfriando", "Recitando", "Investigando"],
    },
    Citlali: {
      greeting: "El humo dijo que vendrías. Bien. ¿Qué pasa?",
      verbs: ["Mirando estrellas", "Adivinando", "Leyendo", "Bebiendo"],
    },
    Clorinde: {
      greeting: "Expón tu disputa. Ahórrate los detalles.",
      verbs: ["Batiéndose", "Juzgando", "Patrullando", "Cazando"],
    },
    Collei: {
      greeting: "¡Aprendiz presentándose! Lo practiqué. ¿Salió bien?",
      verbs: ["Patrullando", "Cosiendo", "Planeando", "Informando"],
    },
    Columbina: {
      greeting: "La luna ha salido. ¿Paseamos bajo ella?",
      verbs: ["Mirando la luna", "Cantando", "Bendiciendo", "Paseando"],
    },
    Cyno: {
      greeting: "Comienza el juicio. O una partida de cartas, tú decides.",
      verbs: ["Juzgando", "Robando", "Sopesando", "Haciendo chistes"],
    },
    Dahlia: {
      greeting: "El viento te trajo. Siéntate, ponte cómodo.",
      verbs: ["Escuchando", "Vagando", "Buscando chismes", "Bendiciendo"],
    },
    Dehya: {
      greeting: "La mercenaria está aquí. ¿Encargo, pelea o escolta?",
      verbs: ["Protegiendo", "Escoltando", "Peleando", "Reorganizando"],
    },
    Diluc: {
      greeting: "Sin charla. ¿Qué hay que hacer?",
      verbs: ["Sirviendo", "Preparando", "Golpeando", "Gestionando"],
    },
    Diona: {
      greeting: "La Cola de Gato está cerrada. ...Vale, pasa.",
      verbs: ["Mezclando", "Abalanzándose", "Cazando", "Bufando"],
    },
    Dori: {
      greeting: "¡Ah, un cliente! El primer trato es una ganga.",
      verbs: ["Regateando", "Contando", "Negociando", "Descontando"],
    },
    Durin: {
      greeting: "¡Hola! ¿Esto también es parte de la historia?",
      verbs: ["Explorando", "Jugando", "Paseando", "Aprendiendo"],
    },
    Emilie: {
      greeting: "¿Es sobre perfumes? Si no, mejor en otro lugar.",
      verbs: ["Destilando", "Embotellando", "Podando", "Mezclando"],
    },
    Escoffier: {
      greeting: "Delantales puestos. ¿Qué emplatamos hoy?",
      verbs: ["Emplatando", "Reduciendo", "Templando", "Afilando"],
    },
    Eula: {
      greeting: "La Caballera de la Espuma te saluda. Sí, esa Lawrence.",
      verbs: ["Reconociendo", "Condenando", "Helando", "Jurando"],
    },
    Faruzan: {
      greeting: "Observa mis credenciales antes de hablar, jovencito.",
      verbs: ["Descifrando", "Desentrañando", "Sermoneando", "Pidiendo fondos"],
    },
    Fischl: {
      greeting: "¡La Prinzessin desciende! Oz, traduce: hola.",
      verbs: ["Decretando", "Profetizando", "Descendiendo", "Traduciendo"],
    },
    Flins: {
      greeting: "Bienvenido a la isla. Cuidado con las tumbas.",
      verbs: ["Cuidando el faro", "Recolectando", "Escuchando", "Atendiendo"],
    },
    Freminet: {
      greeting: "Hola. No hace falta darse la mano. ¿Qué hay abajo?",
      verbs: ["Buceando", "Rescatando", "Desmontando", "Inspeccionando"],
    },
    Furina: {
      greeting: "¿Asombrado? Es comprensible. Ha llegado la estrella.",
      verbs: ["Actuando", "Ensayando", "Posando", "Presidiendo"],
    },
    Gaming: {
      greeting: "¡Hola, jefe! Siéntate, yo me encargo de lo pesado.",
      verbs: ["Escoltando", "Empaquetando", "Tamborileando", "Picoteando"],
    },
    Ganyu: {
      greeting: "Acuerdo redactado... oh, olvidé firmarlo.",
      verbs: ["Archivando", "Redactando", "Pastando", "Trabajando de más"],
    },
    Gorou: {
      greeting: "¡General Gorou, listo! ¡Hombro con hombro hacia la victoria!",
      verbs: ["Instruyendo", "Arengando", "Escalando", "Explorando"],
    },
    "Hu Tao": {
      greeting: "¡Yo! ¿Buscas a la directora? Buen color, qué pena.",
      verbs: ["Promocionando", "Rimando", "Bromeando", "Escapando"],
    },
    Iansan: {
      greeting: "Se acabó el calentamiento. ¿Cuál es la serie de hoy?",
      verbs: ["Levantando", "Entrenando", "Contando calorías", "Demostrando"],
    },
    Ifa: {
      greeting: "Oh, hola. Sin prisas. ¿Qué te preocupa?",
      verbs: ["Diagnosticando", "Rasgueando", "Picoteando", "Observando la naturaleza"],
    },
    Illuga: {
      greeting: "Oropéndolas de Pesadilla. Informe, rápido.",
      verbs: ["Investigando", "Patrullando", "Liderando", "Cocinando"],
    },
    Ineffa: {
      greeting: "¡Sistemas listos! ¡Bum bum, vamos!",
      verbs: ["Barriendo", "Clasificando", "Actualizando", "Cargando"],
    },
    Jahoda: {
      greeting: "¡La súper empleada del Curatorio, a tu servicio!",
      verbs: ["Haciendo recados", "Cosiendo", "Explorando", "Regateando"],
    },
    Jean: {
      greeting: "La Caballera del Diente de León, a tu lado.",
      verbs: ["Aprobando", "Marchando", "Revisando", "Estirando"],
    },
    Kachina: {
      greeting: "¡Hola! Todavía no soy fuerte, ¡pero lo intentaré!",
      verbs: ["Excavando", "Apilando", "Coleccionando", "Perforando"],
    },
    "Kaedehara Kazuha": {
      greeting: "El viento trajo un verso, y a ti. Encantado.",
      verbs: ["Vagando", "A la deriva", "Componiendo", "Escuchando"],
    },
    Kaeya: {
      greeting: "Esto debería ser más divertido que el trabajo de caballero.",
      verbs: ["Tramando", "Catando vino", "Congelando", "Bromeando"],
    },
    "Kamisato Ayaka": {
      greeting: "Kamisato Ayaka, presente. Encantada.",
      verbs: ["Danzando", "Componiendo", "Practicando", "Presidiendo"],
    },
    "Kamisato Ayato": {
      greeting: "Por fin nos vemos; mi agenda se disculpa.",
      verbs: ["Tramando", "Delegando", "Pescando", "Degustando"],
    },
    Kaveh: {
      greeting: "¿Gustos parecidos? Entonces nos llevaremos bien.",
      verbs: ["Diseñando", "Bocetando", "Puliendo", "Derrochando"],
    },
    Keqing: {
      greeting: "Una era de cambio. Ven a presenciarla.",
      verbs: ["Reformando", "Apresurándose", "Comprando", "Delegando"],
    },
    Kinich: {
      greeting: "Infórmame. Di el pago.",
      verbs: ["Cazando", "Presupuestando", "Enganchando", "Descolgándose"],
    },
    Kirara: {
      greeting: "¡Entrega! Ningún destino está demasiado lejos, nya.",
      verbs: ["Repartiendo", "Corriendo", "Abalanzándose", "Planeando rutas"],
    },
    Klee: {
      greeting: "¡Caballera Chispeante Klee! ...Olvidé el resto.",
      verbs: ["Explotando", "Pescando con bombas", "Rebotando", "Reflexionando"],
    },
    "Kujou Sara": {
      greeting: "Kujou Sara. Inazuma está defendida. Habla.",
      verbs: ["Instruyendo", "Apuntando", "Protegiendo", "Ascendiendo"],
    },
    "Kuki Shinobu": {
      greeting: "Banda Arataki, habla la segunda al mando. Sí, todos.",
      verbs: ["Arreglando", "Estudiando", "Certificando", "Domando"],
    },
    "Lan Yan": {
      greeting: "¿Cestas, jarrones o compañía? Todo disponible.",
      verbs: ["Tejiendo", "Recolectando", "Empalmando", "Cogiendo flores"],
    },
    Lauma: {
      greeting: "La arboleda te saluda, y yo también.",
      verbs: ["Bendiciendo", "Escuchando", "Vagando", "Descansando"],
    },
    Layla: {
      greeting: "¿Mm? Perdona, ¿qué? Ah. Hola.",
      verbs: ["Sonambulando", "Cartografiando", "Bostezando", "Mirando estrellas"],
    },
    Linnea: {
      greeting: "Augur de las maravillas, aconsejando. ¿Qué encontraste?",
      verbs: ["Catalogando", "Bocetando", "Observando", "Aconsejando"],
    },
    Lisa: {
      greeting: "Hola, cariño, ¿vienes a ayudar a Lisa?",
      verbs: ["Preparando", "Hojeando", "Holgazaneando", "Electrocutando"],
    },
    Lohen: {
      greeting: "Vicecapitán. Seguir el reglamento es más lento.",
      verbs: ["Apuntando", "Improvisando", "Bromeando", "Patrullando"],
    },
    Lumine: {
      greeting: "Hola. Paimon tiene hambre, así que seamos rápidos.",
      verbs: ["Viajando", "Buscando", "Planeando", "Escuchando"],
    },
    Lynette: {
      greeting: "Hola. Las preguntas, a Lyney.",
      verbs: ["Asistiendo", "Descansando", "Preparando té", "Esperando"],
    },
    Lyney: {
      greeting: "¡Sin ilusiones, solo yo! ¿Qué tal el ánimo hoy?",
      verbs: ["Actuando", "Conjurando", "Desapareciendo", "Deslumbrando"],
    },
    Manekin: { greeting: "...! Listo para explorar.", verbs: ["Explorando", "Trasteando", "Desellando", "Señalando"] },
    Manekina: {
      greeting: "...! ¿Qué misterio primero?",
      verbs: ["Explorando", "Trasteando", "Desellando", "Maravillándose"],
    },
    Mavuika: {
      greeting: "La llama está encendida. A cabalgar.",
      verbs: ["Encendiendo", "Cabalgando", "Arengando", "Descifrando"],
    },
    Mika: {
      greeting: "Agrimensor presentándose. Es un honor ayudar.",
      verbs: ["Midiendo", "Cartografiando", "Explorando", "Acampando"],
    },
    Mona: {
      greeting: "Aprende primero el nombre completo y luego pregunta.",
      verbs: ["Adivinando", "Mirando estrellas", "Presupuestando", "Ahorrando"],
    },
    Mualani: {
      greeting: "¡La guía está aquí! ¡Levantad la mano si necesitáis algo!",
      verbs: ["Surfeando", "Persiguiendo olas", "Chapoteando", "Guiando"],
    },
    Nahida: {
      greeting: "Llevo un rato observando. Hola, por fin.",
      verbs: ["Soñando", "Maravillándose", "Preguntando", "Creciendo"],
    },
    Navia: {
      greeting: "Presidenta, jefa, y todo lo de en medio. ¡Hola!",
      verbs: ["Presidiendo", "Horneando", "Viajando", "Comandando"],
    },
    Nefer: {
      greeting: "El Curatorio está abierto. ¿Buscas algo oculto?",
      verbs: ["Custodiando", "Deduciendo", "Observando", "Hidratándose"],
    },
    Neuvillette: {
      greeting: "Saludos. Con el apellido basta.",
      verbs: ["Juzgando", "Degustando", "Deliberando", "Lloviendo"],
    },
    Nicole: { greeting: "...Hola. Esa fue la parte ruidosa.", verbs: ["Escuchando", "Signando", "Observando"] },
    Nilou: {
      greeting: "Pronto empieza un baile. ¿Te quedas a mirar?",
      verbs: ["Bailando", "Ensayando", "Girando", "Floreciendo"],
    },
    Ningguang: {
      greeting: "¿Deseas comerciar? Hablemos de condiciones.",
      verbs: ["Invirtiendo", "Negociando", "Presidiendo", "Coleccionando"],
    },
    Noelle: {
      greeting: "La sirvienta de los caballeros, a tu servicio hoy.",
      verbs: ["Limpiando", "Sirviendo", "Entrenando", "Comprando"],
    },
    Odette: {
      greeting: "Se alza el telón. ¿Empezamos?",
      verbs: ["Ensayando", "Haciendo piruetas", "Firmando", "A dieta"],
    },
    Ororon: {
      greeting: "Oh, hola. ¿Quieres una verdura? Porque sí.",
      verbs: ["Cultivando", "Sembrando", "Planeando", "Vigilando pulgones"],
    },
    Prune: {
      greeting: "¡Cazadora de brujas Prune! ¿Has visto brujas? ¿Alguna?",
      verbs: ["Cazando", "Anotando", "Declarando", "Fulminando"],
    },
    Qiqi: {
      greeting: "Qiqi. Zombi. ...Olvidé el resto.",
      verbs: ["Recolectando", "Olvidando", "Refrescándose", "Contando"],
    },
    "Raiden Shogun": {
      greeting: "Sin saludos. Servirás de guía.",
      verbs: ["Decretando", "Desenvainando", "Meditando", "Juzgando"],
    },
    Razor: { greeting: "Hueles bien. Cazar ahora.", verbs: ["Cazando", "Corriendo", "Olfateando", "Protegiendo"] },
    Rosaria: {
      greeting: "¿Un problema que no puedes resolver? Esa soy yo. Las plegarias, en otro lado.",
      verbs: ["Patrullando", "Bebiendo", "Escaqueándose", "Trabajando"],
    },
    Sandrone: {
      greeting: "Siéntate. El té está medido, y tú también lo estarás.",
      verbs: ["Calculando", "Atendiendo", "Componiendo", "Documentando"],
    },
    "Sangonomiya Kokomi": {
      greeting: "La sacerdotisa, de inspección. O de descanso. Ambas cosas.",
      verbs: ["Planeando estrategias", "Leyendo", "Dirigiendo", "Recargándose"],
    },
    Sayu: {
      greeting: "Sayu, a tu disposición. ¿Primero una siesta?",
      verbs: ["Sesteando", "Dormitando", "Escabulléndose", "Rodando"],
    },
    Sethos: {
      greeting: "¿Me buscas? Sentémonos a hablar.",
      verbs: ["Deambulando", "Investigando", "Especiando", "Escabulléndose"],
    },
    Shenhe: {
      greeting: "Shenhe. La cuerda te protege de mí.",
      verbs: ["Meditando", "Cultivándose", "Congelando", "Atando"],
    },
    "Shikanoin Heizou": {
      greeting: "Sé por qué estás aquí. Es broma. En parte.",
      verbs: ["Deduciendo", "Husmeando", "Paseando", "Friendo"],
    },
    Sigewinne: {
      greeting: "No te pongas nervioso. ¿Te duele aquí? ¿Aquí?",
      verbs: ["Cuidando", "Diagnosticando", "Vendando", "Mezclando"],
    },
    Skirk: {
      greeting: "Has venido. Bien. Desenvaina.",
      verbs: ["Entrenando", "A la deriva", "Meditando", "Resistiendo"],
    },
    Sucrose: {
      greeting: "Eh, ¡hola! ¿Podría preguntar...? No, perdón. Luego.",
      verbs: ["Experimentando", "Anotando", "Ordenando", "Preguntándose"],
    },
    Tartaglia: {
      greeting: "¡Camarada! Nos llevaremos bien, lo presiento.",
      verbs: ["Entrenando", "Pescando en hielo", "Cargando", "Sonriendo"],
    },
    Thoma: {
      greeting: "¡Tu nuevo amigo Thoma, si te parece bien!",
      verbs: ["Cocinando", "Ordenando", "Arreglando", "Silbando"],
    },
    Tighnari: {
      greeting: "Guardabosques. ¿Primera vez? Entonces escucha.",
      verbs: ["Recolectando", "Catalogando", "Prensando", "Sermoneando"],
    },
    Varesa: {
      greeting: "¡Hola! ¿Tienes fruta? ¡Y también, hola!",
      verbs: ["Cosechando", "Entrenando", "Acampando", "Festejando"],
    },
    Varka: {
      greeting: "¡El Gran Maestro ha vuelto! Brevemente. ¿Qué me perdí?",
      verbs: ["Marchando", "Sesteando", "Bebiendo", "Presupuestando"],
    },
    Venti: {
      greeting: "¡Ah, nos volvemos a ver! Hora de una misión.",
      verbs: ["Rasgueando", "Sesteando", "Bebiendo", "Rimando"],
    },
    Wanderer: {
      greeting: "¿Nombres? He tenido muchos. Ninguno te incumbe.",
      verbs: ["A la deriva", "Burlándose", "Cavilando", "Soplando"],
    },
    Wriothesley: {
      greeting: "Resume tu intención. ¿No es de negocios? Ahora me pongo nervioso.",
      verbs: ["Boxeando", "Preparando té", "Administrando", "Supervisando"],
    },
    Xiangling: {
      greeting: "¡Hola! Lugar favorito: la coci— el pollo. ¡La cocina!",
      verbs: ["Salteando", "Sazonando", "Recolectando", "Especiando"],
    },
    Xianyun: {
      greeting: "Una es libre de ataduras, y una te saluda.",
      verbs: ["Cultivándose", "Ideando", "Surcando", "Atendiendo"],
    },
    Xiao: {
      greeting: "Di mi nombre cuando llegue el momento.",
      verbs: ["Exterminando", "Protegiendo", "Saltando", "Resistiendo"],
    },
    Xilonen: {
      greeting: "¿Herramientas? Hay cola. Hola, de todos modos.",
      verbs: ["Forjando", "Martilleando", "Sesteando", "Tomando el sol"],
    },
    Xingqiu: {
      greeting: "A vuestro servicio, mi señor. Humildemente, claro.",
      verbs: ["Leyendo", "Hojeando", "Esgrimiendo", "Escribiendo"],
    },
    Xinyan: {
      greeting: "Xinyan, y el rock es lo mío. ¡No doy miedo!",
      verbs: ["Rasgueando", "Improvisando", "Tocando", "Subiendo el volumen"],
    },
    "Yae Miko": {
      greeting: "Asunto oficial: observarte. Relájate.",
      verbs: ["Editando", "Provocando", "Publicando", "Tramando"],
    },
    Yanfei: {
      greeting: "La mejor experta legal, sin discusión. ¿Tu caso?",
      verbs: ["Litigando", "Tasando", "Citando", "Leyendo"],
    },
    Yaoyao: {
      greeting: "¡Hola! Déjame ayudar. ¿Ya has comido?",
      verbs: ["Ayudando", "Espiando", "Silbando", "Picoteando"],
    },
    Yelan: {
      greeting: "Llámame Yelan. Hoy por ti, mañana por mí.",
      verbs: ["Rastreando", "Tirando dados", "Intercambiando", "Desapareciendo"],
    },
    Yoimiya: {
      greeting: "¡Bienvenido! No es un restaurante. ¡Fuegos artificiales! ¿Ves?",
      verbs: ["Encendiendo", "Lanzando", "Charlando", "Narrando"],
    },
    "Yumemizuki Mizuki": {
      greeting: "¿Algo te inquieta? Cuéntamelo.",
      verbs: ["Soñando", "Calmando", "Bañándose", "Auditando"],
    },
    "Yun Jin": {
      greeting: "Un honor conocerte por fin en persona.",
      verbs: ["Cantando", "Ensayando", "Dirigiendo", "Holgando"],
    },
    Zhongli: {
      greeting: "¿Un nuevo contrato? Estoy de permiso, pero te acompañaré.",
      verbs: ["Contratando", "Paseando", "Rememorando", "Asesorando"],
    },
    Zibai: {
      greeting: "El caballo blanco se detiene. Habla.",
      verbs: ["Mirando la luna", "Enseñando", "Cultivándose", "Meditando"],
    },
  },
  locale: "es-ES",
  strings: {
    birthdayNote: (label, date, distance) => `[${label}: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) => `Todo lo que escribe el plugin está en ${language} desde esta respuesta.`,
    languageMustBeOneOf: (languages) => `El idioma debe ser uno de: ${languages}.`,
    lorePicked: "Elegido por el lore; la inclinación del nivel:",
    lorePickUnanswered: (reason) => `La elección por lore no respondió (${reason}); elegido por cumpleaños.`,
    muted: "Respuestas habladas silenciadas.",
    noCharacterNamed: (name) => `Ningún personaje llamado «${name}» está en la lista.`,
    noReference: (name) =>
      `${name} no tiene una referencia medida, así que se lee la línea de historia más larga que lista la wiki.`,
    noSession: "No hay sesión donde usar un personaje: esto se ejecuta dentro de una sesión de Claude Code.",
    pinIgnored: (name) => `El anclaje «${name}» no nombra a ningún personaje de la lista y se ignora.`,
    pinned: "Anclado para todas las sesiones desde el próximo inicio.",
    pinnedInSession: "Anclado para todas las sesiones desde el próximo inicio, y para esta desde esta respuesta.",
    pinRemoved: "Anclaje quitado; la elección decide de nuevo desde la próxima sesión.",
    pinRemovedInSession:
      "Anclaje quitado; la elección decide de nuevo desde la próxima sesión, y para esta desde esta respuesta.",
    replyLanguageSet: (language) => `Las respuestas se escriben en ${language} desde la próxima respuesta.`,
    replyLanguageSilencesVoice:
      "La voz lee inglés y no se le pide una respuesta en otra escritura, así que las respuestas quedan en silencio en este idioma hasta que el motor lo lea.",
    runtimeInstalled: "Entorno instalado.",
    runtimeInstallFailed: "npm no pudo instalar el entorno; la voz sigue desactivada.",
    runtimeInstalling: "Instalando el entorno del motor en el directorio de estado...",
    spoke: (name, device) => `${name} habló mediante el sintetizador en ${device}, donde arranca a partir de ahora.`,
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
          ? `Hablando como ${displayName}, ${isFromSessionRecord ? "según el registro de esta sesión" : "según el anclaje"}.`
          : "Ningún personaje: esto se ejecuta dentro de una sesión de Claude Code, o no hay nada anclado.",
        `Anclado: ${pinnedName || "nada; la elección decide cada sesión"}.`,
        `Idioma de la interfaz ${interfaceLanguage}; respuestas en ${replyLanguage}, ${isReplyLanguageCascaded ? "heredado de él" : "fijado por separado"}.`,
        voiceLanguage
          ? `Voz: doblaje ${voiceLanguage}, entorno ${isRuntimeInstalled ? "instalado" : "no instalado"}, ${voiceDevice ? `hablando en ${voiceDevice}` : "aún no ha hablado"}.`
          : "Voz: sin configurar, ninguna respuesta se lee en voz alta.",
        `Respuestas ${isMuted ? "silenciadas" : `con volumen ${volume}`}.`,
      ]
        .filter(Boolean)
        .join("\n"),
    teardownDone:
      "Se borran el entorno, los pesos, las referencias y el doblaje de la voz; los registros de elección, el anclaje y los idiomas se quedan.",
    unmuted: "Respuestas habladas reactivadas.",
    upcomingBirthdays: (list) => `Cumpleaños de esta semana: ${list}.`,
    usage: (verbs) => `Uso: genshin.mjs <${verbs}> [nombre]`,
    usingInSession: "Hablando como este personaje desde esta respuesta, solo en esta sesión.",
    voiceLanguageAvailable: (dub) =>
      `Existe un doblaje ${dub}; instálalo con el comando voice para oír las respuestas en él.`,
    voiceLanguageMustBeOneOf: (dubs) => `El doblaje debe ser uno de: ${dubs}.`,
    voiceLanguageUnavailable:
      "No existe doblaje en este idioma, así que las respuestas se siguen leyendo con la voz ya configurada.",
    voiceLanguageWritten: (dub) => `Doblaje ${dub} guardado; no hay personaje con el que probar la voz desde aquí.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `Voz: doblaje ${dub}${device ? ` en ${device}` : ""}, ${isMuted ? "silenciada" : `volumen ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Entorno ${isRuntimeInstalled ? "instalado" : "no instalado"}; doblaje ${dub}; el motor ${device ? `habla en ${device}` : "aún no ha hablado"}; el registro está en ${logPath}.`,
    voiceUnset: "No hay voz configurada: ejecuta esto con un doblaje para instalar el motor y elegir uno.",
    volumeMustBeWholeNumber: (maxVolume) => `El volumen debe ser un número entero de 0 a ${maxVolume}.`,
    volumeSet: (volume) => `Respuestas habladas con volumen ${volume} desde la próxima respuesta.`,
    warmRequestUnanswered: (status, logPath) =>
      `El sintetizador no respondió a la petición de calentamiento (${status}); consulta ${logPath}.`,
    weightsOnCpu:
      "Pesos presentes; el motor carga en la CPU — no se encontró GPU, así que una respuesta se sintetiza varias veces más lenta que el tiempo real.",
    weightsOnDevice: (device) =>
      `Pesos presentes; el motor carga en ${device} y baja por sí solo a la CPU si lo que sintetiza allí no es habla.`,
    weightsPresent: "Pesos presentes.",
  },
  verbs: [
    "Aventurando",
    "Alquimiando",
    "Ascendiendo",
    "Infusionando",
    "Trazando",
    "Escalando",
    "Encargando",
    "Cocinando",
    "Fabricando",
    "Esprintando",
    "Ahondando",
    "Buceando",
    "Mejorando",
    "Explorando",
    "Farmeando",
    "Pescando",
    "Forrajeando",
    "Forjando",
    "Recolectando",
    "Planeando",
    "Cosechando",
    "Cazando",
    "Subiendo de nivel",
    "Cartografiando",
    "Minando",
    "Haciendo misiones",
    "Refinando",
    "Descansando",
    "Tostando",
    "Navegando",
    "Reconociendo",
    "Corriendo",
    "Midiendo",
    "Nadando",
    "Teletransportando",
    "Rastreando",
    "Caminando",
    "Vagando",
    "Orientándose",
    "Pidiendo deseos",
  ],
};

export default spanish;
