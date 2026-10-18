// Every string of the game's a consumer shows, by the game's own text id — the name its manual text map files the
// String under, the raw text hash where it files none, or the account kit's own key for a string the game shows before
// It has loaded its text map. The game already holds each in all fifteen languages, so referencing a new one is a line
// Here and a run of `pnpm -C scripts genshin:text write`, which reads this enum as its inventory; `genshin:text find`
// Prints the id of any English text
export enum GameTextKey {
  // The screens the world opens are named as the Paimon menu names their entries, or as a screen titles its own page
  Achievements = "UI_ACHIEVEMENT_TITLE",
  // The currencies by their item names: the two Fates, Genesis Crystals, the Masterless Starglitter and Stardust
  // Wishes return, Mora and Primogems
  AcquaintFate = "1444439468",
  // The Constellation tab's button that activates the next constellation
  Activate = "UI_TALENT_UNLOCK",
  // The Paimon menu's profile card, its experience and rank, the world level and the player's UID with its copy
  AdventureExp = "UI_PLAYER_PROFILE_PLAYEREXP",
  AdventureRank = "UI_PLAYER_PROFILE_PLAYERLV",
  AdventurerHandbook = "UI_ADVENTURE_CARD_TITLE",
  AjilenakhNut = "4280106100",
  AmakumoFruit = "3862594948",
  AmethystLump = "2485846164",
  Apple = "2483588484",
  Archive = "UI_CODEX_HOME_TITLE",
  // The titles of the Archive's seven sections, each the codex's own
  ArchiveBooks = "UI_CODEX_BOOKS",
  ArchiveEquipment = "UI_CODEX_EQUIPMENT",
  ArchiveGeography = "UI_CODEX_VIEW",
  ArchiveLivingBeings = "UI_CODEX_BIOS",
  ArchiveMaterials = "UI_CODEX_MATERIAL",
  ArchiveTravelLog = "UI_CODEX_QUEST",
  ArchiveTutorials = "UI_CODEX_TIPS",
  // The character screen's attributes under the game's own names, and the groups its details sort them into
  AttributeAnemoDamageBonus = "FIGHT_PROP_WIND_ADD_HURT",
  AttributeAttack = "FIGHT_PROP_CUR_ATTACK",
  AttributeCriticalDamage = "FIGHT_PROP_CRITICAL_HURT",
  AttributeCriticalRate = "FIGHT_PROP_CRITICAL",
  AttributeCryoDamageBonus = "FIGHT_PROP_ICE_ADD_HURT",
  AttributeDefense = "FIGHT_PROP_CUR_DEFENSE",
  AttributeDendroDamageBonus = "FIGHT_PROP_GRASS_ADD_HURT",
  AttributeElectroDamageBonus = "FIGHT_PROP_ELEC_ADD_HURT",
  AttributeElementalMastery = "FIGHT_PROP_ELEMENT_MASTERY",
  AttributeEnergyRecharge = "FIGHT_PROP_CHARGE_EFFICIENCY",
  AttributeGeoDamageBonus = "FIGHT_PROP_ROCK_ADD_HURT",
  AttributeGroupAdvanced = "UI_AVATAR_INFO_PROP_ADVANCED",
  AttributeGroupBase = "UI_AVATAR_INFO_PROP_BASICS",
  AttributeGroupElemental = "UI_AVATAR_INFO_PROP_ELEMENT",
  AttributeHealingBonus = "FIGHT_PROP_HEAL_ADD",
  AttributeHydroDamageBonus = "FIGHT_PROP_WATER_ADD_HURT",
  AttributeMaxHealth = "FIGHT_PROP_MAX_HP",
  AttributeMaxStamina = "PROP_MAX_STAMINA",
  AttributePhysicalDamageBonus = "FIGHT_PROP_PHYSICAL_ADD_HURT",
  AttributePyroDamageBonus = "FIGHT_PROP_FIRE_ADD_HURT",
  // A screen's way back to the world
  Back = "VIDEO_RETREAT",
  BagFull = "UI_BEYOND_RUNTIME_UI_DROP_PICKTIPS_FAIL",
  BambooShoot = "4238416012",
  BattlePass = "UI_STC_GAMEENTRYPAGE_BP",
  BerylConch = "1859043748",
  BirdEgg = "2577348708",
  // The label over a character's birthday on their profile
  Birthday = "INFORMATION_AVATAR_BIRTHDAY",
  BrilliantChrysanthemum = "2302571844",
  BulleFruit = "457891068",
  Cacahuatl = "1982182708",
  CallaLily = "4260602356",
  // A dialog's way out without its action, the generic word the game's own dialogs share
  Cancel = "UI_BEYOND_CANCEL",
  CandlecapMushroom = "767225220",
  Carrot = "3407195260",
  Cecilia = "3828726124",
  Character = "UI_STC_GAMEENTRYPAGE_PLAYER",
  CharacterArchive = "UI_PLAYER_PROFILE_CHARACTER_NEW",
  // The character screen's tabs
  CharacterArtifacts = "UI_STC_CHARACTERPAGE_RELIC",
  CharacterAttributes = "UI_STC_CHARACTER_PAGE_AVATAR",
  CharacterConstellation = "UI_STC_CHARACTERPAGE_TALENT",
  CharacterProfile = "FETTER_NAME",
  CharacterTalents = "UI_STC_CHARACTERPAGE_SKILL",
  CharacterWeapons = "UI_STC_CHARACTERPAGE_WEAPON",
  Chat = "UI_CHAT_CHAT_BUTTON",
  // The City Reputation the Paimon menu names, and the Reputation Reward its screen titles over its nation
  CityReputation = "81370119",
  ClearwaterJade = "2720928108",
  // The crafting bench's recipe tabs, one per combine type, by the names the manual text map files each under
  CombineTypeBait = "COMBINE_TYPE_NAME10",
  CombineTypeCharacterAscension = "COMBINE_TYPE_NAME5",
  CombineTypeCharacterTalent = "COMBINE_TYPE_NAME3",
  CombineTypeConsumable = "COMBINE_TYPE_NAME6",
  CombineTypeEnhancement = "COMBINE_TYPE_NAME1",
  CombineTypeFood = "COMBINE_TYPE_NAME12",
  CombineTypePotion = "COMBINE_TYPE_NAME4",
  CombineTypeWeaponAscension = "COMBINE_TYPE_NAME2",
  // The Common Chest, the most common kind, as the game names it
  CommonChest = "3953934758",
  // The Paimon menu's link to the game's community, which opens a web page
  Community = "UI_STC_GAMEENTRYPAGE_COMMUNITY",
  CompatibilityMode = "1992637634",
  CondessenceCrystal = "3736537308",
  // Party Setup's button to add, rename and disband teams
  ConfigureTeam = "UI_TEXT_TEAM_MANAGEMENT",
  // The quit prompt's first button, which goes back to the world
  ContinueGame = "UI_LOGOUT_CONFIRM_CONTINUE_GAME",
  CoOp = "UI_STC_GAMEENTRYPAGE_ONLINE",
  Copy = "UI_FRIEND_COPY",
  CorLapis = "2764520484",
  // The crafting bench: its title and Craft button, the amount slider beside the picked recipe, the Crafting Performed
  // Count, the Required line over its Mora, and the Crafting Materials heading
  CraftingAmount = "UI_COOKING_Cooking_Quantity",
  CraftingCrafted = "UI_SYNTHESIS_PAGE_ITEM_COUNT",
  CraftingMaterials = "UI_SYNTHESIS_PAGE_FOOD_ITEM_TITLE",
  CraftingRequired = "UI_COMMON_ITEM_NEED",
  CraftingTitle = "UI_SYNTHESIS_RECONFIRM_PAGE_TITLE",
  CrystalChunk = "1448077684",
  CrystalCore = "2435040556",
  CrystalMarrow = "307506436",
  DadaupaGorge = "3497395333",
  // The enemies' drops by their item names
  DamagedMask = "461826100",
  DandelionSeed = "2071890124",
  Dendrobium = "354894236",
  // Party Setup's button that deploys the team shown
  Deploy = "UI_BUTTON_ENABLE_TEAM",
  // A domain's entrance, as its map pin and its entry screen title it
  DomainEntrance = "UI_STC_DUNGEONENTRYPAGE_DungeonEntry",
  // The dialogue's auto-play button, as it reads while off and while playing
  DialogueAuto = "UI_TALK_DIALOG_AUTO_TALK_START",
  DialogueAutoPlaying = "UI_TALK_DIALOG_AUTO_TALK_STOP",
  Dracolite = "2859410932",
  // The Electro Crystal node the map marks under Inventory / Materials, named as its gathering point names it
  ElectroCrystal = "2189505020",
  // The HUD's skill and burst buttons, named as the controls name their keys
  ElementalBurst = "CONTROL_SKILL5",
  ElementalSkill = "CONTROL_SKILL2",
  EmbercoreFlower = "3599966252",
  EnhancementOre = "2429162676",
  Events = "UI_STC_GAMEENTRYPAGE_ACTIVITY",
  // The quit prompt's button that exits the game to the desktop
  ExitToDesktop = "UI_LOGOUT_CONFIRM_EXIT_TO_DESKTOP",
  // The quit prompt's button that leaves the world for the login interface
  ExitToLoginInterface = "UI_LOGOUT_CONFIRM_EXIT_TO_TITLE_SCREEN",
  // The map's line under an area's name, its percentage filled in, and the same line once the area is fully explored,
  // Its percentage in the game's gold
  ExplorationProgress = "UI_EXPLORE_COUNT",
  ExplorationProgressComplete = "UI_EXPLORE_COUNT_MAX",
  // The Exquisite Chest, the middle tier, as the game names it
  ExquisiteChest = "3981652399",
  // The feedback link, a web page the Paimon menu opens
  Feedback = "UI_STC_GAMEENTRYPAGE_FEEDBACK",
  FineEnhancementOre = "377860124",
  FlamingFlowerStamen = "2387249548",
  FluorescentFungus = "3996649804",
  // The Amount line over the forge slider, "Amount: {0}"
  ForgeAmount = "UI_FORGE_PAGE_ITEM_COUNT",
  // The blacksmith's words for a day's forge points spent past the cap, one for each enhancement ore, by the text id its
  // Recipe names; a recipe's own id for the same words repeats the English of these
  ForgeEnhancementOreRefusal = "1106263200",
  ForgeFineEnhancementOreRefusal = "1652126048",
  // The forge screen's words: a recipe's forge time, the queue button with its count, a queue's state (idle, forging,
  // Forged so far and the Adventure Rank it unlocks at), the support character's title and the total forge time
  ForgeItemTime = "UI_FORGE_PAGE_ITEM_TIME",
  ForgeMaterials = "UI_FORGE_PAGE_FOOD_ITEM_TITLE",
  ForgeMaterialsTab = "UI_FORGE_PAGE_FORMULA_BUTTON",
  ForgeMysticEnhancementOreRefusal = "110208304",
  // The forge's own text ids do not name "Obtain", so a finished queue takes the cooking screen's collect button
  ForgeObtain = "UI_COOKING_FETCH_BUTTON",
  ForgeQueueButton = "UI_FORGE_PAGE_QUEUE_BUTTON",
  ForgeQueueForging = "UI_FORGE_PAGE_QUEUE_UNFINISH",
  ForgeQueueIdle = "UI_FORGE_PAGE_QUEUE_FREE",
  ForgeQueueLockLevel = "UI_FORGE_PAGE_QUEUE_LOCK_LEVEL",
  ForgeQueueProgress = "UI_FORGE_PAGE_QUEUE_PROGRESS",
  ForgeStart = "UI_FORGE_PAGE_OK_BUTTON",
  ForgeSupportCharacter = "UI_FORGE_PAGE_AVATAR_TITLE",
  ForgeTimeRemaining = "UI_FLYING_ACTIVITY_TIME_RAMAIN",
  ForgeTitle = "UI_FORGE_PAGE_TITLE",
  ForgeTotalTime = "UI_FORGE_PAGE_NEED_TIME",
  Fowl = "1695194124",
  Friends = "UI_FRIEND_TITLE",
  Friendship = "3501231455",
  // The Frostbearing Tree's name on its prompt, as the game's own main-interface title says it
  FrostbearingTree = "UI_ELDERTREE_MAINUI_TITLE",
  FrostlampFlower = "1823058028",
  // The game's own name, as its window's title says it
  GameTitle = "LANGUAGE_WINDOWS_TITLENAME",
  GcgActionPhase = "UI_GCG_PHASE_ACTION",
  GcgChallenge = "191219274",
  GcgConcede = "UI_GCG_CONFIG_SURRENDER",
  GcgConfirm = "UI_GCG_ACTION_OK",
  GcgDefeat = "UI_GCG_RESULT_LOSE",
  GcgElementalTuning = "UI_GCG_ACTION_ELEMENT_SYNCHO",
  GcgEndRound = "UI_GCG_PASS_DECLARE",
  GcgNowActing = "UI_GCG_PLAYERINFO_ACTION",
  GcgReroll = "UI_GCG_ACTION_HINT_REROLL",
  GcgRollPhase = "UI_GCG_PHASE_THROW",
  GcgRoundTitle = "UI_GCG_PHASE_ROUND_TITLE",
  GcgStartingHand = "UI_GCG_PHASE_SWITCH_HAND",
  GcgSwitchCharacter = "UI_GCG_ACTION_SWITCH_CHAR",
  GcgVictory = "UI_GCG_RESULT_WIN",
  GcgYourTurn = "UI_GCG_TURN_YOU",
  GenesisCrystal = "2722599324",
  GlazeLily = "4012901404",
  GlowingHornshroom = "1496527260",
  Grainfruit = "1334780260",
  // The Adventurer Handbook's Experience page: its chapter, its progress panel and its commissions, by the game's text ids
  HandbookChapterNine = "1920411039",
  HandbookCommissionAscendCharactersPhase5 = "1556198782",
  HandbookCommissionAscendWeaponsPhase5 = "239841718",
  HandbookCommissionEnhanceArtifactsLv20 = "4221402286",
  HandbookCommissionEnhanceWeaponLv80 = "2116885982",
  HandbookCommissionLevelUpCharacterLv80 = "4111548534",
  // The Adventurer Handbook's tabs
  HandbookCommissions = "UI_ADVENTURE_CARD_EVENT_TITLE",
  HandbookDomains = "UI_ADVENTURE_CARD_DUNGEON_TITLE",
  HandbookEmbattle = "UI_ADVENTURE_INVESTIGATION_CHARASCEND",
  HandbookEnemies = "UI_ADVENTURE_INVESTIGATION_MONSTER_PAGE",
  HandbookExperience = "UI_ADVENTURE_TRAVELS",
  HandbookGuide = "UI_TEXT_QUEST_GUIDE_BOOKMARK",
  HandbookInvestigationProgress = "UI_ADVENTURE_INVESTIGATION_PROGRESS",
  HandbookRewards = "UI_ADVENTURE_INVESTIGATION_REWARD",
  HandbookRewardsClaimed = "UI_ADVENTURE_INVESTIGATION_REWARD_COLLECTION",
  HarraFruit = "2960336068",
  // The HUD's HP bars, named for a screen reader
  Health = "FIGHT_PROP_CUR_HP",
  // The health notice's paragraphs, a blank line between them
  HealthNotice = "684850635",
  HealthNoticeTitle = "1737243758",
  HennaBerry = "3448878388",
  Horsetail = "1247603844",
  IcyPebble = "2856476780",
  IntertwinedFate = "4203128180",
  Inventory = "UI_STC_BAGPAGE_BAG",
  // The bag's tabs, and a tab's room as its name, its count and its limit fill `{0} {1}/{2}`
  InventoryArtifacts = "ITEM_EQUIP",
  InventoryCapacity = "UI_STC_BAGPAGE_CAPACITY_TITLE",
  InventoryCharacterDevelopmentItems = "ITEM_AVATAR",
  // The bag's destroy mode, on its trash, and the quick select's rarities, each named as the destroy page names them
  InventoryDestroy = "UI_STC_BAGPAGE_DESTROY_TITLE",
  InventoryDestroyArtifactFourStar = "UI_STC_BAGPAGE_DESTROY_TAB_EQUIP_4",
  InventoryDestroyArtifactOneStar = "UI_STC_BAGPAGE_DESTROY_TAB_EQUIP_1",
  InventoryDestroyArtifactThreeStar = "UI_STC_BAGPAGE_DESTROY_TAB_EQUIP_3",
  InventoryDestroyArtifactTwoStar = "UI_STC_BAGPAGE_DESTROY_TAB_EQUIP_2",
  // The destroy page's button that confirms the selection, and its dialog's title, list, warning and OK
  InventoryDestroyButton = "UI_STC_BAGPAGE_DESTROY_BUTTON_CONFIRM",
  // The line an entry the bag may not destroy shows in the destroy mode
  InventoryDestroyCannot = "UI_STC_BAGPAGE_CANNOT_DESTROY_TIPS",
  InventoryDestroyConfirmButton = "UI_STC_BAGPAGE_DESTROY_CONFIRM_BUTTON",
  InventoryDestroyConfirmList = "UI_STC_BAGPAGE_DESTROY_CONFIRM_1",
  InventoryDestroyConfirmTitle = "UI_STC_BAGPAGE_DESTROY_CONFIRM_TITTLE",
  InventoryDestroyConfirmWarning = "UI_STC_BAGPAGE_DESTROY_CONFIRM_3",
  // The list of the materials a destroy returns, its label in the destroy dialog
  InventoryDestroyRecovered = "UI_STC_BAGPAGE_DESTROY_CONFIRM_2",
  // The count beside the destroy button, `{0}/{1} selected`
  InventoryDestroySelected = "UI_STC_BAGPAGE_DESTROY_BUTTON_SELECTED",
  // The line the destroy mode opens with
  InventoryDestroyTip = "UI_STC_BAGPAGE_DESTROY_TIPS",
  InventoryDestroyWeaponOneStar = "UI_STC_BAGPAGE_DESTROY_WEAPON_1",
  InventoryDestroyWeaponThreeStar = "UI_STC_BAGPAGE_DESTROY_WEAPON_3",
  InventoryDestroyWeaponTwoStar = "UI_STC_BAGPAGE_DESTROY_WEAPON_2",
  InventoryFood = "ITEM_FOOD",
  InventoryFurnishings = "ITEM_FURNITURE",
  InventoryGadget = "ITEM_CITY_REPUTATION",
  InventoryMaterials = "ITEM_MATERIAL",
  InventoryPreciousItems = "ITEM_CONSUME",
  InventoryQuest = "ITEM_QUEST",
  InventoryWeapons = "ITEM_WEAPON",
  IronChunk = "4060716292",
  // An item and its count, its name in place of `{0}` and the count in place of `{1}`
  ItemCount = "SHOP_ITEM_NAME_AND_COUNT",
  JueyunChili = "22100332",
  // The touch layout's jump button, which a screen reader says in place of its glyph
  Jump = "UI_BEYOND_UIEDITOR_INSPECTOR_JUMP",
  KalpalataLotus = "1479130340",
  LakelightLily = "47843548",
  Lakkaberry = "3318899836",
  LavenderMelon = "4160392220",
  // A level as the game writes one, its number in place of `{0}`
  LevelFormat = "UI_COMMON_LEVEL_FORMAT",
  // A level's badge word, its number set on the line beneath, as the Reputation reward page's badges show it. Two of the
  // Game's strings read "Lv." in English; this is the one abbreviated in every language ("Niv.", "St."), which the
  // Narrow badge fits, where the Statue's spells "Niveau" and "Stufe" out
  LevelShort = "2960839764",
  Loading = "UI_BEYOND_RECOMMEND_EMPTY_LOADING",
  // The door's prompt, worded per platform in the game's text and the PC's kept
  LoginBegin = "3535917252",
  // The login screen's status lines under its progress bar, in the order it shows them
  LoginCheckingForUpdates = "1285204118",
  LoginLoadingData = "1128933734",
  LoginLoadingGame = "1102014722",
  // What the door's log out and the client's repair do, which a screen reader says in place of the login screen's
  // Glyphs, as it does the notices, the quit and the settings the Paimon menu names alike
  LoginLogOut = "496124396",
  LoginPreparingDownload = "796445964",
  LoginRepair = "857403427",
  // The login screen's title and the label before the account's name
  LoginTitle = "3574932777",
  LoginUserLabel = "2272745789",
  // The welcome card's greeting, the player's name in place of its `%s`
  LoginWelcome = "tips_enter_game",
  LotusHead = "1050026324",
  LumidouceBell = "205491460",
  Lumitoile = "1497627716",
  MagicalCrystalChunk = "2057452708",

  Mail = "UI_PLAYER_PROFILE_MAIL",
  Map = "UI_STC_MAP_TITLE",
  Marcotte = "1070567836",
  MasterlessStardust = "3899400612",
  MasterlessStarglitter = "1417946372",
  // The Stella Fortuna a five-star drawn past its six constellations brings, which activates no constellation
  MasterlessStellaFortuna = "958504444",
  Matsutake = "1962114236",
  MidsommarBerry = "3263853588",
  Mint = "4131305812",
  MistFlowerCorolla = "3227888900",
  Mondstadt = "UI_MAP_AREA1_TITLE_7",
  MoonfallSilver = "1570138468",
  Mora = "3578052980",
  MourningFlower = "1761418508",
  Mushroom = "1926602188",
  MysticEnhancementOre = "3267705996",
  NakuWeed = "3623663804",
  NilotpalaLotus = "774700468",
  NoctilucousJade = "2726159796",
  NocturnalBlossom = "2957600892",
  // The touch layout's attack button, which a screen reader says in place of its weapon's glyph
  NormalAttack = "CONTROL_SKILL1",
  Notices = "UI_STC_GAMEENTRYPAGE_BULLETIN",
  OminousMask = "1726035172",
  Onikabuto = "767303132",
  // The resin the map's top bar counts and the claims at a blossom spend
  OriginalResin = "3246419172",
  Padisarah = "200162340",
  // The HUD's corner button that opens the Paimon menu, named for the face it shows
  Paimon = "NPC_EXPNAME_12911",
  // The four teams every player starts with, each named Party 1 to 4 until it is renamed
  PartyDefaultName1 = "UI_TEAM_DEFAULT_NAME1",
  PartyDefaultName2 = "UI_TEAM_DEFAULT_NAME2",
  PartyDefaultName3 = "UI_TEAM_DEFAULT_NAME3",
  PartyDefaultName4 = "UI_TEAM_DEFAULT_NAME4",
  PartySetup = "UI_TEAM_TITLE",
  PhilanemoMushroom = "873400484",
  PineAmber = "3765897708",
  Pinecone = "4200020428",
  PluieLotus = "2192902588",
  PortableBearing = "3720804436",
  // The Precious Chest, the richest tier the wallet rewards, as the game names it
  PreciousChest = "3576739246",
  PressToOpen = "1860729186",
  Primogem = "2696654964",
  Qingxin = "1573292356",
  QuenepaBerry = "2670149892",
  // The quest screen's button on the quest being navigated to
  QuestCancelNavigation = "TASK_TRACK_CLEAR",
  // The quest screen's lists, each a tab and a heading over its quests
  QuestCategoryArchon = "TASK_TYPE_MAIN",
  QuestCategoryCommission = "TASK_TYPE_WORLD",
  QuestCategoryStory = "TASK_TYPE_BRANCH",
  QuestCategoryWorld = "TASK_TYPE_OTHERS",
  // Provisional: how far a quest in the quest screen's list stands, "{0}m". The text map holds no line of the quest
  // Screen's own for it, so this is the minigame's "{0}m", the same words in English
  QuestDistance = "UI_BEYOND_EDITOR_PROTOTYPE_LINE_METER",
  // The quest tracker's word before the navigated objective's distance, where it stands well below or above the character
  QuestMarkDown = "QUEST_MARK_DOWN",
  QuestMarkUp = "QUEST_MARK_UP",
  // The same button on any other quest
  QuestNavigate = "TASK_TRACK_ENSURE",
  // The quest screen's button opening the overview of every quest
  QuestOverview = "UI_QUESTHUB_BUTTON_NAME",
  Quests = "UI_STC_GAMEENTRYPAGE_QUEST",
  // Provisional: the quest screen's title over its first tab, which lists every quest in progress. The text map holds
  // Several lines reading "In Progress" and none of them is named for the quest screen, so this is the plainest one
  QuestsInProgress = "UI_TEXT_DOING",
  // Party Setup's button that fills the team's empty slots with the next characters
  QuickSetup = "UI_BUTTON_FAST_TEAM",
  QuitGame = "UI_STC_GAMEENTRYPAGE_EXIT_TIPS",
  Radish = "1137755308",
  RainbowdropCrystal = "3831100636",
  RainbowRose = "2386700548",
  RawMeat = "2492759196",
  Ready = "ONLINE_DUNGEON_GUEST_IS_READY",
  RealmCurrency = "1255754076",
  RedBerryshroom = "1096616044",
  // The features a Reputation level unlocks, each worded as the reward page's unlock line, by its function's name
  ReputationMondstadtMerchantDiscounts = "1610612133",
  ReputationMondstadtOutcropSearch = "1452899589",
  ReputationNotAchieved = "UI_WISHINGPOND_OFFERING_LEVEL_UNREACH",
  ReputationReward = "REPUTATION_CITY_REWARD",
  RomaritimeFlower = "3918052700",
  RukkhashavaMushrooms = "225599940",
  SakuraBloom = "3896942756",
  SandGreasePupa = "3925526556",
  SangoPearl = "4091966756",
  SaurianClawSucculent = "19028052",
  SeaGanoderma = "4094014932",
  Seagrass = "2121074820",
  Settings = "UI_STC_GAMEENTRYPAGE_OPTION",
  // The settings' tabs, the Graphics and Audio tabs' headings and rows, and the words their values take: a quality tier
  // The device was given is filled into the default's words, and a resolution's width, height and mode into its own
  SettingsAccount = "UI_SETTING_PAGE_ACCOUNT_CATEGORY",
  SettingsAnisotropicFiltering = "UI_SETTING_GRAPHICS_ANISOTROPIC_FILTERING",
  SettingsAntiAliasing = "UI_SETTING_GRAPHICS_ANTIALIASING",
  SettingsAudio = "UI_SETTING_PAGE_SOUND_CATEGORY",
  SettingsAudioBalance = "UI_SETTING_AUDIO_BALANCE",
  SettingsAudioTitle = "UI_SETTING_AUDIO_TITLE",
  SettingsBloom = "UI_SETTING_GRAPHICS_BLOOM",
  SettingsBrightness = "UI_SETTING_GRAPHICS_HDR",
  SettingsControls = "UI_SETTING_PAGE_CONTROL_CATEGORY",
  SettingsCoOpTeammateEffects = "UI_SETTING_GRAPHICS_REMOTE_AVATAR_EFFECT",
  SettingsCrowdDensity = "UI_SETTING_GRAPHICS_CROWD_DENSITY",
  SettingsCustom = "UI_SETTING_GRAPHICS_ADVANCED",
  SettingsDefault = "UI_SETTING_GRAPHICS_DEFAULT",
  SettingsDialogueVolume = "UI_SETTING_AUDIO_VOICE",
  SettingsDisplayMode = "UI_SETTING_DISPLAY_MODE",
  SettingsDynamicCharacterResolution = "UI_SETTING_DYNAMIC_CHARACTER_RESOLUTION",
  SettingsDynamicRange = "UI_SETTING_AUDIO_DYNAMIC_RANGE",
  SettingsEnvironmentDetail = "UI_SETTING_GRAPHICS_COMPREHENSIVE",
  SettingsExtreme = "UI_SETTING_VERY_HIGH",
  SettingsFps = "UI_SETTING_GRAPHICS_FPS",
  SettingsFsr = "UI_SETTING_FSR",
  SettingsFull = "UI_SETTING_AUDIO_DYNAMIC_RANGE_FULL",
  SettingsFullscreen = "UI_SETTING_FULL_SCREEN_DISPLAY",
  SettingsGlobalIllumination = "UI_SETTING_GRAPHICS_GLOBAL_ILLUMINATION",
  SettingsGraphics = "UI_SETTING_PAGE_GRAPHIC_CATEGORY",
  SettingsGraphicsQuality = "UI_SETTING_GRAPHICS_QUALITY",
  SettingsGraphicsTitle = "UI_SETTING_GRAPHICS_TITLE",
  SettingsHigh = "UI_SETTING_HIGH",
  SettingsKeyBindings = "UI_SETTING_PAGE_KEYBINDING_CATEGORY",
  SettingsLanguage = "UI_SETTING_PAGE_LANGUAGE_CATEGORY",
  SettingsLow = "UI_SETTING_LOW",
  SettingsMedium = "UI_SETTING_MEDIUM",
  SettingsMessages = "UI_SETTING_PAGE_MESSAGE_CATEGORY",
  SettingsMotionBlur = "UI_SETTING_GRAPHICS_MOTION_BLUR",
  SettingsMusicVolume = "UI_SETTING_AUDIO_MUSIC",
  SettingsMuteWhenMinimized = "UI_SETTING_AUDIO_MINIMIZEMUTE",
  SettingsOff = "UI_SETTING_CLOSE",
  SettingsOn = "UI_SETTING_OPEN",
  SettingsOther = "UI_SETTING_PAGE_OTHER_CATEGORY",
  SettingsOtherSettings = "UI_SETTING_AUDIO_OTHER",
  SettingsOutputSettings = "UI_SETTING_AUDIO_OUTPUT",
  SettingsReflections = "UI_SETTING_GRAPHICS_REFLECTION",
  SettingsRenderResolution = "UI_SETTING_RENDER_RESOLUTION",
  SettingsResolution = "UI_SETTING_RESOLUTION_FORMAT",
  SettingsResources = "UI_SETTING_PAGE_RESOURCE_CATEGORY",
  SettingsSetNow = "UI_SETTING_GO_TO_SET",
  SettingsSfxQuality = "UI_SETTING_GRAPHICS_EFFECT_QUALITY",
  SettingsSfxVolume = "UI_SETTING_AUDIO_EFFECT",
  SettingsShadowQuality = "UI_SETTING_GRAPHICS_SHADOW_QUALITY",
  SettingsStereoSound = "UI_SETTING_AUDIO_OUTPUT_STEREO",
  SettingsSubsurfaceScattering = "UI_SETTING_GRAPHICS_SCREEN_SUBSURFACE_SCATTERING",
  SettingsVisualEffects = "UI_SETTING_GRAPHICS_LATER_EFFECT",
  SettingsVolume = "UI_SETTING_AUDIO_CONFIG",
  SettingsVolumetricFog = "UI_SETTING_GRAPHICS_VOLUMETRIC_FOG",
  SettingsVSync = "UI_SETTING_GRAPHICS_VSYNC",
  Shop = "UI_STC_GAMEENTRYPAGE_SHOP",
  SilkFlower = "1404683740",
  // The dialogue's button that runs on to the next reply or the end
  Skip = "UI_SKIP_BUTTON",
  SkysplitGembloom = "801054964",
  SmallLampGrass = "144892988",
  Snapdragon = "3558597948",
  // The weapons' and artifacts' sort, by level or quality, ascending or descending
  SortAscending = "UI_RelicIterations_Ordering_Ascending",
  SortDescending = "UI_RelicIterations_Ordering_Descending",
  SortLevel = "SORT_BY_LEVEL",
  SortQuality = "SORT_BY_QUALITY",
  SpinelFruit = "1984022796",
  SprayfeatherGill = "4108433756",
  SpringOfTheFirstDewdrop = "1466037620",
  // The touch layout's sprint button, which a screen reader says in place of its glyph
  Sprint = "CONTROL_SPRINT_OR_SKILL3",
  StainedMask = "3015475460",
  // The HUD's stamina meter, named for a screen reader
  Stamina = "133358079",
  Starconch = "1463427132",
  Starshroom = "2119751124",
  Starsilver = "1269908988",
  // A Statue of The Seven, as the map titles its mark
  StatueOfTheSeven = "UI_MAPMARK_MarkGoddess_TITLE",
  StormbearerMountains = "490004829",
  StormterrorsLair = "775762325",
  // A story the Profile tab shows before its Friendship Level is reached, with the level and the story's title
  StoryUnlocksAt = "2616170868",
  StrangeTooth = "2715317724",
  SumeruRose = "691451364",
  SweetFlower = "1330975132",
  // The touch layout's aim button a bow's wielder has, as the controls list name it, said in place of its glyph
  SwitchAimingMode = "CONTROL_TOGGLE_ATTACK_MODE",
  // Photo mode's own shutter, which the Paimon menu's entry into it says too
  TakePhoto = "UI_PIC_MAIN_PCPS_C",
  // The Talents tab's button that raises a combat talent by one level, the phase its next level needs, and the reasons it
  // Cannot rise: at its last level, the character's Ascension Phase too low, or short of the Mora or the materials
  TalentLevelUp = "UI_TALENT_LEVEL_UP",
  TalentMaterialsShort = "UI_TRAININGPLAN_MATERIAL_LACK",
  TalentMaxLevel = "SKILL_LEVEL_MAX_TIP",
  TalentMoraShort = "RetScoinNotEnough",
  TalentPhaseRequired = "SKILL_UPGRADE_NEED_ROLEBREAK_TIP",
  TalentPhaseShort = "SKILL_UPGRADE_AVATAR_BREAK_NEED",
  // The map's way to a place, as its button says
  Teleport = "UI_BUTTON_GOTO",
  // A Teleport Waypoint, as the map titles its mark
  TeleportWaypoint = "UI_MAPMARK_MarkTransPoint_TITLE",
  Tidalga = "225224916",
  Time = "UI_STC_GAMEENTRYPAGE_TIME",
  // The Time screen's confirm, in the game's own word for Confirm
  TimeConfirm = "UI_STC_LEVELUP_DIALOG_OK",
  // The label over the hour the Time screen's dial points at, before the player confirms it
  TimeWaitUntil = "UI_CLOCK_PAGE_TO_TIME",
  // The mainland client's publishing licence under its title logo: its approval, ISBN, publisher and copyright holder
  TitleLicence = "3231160485",
  TrainingGuide = "UI_TRAININGGUIDE_TITLE",
  // The player's own title, a word per gender where the language has one
  Traveler = "UI_TEXT_QUEST_GUIDE_LABEL",
  Trishiraite = "239145148",
  Uid = "UI_PLAYER_PROFILE_UID",
  Valberry = "2722402356",
  Viparyas = "3570846172",
  WhisperingWoods = "2498537973",
  WhiteIronChunk = "1747175596",
  Windrise = "3796215893",
  WindwheelAster = "3920833836",
  WinterIcelea = "3798480364",
  Wish = "UI_GACHA_TITLE",
  // The wish's kinds, a set's button with its count in place of `{0}`, and the Epitomized Path with its Fate Points
  // In place of `{0}` of `{1}`
  WishBeginners = "UI_GACHA_SHOW_PANEL_A016_TITLE",
  WishBuyFate = "UI_GACHAPAGE_BUYFATE_DIRECT",
  WishCharacterEvent = "UI_GACHA_TYPE_03",
  WishCharacterEventFeaturedTitle = "UI_GACHA_SHOW_PANEL_A041_UP1_TITLE1",
  WishCharacterEventTitle = "UI_GACHA_SHOW_PANEL_A041_TITLE",
  WishCount = "UI_GACHAPAGE_DOGACHA",
  WishDetails = "UI_GACHA_WISH_02_DETAIL",
  WishEpitomizedPath = "UI_GACHA_WISH",
  WishFatePoint = "UI_GACHA_WISH_POINT",
  WishHistory = "UI_GUIDE_BUTTON_HISTORY",
  WishProbabilityUp = "UI_GACHA_SHOW_PANEL_PROBABILITY_UP",
  WishRateUp = "UI_GACHA_SHOW_PANEL_DETAIL_03",
  WishStandard = "UI_GACHA_TYPE_02",
  WishWeaponEvent = "UI_GACHA_TYPE_04",
  WitheringPurpurbloom = "1419660612",
  Wolvendom = "3611930813",
  WorldLevel = "UI_WORLDLEVEL_TITLE",
  // The World Level dialog the profile card's info icon opens: what the World Level is, its headings and numbers in
  // Their colour tags, and its button lowering the World Level by one or restoring it once lowered
  WorldLevelInfo = "UI_WORLDLEVEL_INFO",
  WorldLevelLower = "UI_WORLDLEVEL_DOWN_BUTTON",
  WorldLevelRevert = "UI_WORLDLEVEL_UP_BUTTON",
  ZaytunPeach = "492153948",
}

export const GameTextKeys: readonly GameTextKey[] = Object.values(GameTextKey);
