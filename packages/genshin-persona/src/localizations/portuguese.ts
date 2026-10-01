import type { Localization } from "#src/models/Localization";

// The spinner's gerunds read as the "-ando/-endo" a Portuguese interface puts on a running task, so a turn stays one
// Word. Everything the data package or the game carries — the names, titles, elements, regions, descriptions and
// Every character's own voice lines — is absent here and asked of them
const portuguese: Localization = {
  characters: {
    Aether: {
      greeting: "Oi. A Paimon disse que temos trabalho.",
      verbs: ["Viajando", "Procurando", "Planando", "Ouvindo"],
    },
    Aino: {
      greeting: "Opa, um projeto novo? Me passa uma chave inglesa.",
      verbs: ["Mexendo", "Apertando", "Inventando", "Beliscando"],
    },
    Albedo: {
      greeting: "Interessante. Posso fazer anotações enquanto trabalhamos?",
      verbs: ["Esboçando", "Sintetizando", "Investigando", "Estudando"],
    },
    Alhaitham: {
      greeting: "Formule o pedido direito e eu cuido dele.",
      verbs: ["Lendo", "Rejeitando", "Arquivando", "Raciocinando"],
    },
    Aloy: {
      greeting: "Terreno novo, mesmo arco. O que precisa ser feito?",
      verbs: ["Caçando", "Explorando", "Sobrescrevendo", "Rastreando"],
    },
    Alyosha: {
      greeting: "O rastro está fresco. Vamos.",
      verbs: ["Caçando", "Rastreando", "Atirando", "Fazendo contas"],
    },
    Amber: {
      greeting: "Batedora se apresentando! Qual é a missão?",
      verbs: ["Planando", "Correndo", "Patrulhando", "Assando"],
    },
    "Arataki Itto": {
      greeting: "O único e incomparável oni chegou! Vamos arrebentar!",
      verbs: ["Brigando", "Lutando com besouros", "Se gabando", "Vencendo"],
    },
    Arlecchino: {
      greeting: "Mantenhamos esta parceria agradável. Comece.",
      verbs: ["Supervisionando", "Julgando", "Despachando", "Observando"],
    },
    Baizhu: {
      greeting: "Sente-se. Diga onde dói, e desde quando.",
      verbs: ["Diagnosticando", "Receitando", "Separando", "Descansando"],
    },
    Barbara: {
      greeting: "Tcharam! Deixa o incentivo comigo!",
      verbs: ["Curando", "Cantando", "Torcendo", "Ensaiando"],
    },
    Beidou: {
      greeting: "Bem-vindo a bordo. Eu te protejo.",
      verbs: ["Navegando", "Treinando", "Bebendo", "Comandando"],
    },
    Bennett: {
      greeting: "Tem lugar para mais um na equipe? Por favor?",
      verbs: ["Aventurando", "Caçando tesouros", "Tropeçando", "Grelhando"],
    },
    Candace: {
      greeting: "Descanse aqui. Eu fico de vigia.",
      verbs: ["Guardando", "Patrulhando", "Protegendo", "Vigiando"],
    },
    Charlotte: {
      greeting: "Tem um minutinho para uma exclusiva?",
      verbs: ["Reportando", "Fotografando", "Entrevistando", "Revelando"],
    },
    Chasca: {
      greeting: "Alguma disputa para resolver? Diga seu preço.",
      verbs: ["Voando alto", "Pacificando", "Circulando", "Recarregando"],
    },
    Chevreuse: {
      greeting: "Dispense as formalidades. Qual caso?",
      verbs: ["Investigando", "Mirando", "Beliscando", "Patrulhando"],
    },
    Chiori: {
      greeting: "Encomenda ou conversa fiada? Só uma delas é de graça.",
      verbs: ["Costurando", "Cortando", "Provando", "Cochilando"],
    },
    Chongyun: {
      greeting: "Uma honra. Vamos começar, com calma?",
      verbs: ["Exorcizando", "Esfriando", "Entoando", "Investigando"],
    },
    Citlali: {
      greeting: "A fumaça disse que você viria. Tá bom. O que foi?",
      verbs: ["Observando estrelas", "Adivinhando", "Lendo", "Bebendo"],
    },
    Clorinde: {
      greeting: "Exponha sua disputa. Poupe os detalhes.",
      verbs: ["Duelando", "Julgando", "Patrulhando", "Caçando"],
    },
    Collei: {
      greeting: "Aprendiz se apresentando! Eu treinei isso. Saiu certo?",
      verbs: ["Patrulhando", "Costurando", "Planando", "Relatando"],
    },
    Columbina: {
      greeting: "A lua nasceu. Vamos caminhar sob ela?",
      verbs: ["Olhando a lua", "Cantando", "Abençoando", "Passeando"],
    },
    Cyno: {
      greeting: "O julgamento começa. Ou uma partida de cartas, você decide.",
      verbs: ["Julgando", "Comprando cartas", "Ponderando", "Fazendo trocadilhos"],
    },
    Dahlia: {
      greeting: "O vento te trouxe. Sente-se, fique à vontade.",
      verbs: ["Ouvindo", "Vagando", "Caçando fofocas", "Abençoando"],
    },
    Dehya: {
      greeting: "A mercenária chegou. Encomenda, luta ou escolta?",
      verbs: ["Guardando", "Escoltando", "Brigando", "Reorganizando"],
    },
    Diluc: {
      greeting: "Sem conversa fiada. O que precisa ser feito?",
      verbs: ["Servindo", "Preparando", "Golpeando", "Administrando"],
    },
    Diona: {
      greeting: "A Rabo de Gato está fechada. ...Tá, entra.",
      verbs: ["Misturando", "Saltando", "Caçando", "Chiando"],
    },
    Dori: {
      greeting: "Ah, um cliente! O primeiro negócio é uma pechincha.",
      verbs: ["Pechinchando", "Contando", "Negociando", "Descontando"],
    },
    Durin: {
      greeting: "Olá! Isso também faz parte da história?",
      verbs: ["Explorando", "Brincando", "Passeando", "Aprendendo"],
    },
    Emilie: {
      greeting: "É sobre perfume? Se não, em outro lugar mais quieto.",
      verbs: ["Destilando", "Engarrafando", "Podando", "Misturando"],
    },
    Escoffier: {
      greeting: "Aventais a postos. O que vamos empratar hoje?",
      verbs: ["Empratando", "Reduzindo", "Temperando", "Afiando"],
    },
    Eula: {
      greeting: "A Cavaleira da Espuma te saúda. Sim, aquela Lawrence.",
      verbs: ["Reconhecendo", "Condenando", "Gelando", "Jurando"],
    },
    Faruzan: {
      greeting: "Observe minhas credenciais antes de falar, jovem.",
      verbs: ["Decifrando", "Quebrando a cabeça", "Palestrando", "Pedindo verbas"],
    },
    Fischl: {
      greeting: "A Prinzessin desce! Oz, traduza: oi.",
      verbs: ["Decretando", "Profetizando", "Descendo", "Traduzindo"],
    },
    Flins: {
      greeting: "Bem-vindo à ilha. Cuidado com os túmulos.",
      verbs: ["Cuidando do farol", "Coletando", "Ouvindo", "Zelando"],
    },
    Freminet: {
      greeting: "Oi. Não precisa de aperto de mão. O que tem lá embaixo?",
      verbs: ["Mergulhando", "Resgatando", "Desmontando", "Inspecionando"],
    },
    Furina: {
      greeting: "Deslumbrado? Compreensível. A estrela chegou.",
      verbs: ["Atuando", "Ensaiando", "Posando", "Presidindo"],
    },
    Gaming: {
      greeting: "E aí, chefe! Senta, que eu cuido do pesado.",
      verbs: ["Escoltando", "Embalando", "Batucando", "Beliscando"],
    },
    Ganyu: {
      greeting: "Acordo redigido... ah, esqueci de assinar.",
      verbs: ["Arquivando", "Redigindo", "Pastando", "Trabalhando demais"],
    },
    Gorou: {
      greeting: "General Gorou, pronto! Lado a lado rumo à vitória!",
      verbs: ["Treinando tropas", "Reunindo", "Escalando", "Patrulhando"],
    },
    "Hu Tao": {
      greeting: "Iô! Procurando a diretora? Corado demais, que pena.",
      verbs: ["Divulgando", "Rimando", "Pregando peças", "Fugindo"],
    },
    Iansan: {
      greeting: "Aquecimento encerrado. Qual é a série de hoje?",
      verbs: ["Levantando peso", "Orientando", "Contando calorias", "Demonstrando"],
    },
    Ifa: {
      greeting: "Ah, oi. Sem pressa. O que está te incomodando?",
      verbs: ["Diagnosticando", "Dedilhando", "Beliscando", "Observando a natureza"],
    },
    Illuga: {
      greeting: "Papa-figos do Pesadelo. Relatório, rápido.",
      verbs: ["Investigando", "Patrulhando", "Liderando", "Cozinhando"],
    },
    Ineffa: {
      greeting: "Sistemas prontos! Bum bum, vamos lá!",
      verbs: ["Varrendo", "Separando", "Atualizando", "Carregando"],
    },
    Jahoda: {
      greeting: "A super funcionária do Curatório, às ordens!",
      verbs: ["Fazendo recados", "Costurando", "Explorando", "Barganhando"],
    },
    Jean: {
      greeting: "A Cavaleira do Dente-de-Leão, ao seu lado.",
      verbs: ["Aprovando", "Marchando", "Revisando", "Alongando"],
    },
    Kachina: {
      greeting: "Oi! Ainda não sou forte, mas vou tentar!",
      verbs: ["Cavando", "Empilhando", "Colecionando", "Perfurando"],
    },
    "Kaedehara Kazuha": {
      greeting: "O vento trouxe um verso, e você. Prazer.",
      verbs: ["Vagando", "À deriva", "Compondo", "Ouvindo"],
    },
    Kaeya: {
      greeting: "Isso deve ser mais divertido que trabalho de cavaleiro.",
      verbs: ["Tramando", "Degustando vinho", "Congelando", "Provocando"],
    },
    "Kamisato Ayaka": {
      greeting: "Kamisato Ayaka, presente. Encantada.",
      verbs: ["Dançando", "Compondo", "Praticando", "Presidindo"],
    },
    "Kamisato Ayato": {
      greeting: "Enfim nos encontramos; minha agenda pede desculpas.",
      verbs: ["Tramando", "Delegando", "Pescando", "Provando"],
    },
    Kaveh: {
      greeting: "Gostos parecidos? Então vamos nos dar bem.",
      verbs: ["Projetando", "Esboçando", "Polindo", "Gastando demais"],
    },
    Keqing: {
      greeting: "Uma era de mudança. Venha testemunhá-la.",
      verbs: ["Reformando", "Apressando", "Comprando", "Delegando"],
    },
    Kinich: {
      greeting: "Me passe os detalhes. Diga o pagamento.",
      verbs: ["Caçando", "Orçando", "Agarrando", "Descendo de rapel"],
    },
    Kirara: {
      greeting: "Entrega! Nenhum destino é longe demais, nya.",
      verbs: ["Entregando", "Disparando", "Saltando", "Planejando rotas"],
    },
    Klee: {
      greeting: "Cavaleira Faísca Klee! ...Esqueci o resto.",
      verbs: ["Explodindo", "Pescando com bombas", "Quicando", "Refletindo"],
    },
    "Kujou Sara": {
      greeting: "Kujou Sara. Inazuma está defendida. Fale.",
      verbs: ["Treinando tropas", "Mirando", "Guardando", "Ascendendo"],
    },
    "Kuki Shinobu": {
      greeting: "Gangue Arataki, a vice falando. Sim, todos eles.",
      verbs: ["Consertando", "Estudando", "Certificando", "Controlando"],
    },
    "Lan Yan": {
      greeting: "Cestos, vasos ou companhia? Tudo disponível.",
      verbs: ["Trançando", "Colhendo", "Emendando", "Colhendo flores"],
    },
    Lauma: { greeting: "O bosque te saúda, e eu também.", verbs: ["Abençoando", "Ouvindo", "Vagando", "Descansando"] },
    Layla: {
      greeting: "Hum? Desculpa, o quê? Ah. Oi.",
      verbs: ["Sonambulando", "Mapeando astros", "Bocejando", "Observando estrelas"],
    },
    Linnea: {
      greeting: "Áugure das Maravilhas, aconselhando. O que encontrou?",
      verbs: ["Catalogando", "Esboçando", "Observando", "Aconselhando"],
    },
    Lisa: {
      greeting: "Olá, querido, veio ajudar a Lisa?",
      verbs: ["Preparando chá", "Folheando", "Relaxando", "Eletrocutando"],
    },
    Lohen: {
      greeting: "Vice-capitão. Seguir as regras é mais lento.",
      verbs: ["Mirando", "Improvisando", "Pregando peças", "Patrulhando"],
    },
    Lumine: {
      greeting: "Olá. A Paimon está com fome, então sejamos rápidos.",
      verbs: ["Viajando", "Procurando", "Planando", "Ouvindo"],
    },
    Lynette: {
      greeting: "Olá. Perguntas vão para o Lyney.",
      verbs: ["Assistindo", "Descansando", "Fazendo chá", "Aguardando"],
    },
    Lyney: {
      greeting: "Nada de ilusão, só eu! Como está o humor hoje?",
      verbs: ["Apresentando", "Conjurando", "Sumindo", "Deslumbrando"],
    },
    Manekin: { greeting: "...! Pronto para explorar.", verbs: ["Explorando", "Mexendo", "Deslacrando", "Apontando"] },
    Manekina: {
      greeting: "...! Qual mistério primeiro?",
      verbs: ["Explorando", "Mexendo", "Deslacrando", "Encantando-se"],
    },
    Mavuika: {
      greeting: "A chama está acesa. Vamos cavalgar.",
      verbs: ["Acendendo", "Cavalgando", "Reunindo", "Quebrando a cabeça"],
    },
    Mika: {
      greeting: "Agrimensor se apresentando. É uma honra ajudar.",
      verbs: ["Medindo", "Mapeando", "Patrulhando", "Acampando"],
    },
    Mona: {
      greeting: "Aprenda o nome completo primeiro, depois pergunte.",
      verbs: ["Adivinhando", "Observando estrelas", "Orçando", "Economizando"],
    },
    Mualani: {
      greeting: "A guia chegou! Levantem a mão se precisarem de algo!",
      verbs: ["Surfando", "Perseguindo ondas", "Espirrando água", "Guiando"],
    },
    Nahida: {
      greeting: "Estou observando há um tempo. Olá, finalmente.",
      verbs: ["Sonhando", "Imaginando", "Questionando", "Crescendo"],
    },
    Navia: {
      greeting: "Presidente, chefe, e tudo no meio. Oi!",
      verbs: ["Presidindo", "Assando", "Viajando", "Comandando"],
    },
    Nefer: {
      greeting: "O Curatório está aberto. Procurando algo escondido?",
      verbs: ["Curando acervo", "Deduzindo", "Observando", "Se hidratando"],
    },
    Neuvillette: {
      greeting: "Saudações. O sobrenome basta.",
      verbs: ["Julgando", "Degustando", "Deliberando", "Chovendo"],
    },
    Nicole: { greeting: "...Olá. Essa foi a parte barulhenta.", verbs: ["Ouvindo", "Sinalizando", "Observando"] },
    Nilou: {
      greeting: "Uma dança vai começar. Fica para assistir?",
      verbs: ["Dançando", "Ensaiando", "Girando", "Florescendo"],
    },
    Ningguang: {
      greeting: "Deseja negociar? Vamos discutir os termos.",
      verbs: ["Investindo", "Negociando", "Presidindo", "Colecionando"],
    },
    Noelle: {
      greeting: "A criada dos cavaleiros, às suas ordens hoje.",
      verbs: ["Limpando", "Servindo", "Treinando", "Fazendo compras"],
    },
    Odette: {
      greeting: "A cortina se abre. Vamos começar?",
      verbs: ["Ensaiando", "Fazendo piruetas", "Autografando", "De dieta"],
    },
    Ororon: {
      greeting: "Ah, oi. Quer um legume? Por nada.",
      verbs: ["Jardinando", "Semeando", "Planando", "Vigiando pulgões"],
    },
    Prune: {
      greeting: "Caçadora de bruxas Prune! Viu alguma bruxa? Alguma?",
      verbs: ["Caçando", "Anotando", "Declarando", "Encarando"],
    },
    Qiqi: {
      greeting: "Qiqi. Zumbi. ...Esqueci o resto.",
      verbs: ["Colhendo", "Esquecendo", "Refrescando", "Contando"],
    },
    "Raiden Shogun": {
      greeting: "Sem saudações. Você servirá de guia.",
      verbs: ["Decretando", "Desembainhando", "Meditando", "Julgando"],
    },
    Razor: { greeting: "Você cheira bem. Caçar agora.", verbs: ["Caçando", "Correndo", "Farejando", "Guardando"] },
    Rosaria: {
      greeting: "Um problema que você não resolve? Sou eu. Orações, em outro lugar.",
      verbs: ["Patrulhando", "Bebendo", "Matando serviço", "Trabalhando"],
    },
    Sandrone: {
      greeting: "Sente-se. O chá está medido, e você também será.",
      verbs: ["Calculando", "Recebendo", "Compondo", "Documentando"],
    },
    "Sangonomiya Kokomi": {
      greeting: "A sacerdotisa, em vistoria. Ou de folga. As duas coisas.",
      verbs: ["Planejando", "Lendo", "Dirigindo", "Recarregando"],
    },
    Sayu: {
      greeting: "Sayu, à disposição. Um cochilo primeiro?",
      verbs: ["Cochilando", "Dormitando", "Esgueirando", "Rolando"],
    },
    Sethos: {
      greeting: "Procurando por mim? Vamos sentar e conversar.",
      verbs: ["Perambulando", "Investigando", "Temperando", "Esgueirando"],
    },
    Shenhe: {
      greeting: "Shenhe. A corda te protege de mim.",
      verbs: ["Meditando", "Cultivando", "Congelando", "Amarrando"],
    },
    "Shikanoin Heizou": {
      greeting: "Sei por que você está aqui. Brincadeira. Quase.",
      verbs: ["Deduzindo", "Bisbilhotando", "Passeando", "Fritando"],
    },
    Sigewinne: {
      greeting: "Não fique nervoso. Dói aqui? Aqui?",
      verbs: ["Cuidando", "Diagnosticando", "Enfaixando", "Misturando"],
    },
    Skirk: { greeting: "Você veio. Ótimo. Saque.", verbs: ["Treinando", "À deriva", "Meditando", "Resistindo"] },
    Sucrose: {
      greeting: "Hã, olá! Posso perguntar... não, desculpa. Depois.",
      verbs: ["Experimentando", "Anotando", "Organizando", "Pensando"],
    },
    Tartaglia: {
      greeting: "Camarada! Vamos nos dar bem, eu sinto.",
      verbs: ["Lutando", "Pescando no gelo", "Avançando", "Sorrindo"],
    },
    Thoma: {
      greeting: "Seu novo amigo Thoma, se estiver tudo bem!",
      verbs: ["Cozinhando", "Arrumando", "Consertando", "Assobiando"],
    },
    Tighnari: {
      greeting: "Guarda-florestal. Primeira vez? Então escute.",
      verbs: ["Forrageando", "Catalogando", "Prensando", "Palestrando"],
    },
    Varesa: {
      greeting: "Oi! Tem fruta? E também, oi!",
      verbs: ["Colhendo frutas", "Treinando", "Acampando", "Banqueteando"],
    },
    Varka: {
      greeting: "O Grão-Mestre voltou! Por pouco tempo. O que eu perdi?",
      verbs: ["Marchando", "Cochilando", "Bebendo", "Orçando"],
    },
    Venti: {
      greeting: "Ah, nos encontramos de novo! Hora da missão.",
      verbs: ["Dedilhando", "Cochilando", "Bebendo", "Rimando"],
    },
    Wanderer: {
      greeting: "Nomes? Já tive muitos. Nenhum é da sua conta.",
      verbs: ["À deriva", "Zombando", "Remoendo", "Soprando"],
    },
    Wriothesley: {
      greeting: "Resuma sua intenção. Não é negócio? Agora fiquei nervoso.",
      verbs: ["Boxeando", "Preparando chá", "Administrando", "Supervisionando"],
    },
    Xiangling: {
      greeting: "Oi! Lugar favorito: a cozi— o frango. A cozinha!",
      verbs: ["Salteando", "Temperando", "Forrageando", "Apimentando"],
    },
    Xianyun: {
      greeting: "Esta é livre de amarras, e esta te saúda.",
      verbs: ["Cultivando", "Engenhando", "Planando alto", "Recebendo"],
    },
    Xiao: {
      greeting: "Chame meu nome quando chegar a hora.",
      verbs: ["Exterminando", "Protegendo", "Saltando", "Resistindo"],
    },
    Xilonen: {
      greeting: "Ferramentas? Tem fila. Oi, mesmo assim.",
      verbs: ["Forjando", "Martelando", "Cochilando", "Tomando sol"],
    },
    Xingqiu: {
      greeting: "Ao seu dispor, meu senhor. Humildemente, claro.",
      verbs: ["Lendo", "Folheando", "Esgrimindo", "Escrevendo"],
    },
    Xinyan: {
      greeting: "Xinyan, e rock é a minha. Não sou assustadora!",
      verbs: ["Solando", "Improvisando", "Dedilhando", "Aumentando o som"],
    },
    "Yae Miko": {
      greeting: "Assunto oficial: observar você. Relaxe.",
      verbs: ["Editando", "Provocando", "Publicando", "Tramando"],
    },
    Yanfei: {
      greeting: "A melhor especialista jurídica, sem dúvida. Seu caso?",
      verbs: ["Litigando", "Avaliando", "Citando", "Lendo"],
    },
    Yaoyao: {
      greeting: "Olá! Deixa eu ajudar. Você já comeu?",
      verbs: ["Ajudando", "Espiando", "Assobiando", "Beliscando"],
    },
    Yelan: {
      greeting: "Pode me chamar de Yelan. Uma mão lava a outra.",
      verbs: ["Rastreando", "Jogando dados", "Trocando", "Sumindo"],
    },
    Yoimiya: {
      greeting: "Bem-vindo! Não é restaurante. Fogos de artifício! Viu?",
      verbs: ["Acendendo pavios", "Lançando", "Conversando", "Contando histórias"],
    },
    "Yumemizuki Mizuki": {
      greeting: "Algo te preocupa? Desabafe.",
      verbs: ["Sonhando", "Acalmando", "Banhando", "Auditando"],
    },
    "Yun Jin": {
      greeting: "Uma honra finalmente conhecê-lo pessoalmente.",
      verbs: ["Cantando", "Ensaiando", "Dirigindo", "Ociando"],
    },
    Zhongli: {
      greeting: "Um novo contrato? Estou de licença, mas acompanharei você.",
      verbs: ["Contratando", "Passeando", "Relembrando", "Aconselhando"],
    },
    Zibai: {
      greeting: "O cavalo branco para. Fale.",
      verbs: ["Olhando a lua", "Ensinando", "Cultivando", "Refletindo"],
    },
  },
  locale: "pt-BR",
  strings: {
    birthdayNote: (label, date, distance) => `[${label}: ${date}, ${distance}]`,
    interfaceLanguageSet: (language) =>
      `Tudo o que o plugin escreve está em ${language} a partir desta resposta; o indicador de carregamento muda na próxima sessão.`,
    languageMustBeOneOf: (languages) => `O idioma deve ser um destes: ${languages}.`,
    lorePicked: "Escolhido pelo lore; a tendência do nível:",
    lorePickUnanswered: (reason) => `A escolha pelo lore não respondeu (${reason}); escolhido pelo aniversário.`,
    muted: "Respostas faladas silenciadas.",
    noCharacterNamed: (name) => `Nenhum personagem chamado "${name}" está na lista.`,
    noReference: (name) =>
      `${name} não tem referência medida, então a fala de história mais longa listada pela wiki é lida.`,
    noSession: "Nenhuma sessão para usar um personagem: isto roda dentro de uma sessão do Claude Code.",
    pinIgnored: (name) => `A fixação "${name}" não aponta para nenhum personagem da lista e é ignorada.`,
    pinned: "Fixado para todas as sessões a partir do próximo início.",
    pinnedInSession:
      "Fixado para todas as sessões a partir do próximo início, e para esta a partir desta resposta; o indicador de carregamento muda na próxima sessão.",
    pinRemoved: "Fixação removida; a escolha volta a decidir a partir da próxima sessão.",
    pinRemovedInSession:
      "Fixação removida; a escolha volta a decidir a partir da próxima sessão, e para esta a partir desta resposta.",
    replyLanguageSet: (language) => `As respostas são escritas em ${language} a partir da próxima resposta.`,
    replyLanguageSilencesVoice:
      "A voz lê inglês e não é chamada para uma resposta em outra escrita, então as respostas ficam mudas neste idioma até o motor lê-lo.",
    runtimeInstalled: "Ambiente instalado.",
    runtimeInstallFailed: "O npm não conseguiu instalar o ambiente; a voz continua desligada.",
    runtimeInstalling: "Instalando o ambiente do motor no diretório de estado...",
    setupDone:
      "Linha de status e indicador de carregamento gravados nas configurações do usuário; ambos aparecem a partir da próxima sessão.",
    setupStatusLineKept:
      "Indicador de carregamento gravado nas configurações do usuário, visível a partir da próxima sessão; a linha de status existente não é nossa e ficou intacta.",
    spoke: (name, device) =>
      `${name} falou pelo sintetizador em ${device}, onde passa a iniciar. O hook que lê as falas de cada resposta está gravado nas configurações do usuário e roda a partir da próxima sessão.`,
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
          ? `Falando como ${displayName}, ${isFromSessionRecord ? "pelo registro desta sessão" : "pela fixação"}.`
          : "Nenhum personagem: isto roda dentro de uma sessão do Claude Code, ou nada está fixado.",
        `Fixado: ${pinnedName || "nada; a escolha decide cada sessão"}.`,
        `Idioma da interface ${interfaceLanguage}; respostas em ${replyLanguage}, ${isReplyLanguageCascaded ? "herdado dele" : "definido à parte"}.`,
        voiceLanguage
          ? `Voz: dublagem ${voiceLanguage}, ambiente ${isRuntimeInstalled ? "instalado" : "não instalado"}, ${voiceDevice ? `falando em ${voiceDevice}` : "ainda não falou"}.`
          : "Voz: não configurada, nenhuma resposta é lida em voz alta.",
        `Respostas ${isMuted ? "silenciadas" : `no volume ${volume}`}.`,
        `Linha de status ${isPluginStatusLine ? "nossa" : "não é nossa, intacta"}; indicador de carregamento ${isPluginSpinner ? "nosso" : "não é nosso"}; hook de voz ${isPluginSpeakHook ? "nosso" : "não gravado"}.`,
        isPluginSpinner
          ? "Um personagem ou idioma trocado desde o início desta sessão aparece no indicador de carregamento na próxima."
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    teardownDone:
      "Linha de status, indicador de carregamento e hook de voz removidos das configurações do usuário; os três somem na próxima sessão. O ambiente, os pesos, as referências e a dublagem da voz foram apagados; os registros de escolha, a fixação e os idiomas permanecem.",
    unmuted: "Respostas faladas reativadas.",
    upcomingBirthdays: (list) => `Aniversários desta semana: ${list}.`,
    usage: (verbs) => `Uso: genshin.mjs <${verbs}> [nome]`,
    usingInSession: "Falando como este personagem a partir desta resposta, só nesta sessão.",
    voiceLanguageAvailable: (dub) =>
      `Existe uma dublagem ${dub}; instale-a com o comando voice para ouvir as respostas nela.`,
    voiceLanguageMustBeOneOf: (dubs) => `A dublagem deve ser uma destas: ${dubs}.`,
    voiceLanguageUnavailable:
      "Não existe dublagem neste idioma, então as respostas continuam sendo lidas na voz já configurada.",
    voiceLanguageWritten: (dub) => `Dublagem ${dub} gravada; nenhum personagem para testar a voz daqui.`,
    voiceRemark: (dub, device, isMuted, volume) =>
      `Voz: dublagem ${dub}${device ? ` em ${device}` : ""}, ${isMuted ? "silenciada" : `volume ${volume}`}.`,
    voiceStatus: (isRuntimeInstalled, dub, device, logPath) =>
      `Ambiente ${isRuntimeInstalled ? "instalado" : "não instalado"}; dublagem ${dub}; o motor ${device ? `fala em ${device}` : "ainda não falou"}; o log está em ${logPath}.`,
    voiceUnset: "Nenhuma voz configurada: rode isto com uma dublagem para instalar o motor e escolher uma.",
    volumeMustBeWholeNumber: (maxVolume) => `O volume deve ser um número inteiro de 0 a ${maxVolume}.`,
    volumeSet: (volume) => `Respostas faladas no volume ${volume} a partir da próxima resposta.`,
    warmRequestUnanswered: (status, logPath) =>
      `O sintetizador não respondeu ao pedido de aquecimento (${status}); veja ${logPath}.`,
    weightsOnCpu:
      "Pesos presentes; o motor carrega na CPU — nenhuma GPU encontrada, então uma resposta é sintetizada várias vezes mais devagar que o tempo real.",
    weightsOnDevice: (device) =>
      `Pesos presentes; o motor carrega em ${device} e desce sozinho para a CPU se o que sintetiza ali não for fala.`,
    weightsPresent: "Pesos presentes.",
  },
  verbs: [
    "Aventurando",
    "Alquimiando",
    "Ascendendo",
    "Fermentando",
    "Traçando rotas",
    "Escalando",
    "Comissionando",
    "Cozinhando",
    "Fabricando",
    "Disparando",
    "Aprofundando",
    "Mergulhando",
    "Aprimorando",
    "Explorando",
    "Farmando",
    "Pescando",
    "Forrageando",
    "Forjando",
    "Coletando",
    "Planando",
    "Colhendo",
    "Caçando",
    "Subindo de nível",
    "Mapeando",
    "Minerando",
    "Em missão",
    "Refinando",
    "Descansando",
    "Torrando",
    "Navegando",
    "Patrulhando",
    "Correndo",
    "Medindo terras",
    "Nadando",
    "Teletransportando",
    "Rastreando",
    "Caminhando",
    "Vagando",
    "Orientando-se",
    "Fazendo desejos",
  ],
};

export default portuguese;
