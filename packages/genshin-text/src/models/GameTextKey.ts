// Every string of the game's a consumer shows, by the game's own text id — the name its manual text map files the
// String under, the raw text hash where it files none, or the account kit's own key for a string the game shows before
// It has loaded its text map. The game already holds each in all fifteen languages, so referencing a new one is a line
// Here and a run of `pnpm -C scripts genshin:text write`, which reads this enum as its inventory; `genshin:text find`
// Prints the id of any English text
export enum GameTextKey {
  // The screens the world opens are named as the Paimon menu names their entries, or as a screen titles its own page
  // The Spiral Abyss's fixed words the Abyss's screens show, named as the game's manual text map files them
  AbyssBenedictionHint = "UI_TOWER_HINT_BATTLEBUFF",
  AbyssCorridor = "UI_TOWER_CORRIDOR",
  AbyssMoonSpire = "UI_TOWER_SPIRAL",
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
  AnemoSigil = "4197855388",
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
  // The button that lifts a character past its level cap with Masterless Stella Fortuna
  AscensionLimit = "UI_TEXT_ACTIVITY_LEVEL_UP",
  // The character screen's attributes under the game's own names, and the groups its details sort them into
  AttributeAnemoDamageBonus = "FIGHT_PROP_WIND_ADD_HURT",
  AttributeAnemoResistance = "FIGHT_PROP_WIND_SUB_HURT",
  AttributeAttack = "FIGHT_PROP_CUR_ATTACK",
  AttributeBaseAttack = "FIGHT_PROP_BASE_ATTACK",
  AttributeBaseDefense = "FIGHT_PROP_BASE_DEFENSE",
  AttributeBaseHealth = "FIGHT_PROP_BASE_HP",
  AttributeCooldownReduction = "FIGHT_PROP_SKILL_CD_MINUS_RATIO",
  AttributeCriticalDamage = "FIGHT_PROP_CRITICAL_HURT",
  AttributeCriticalRate = "FIGHT_PROP_CRITICAL",
  AttributeCryoDamageBonus = "FIGHT_PROP_ICE_ADD_HURT",
  AttributeCryoResistance = "FIGHT_PROP_ICE_SUB_HURT",
  AttributeDefense = "FIGHT_PROP_CUR_DEFENSE",
  AttributeDendroDamageBonus = "FIGHT_PROP_GRASS_ADD_HURT",
  AttributeDendroResistance = "FIGHT_PROP_GRASS_SUB_HURT",
  AttributeElectroDamageBonus = "FIGHT_PROP_ELEC_ADD_HURT",
  AttributeElectroResistance = "FIGHT_PROP_ELEC_SUB_HURT",
  AttributeElementalMastery = "FIGHT_PROP_ELEMENT_MASTERY",
  AttributeEnergyRecharge = "FIGHT_PROP_CHARGE_EFFICIENCY",
  AttributeGeoDamageBonus = "FIGHT_PROP_ROCK_ADD_HURT",
  AttributeGeoResistance = "FIGHT_PROP_ROCK_SUB_HURT",
  AttributeGroupAdvanced = "UI_AVATAR_INFO_PROP_ADVANCED",
  AttributeGroupBase = "UI_AVATAR_INFO_PROP_BASICS",
  AttributeGroupElemental = "UI_AVATAR_INFO_PROP_ELEMENT",
  AttributeHealingBonus = "FIGHT_PROP_HEAL_ADD",
  AttributeHydroDamageBonus = "FIGHT_PROP_WATER_ADD_HURT",
  AttributeHydroResistance = "FIGHT_PROP_WATER_SUB_HURT",
  AttributeIncomingHealingBonus = "FIGHT_PROP_HEALED_ADD",
  AttributeMaxHealth = "FIGHT_PROP_MAX_HP",
  AttributeMaxStamina = "PROP_MAX_STAMINA",
  AttributePhysicalDamageBonus = "FIGHT_PROP_PHYSICAL_ADD_HURT",
  AttributePhysicalResistance = "FIGHT_PROP_PHYSICAL_SUB_HURT",
  AttributePyroDamageBonus = "FIGHT_PROP_FIRE_ADD_HURT",
  AttributePyroResistance = "FIGHT_PROP_FIRE_SUB_HURT",
  AttributeShieldStrength = "FIGHT_PROP_SHIELD_COST_MINUS_RATIO",
  // A level above the player's Adventure Rank, the rank the game asks for in its place
  AvailableAtAdventureRank = "QUEST_DIALOG_DETAIL_PLAYER_LEVEL_NEED",
  // A screen's way back to the world
  Back = "VIDEO_RETREAT",
  BagFull = "UI_BEYOND_RUNTIME_UI_DROP_PICKTIPS_FAIL",
  BambooShoot = "4238416012",
  BattlePass = "UI_STC_GAMEENTRYPAGE_BP",
  BerylConch = "1859043748",
  BirdEgg = "2577348708",
  // The label over a character's birthday on their profile
  Birthday = "INFORMATION_AVATAR_BIRTHDAY",
  // The blossom of an outcrop that gives Character EXP materials, by its English name
  BlossomOfRevelation = "UI_BLOSSOM_CHEST_TIMEOUT_EXP",
  // The blossom of an outcrop that gives Mora, by its English name
  BlossomOfWealth = "UI_BLOSSOM_CHEST_TIMEOUT_MORA",
  BrilliantChrysanthemum = "2302571844",
  BulleFruit = "457891068",
  Cacahuatl = "1982182708",
  CallaLily = "4260602356",
  // A dialog's way out without its action, the generic word the game's own dialogs share
  Cancel = "UI_BEYOND_CANCEL",
  CandlecapMushroom = "767225220",
  Carrot = "3407195260",
  Cecilia = "3828726124",
  // The Change World Level prompt over the World Level dialog: its title, the World Level now and the one the change sets
  ChangeWorldLevel = "UI_WORLDLEVEL_ADJUST_TITLE",
  Character = "UI_STC_GAMEENTRYPAGE_PLAYER",
  CharacterArchive = "UI_PLAYER_PROFILE_CHARACTER_NEW",
  // The character screen's tabs
  CharacterArtifacts = "UI_STC_CHARACTERPAGE_RELIC",
  CharacterAscend = "UI_STC_CHARACTER_PAGE_STAR_UP",
  CharacterAttributes = "UI_STC_CHARACTER_PAGE_AVATAR",
  CharacterConstellation = "UI_STC_CHARACTERPAGE_TALENT",
  CharacterDetails = "UI_CHARACTER_DETAIL",
  CharacterProfile = "FETTER_NAME",
  CharacterTalents = "UI_STC_CHARACTERPAGE_SKILL",
  CharacterWeapons = "UI_STC_CHARACTERPAGE_WEAPON",
  Chat = "UI_CHAT_CHAT_BUTTON",
  // The chest a buried place holds once dug up, as the game names a chest with no tier
  Chest = "219181593",
  // The City Reputation the Paimon menu names, and the Reputation Reward its screen titles over its nation
  CityReputation = "81370119",
  ClearwaterJade = "2720928108",
  // A domain closed on the day, named as a closed hall or event names it
  Closed = "UI_BEYOND_HALL_LIST_HALL_LEFTTIME_CLOSE",
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
  // A dialog's action that goes ahead, the generic word the game's own dialogs share beside Cancel
  Confirm = "UI_BEYOND_CONFIRM",
  // The button that makes a whole batch of a dish once its proficiency is full
  CookingAutoCook = "UI_COOKING_QTE_AUTO_MAKE_BUTTON",
  // The cooking screen's title and the Stop button that ends its indicator
  CookingStop = "UI_COOKING_QTE_END_BUTTON",
  CookingTitle = "UI_COOKING_QTE_TITLE",
  // The Petrified Tree a cleared domain raises, the tree the claim prompt names
  PetrifiedTree = "UI_ABYSSUS_CHEST_OPEN_TITLE",
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
  CryoSigil = "821438660",
  CrystalChunk = "1448077684",
  CrystalCore = "2435040556",
  CrystalMarrow = "307506436",
  DadaupaGorge = "3497395333",
  // The enemies' drops by their item names
  DamagedMask = "461826100",
  DandelionSeed = "2071890124",
  Dendrobium = "354894236",
  DendroSigil = "2628812996",
  // Party Setup's button that deploys the team shown
  Deploy = "UI_BUTTON_ENABLE_TEAM",
  // The dialogue's auto-play button, as it reads while off and while playing
  DialogueAuto = "UI_TALK_DIALOG_AUTO_TALK_START",
  DialogueAutoPlaying = "UI_TALK_DIALOG_AUTO_TALK_STOP",
  // The Dig prompt on the ground of a buried chest, as the game names it
  Dig = "102754774",
  // A domain's entrance, as its map pin and its entry screen title it
  DomainEntrance = "UI_STC_DUNGEONENTRYPAGE_DungeonEntry",
  // The button that goes into an open domain from its entry screen
  DomainEnter = "UI_DUNGEON_ENTRY_47",
  // The button that leaves the domain the player is in, as the game's leave prompt names it
  DomainLeave = "INFO_AVATAR_TRANSPORT_DUNGEON_TITLE",
  // The question the leave prompt asks before the player leaves a domain
  DomainLeavePrompt = "UI_STC_Intee_DungeonExit",
  // The title of a domain's entry screen
  DomainTitle = "4043227537",
  Dracolite = "2859410932",
  // The enemies' level on a domain's entry screen, filled with the level
  EnemyLevel = "669745132",
  // The Electro Crystal node the map marks under Inventory / Materials, named as its gathering point names it
  ElectroCrystal = "2189505020",
  ElectroSigil = "1061302548",
  // The HUD's skill and burst buttons, named as the controls name their keys
  ElementalBurst = "CONTROL_SKILL5",
  ElementalSkill = "CONTROL_SKILL2",
  EmbercoreFlower = "3599966252",
  EnhancementOre = "2429162676",
  Events = "UI_STC_GAMEENTRYPAGE_ACTIVITY",
  // The picker of the characters a send is made with, headed as the game heads its character list
  ExpeditionCharacterSelection = "UI_AVATAR_SELECT_PS4",
  // The expedition screen's words: the claim of a returned expedition, its recall, its send and its limit
  ExpeditionClaim = "UI_ACTIVITY_EXPEDITION_RECEIVE_REWARD",
  ExpeditionExploring = "UI_EXPLORE_EXPLORING",
  ExpeditionLimit = "UI_EXPLORE_LINELEFT",
  ExpeditionNoBonus = "COOKING_QTE_NO_BONUS_DESC",
  ExpeditionRecall = "UI_ACTIVITY_EXPEDITION_RECALL",
  ExpeditionRewards = "UI_ACTIVITY_EXPEDITION_REWARD1",
  ExpeditionSelectCharacter = "UI_ACTIVITY_EXPEDITION_CHOOSE_CHAR",
  ExpeditionTitle = "UI_EXPLORE_PAGETITLE",
  // The map's line under an area's name, its percentage filled in, and the same line once the area is fully explored,
  // Its percentage in the game's gold
  ExplorationProgress = "UI_EXPLORE_COUNT",
  ExplorationProgressComplete = "UI_EXPLORE_COUNT_MAX",
  // The Exquisite Chest, the middle tier, as the game names it
  ExquisiteChest = "3981652399",
  // The feedback link, a web page the Paimon menu opens
  Feedback = "UI_STC_GAMEENTRYPAGE_FEEDBACK",
  FineEnhancementOre = "377860124",
  // The prompt a fishing point offers on its entrance button, as the game names it
  Fishing = "UI_FISH_ENTRANCE_BUTTON",
  FlamingFlowerStamen = "2387249548",
  FluorescentFungus = "3996649804",
  Fontaine = "Fontaine",
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
  // The claim prompt's row that restores Original Resin with a Fragile Resin, by the game's own words for it
  FragileResinRestore = "UI_GUIDE_FRAGILE_RESIN",
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
  GeoSigil = "3999941044",
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
  HydroSigil = "33541556",
  IcyPebble = "2856476780",
  Inazuma = "Inazuma",
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
  // The bag's gadget action that equips a gadget to the quick-use slot, which Z uses
  InventoryQuickUseGadget = "UI_BEYOND_HALL_WIDGET_USE_BUTTON_SET",
  // The detail panel's button that uses the selected entry of the bag
  InventoryUse = "BAG_USE_BUTTON",
  InventoryWeapons = "ITEM_WEAPON",
  IronChunk = "4060716292",
  // An item and its count, its name in place of `{0}` and the count in place of `{1}`
  ItemCount = "SHOP_ITEM_NAME_AND_COUNT",
  JueyunChili = "22100332",
  // The touch layout's jump button, which a screen reader says in place of its glyph
  Jump = "UI_BEYOND_UIEDITOR_INSPECTOR_JUMP",
  JumpOrMoveUpward = "CONTROL_JUMP_OR_SKILL4",
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
  // The button that raises a character one level with its Character EXP materials
  LevelUp = "UI_STC_CHARACTER_PAGE_LEVEL_UP",
  Liyue = "Liyue",
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
  LunaSigil = "3814931852",
  // The Luxurious Chest, the kind the wiki places in the most hidden spots, as the game names it
  LuxuriousChest = "94050446",
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
  MoveBackward = "CONTROL_MOVE_BACKWARD",
  MoveForward = "CONTROL_MOVE_FORWARD",
  MoveLeft = "CONTROL_MOVE_LEFT",
  MoveRight = "CONTROL_MOVE_RIGHT",
  Mushroom = "1926602188",
  MysticEnhancementOre = "3267705996",
  NakuWeed = "3623663804",
  Natlan = "Natlan",
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
  // Paimon's Bargains, the shop the Paimon menu's Shop entry opens, which sells the Fates and the month's rotation
  PaimonsBargains = "SHOP_TYPE_PAIMON",
  // The four teams every player starts with, each named Party 1 to 4 until it is renamed
  PartyDefaultName1 = "UI_TEAM_DEFAULT_NAME1",
  PartyDefaultName2 = "UI_TEAM_DEFAULT_NAME2",
  PartyDefaultName3 = "UI_TEAM_DEFAULT_NAME3",
  PartyDefaultName4 = "UI_TEAM_DEFAULT_NAME4",
  PartySetup = "UI_TEAM_TITLE",
  PhilanemoMushroom = "873400484",
  PineAmber = "3765897708",
  Pinecone = "4200020428",
  // The name a new player's profile holds until the player sets one, shown by the Paimon menu's profile card
  PlayerDefaultName = "Player_Default_Name",
  // The game over screen's title, once every member of the deployed team has fallen
  PlayerDieNone = "PlayerDieNone",
  // The prompt asking the player for the next member after a fall, in the game's words for a character to select
  PleaseSelectCharacter = "UI_ACTIVITY_WEEK_ACTIVE_UNSELECTED_TIPS",
  PluieLotus = "2192902588",
  PortableBearing = "3720804436",
  // The Precious Chest, the richest tier the wallet rewards, as the game names it
  PreciousChest = "3576739246",
  PressToOpen = "1860729186",
  Primogem = "2696654964",
  // The stove's processing row and its screen's queue button, named by the game's own "Start Processing"
  ProcessingStart = "1809596508",
  PyroSigil = "4277114300",
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
  // The quick swap menu's prompt over its slots while Z is held, and the word on its key that switches to the slot chosen
  QuickSwapSelect = "WIDGET_QUICK_SWITCH_GUIDE2_2",
  QuickSwapSwitch = "UI_PC_Quick_Switch",
  // The quit prompt's question, which the game asks before the player leaves
  QuitConfirmQuestion = "UI_LOGOUT_CONFIRM_DESC",
  QuitGame = "UI_STC_GAMEENTRYPAGE_EXIT_TIPS",
  Radish = "1137755308",
  RainbowdropCrystal = "3831100636",
  RainbowRose = "2386700548",
  RawMeat = "2492759196",
  Ready = "ONLINE_DUNGEON_GUEST_IS_READY",
  RealmCurrency = "1255754076",
  // A domain level's recommended Adventure Rank, filled with the rank
  RecommendedLevel = "UI_QUEST_RECOMMEND_LEVEL",
  RedBerryshroom = "1096616044",
  // The Remarkable Chest, the kind found in a few regions and rewarding blueprints, as the game names it
  RemarkableChest = "26276094",
  // The features a Reputation level unlocks, each worded as the reward page's unlock line, by its function's name
  ReputationMondstadtMerchantDiscounts = "1610612133",
  ReputationMondstadtOutcropSearch = "1452899589",
  ReputationNotAchieved = "UI_WISHINGPOND_OFFERING_LEVEL_UNREACH",
  ReputationReward = "REPUTATION_CITY_REWARD",
  // The game over screen's button that revives the team at the nearest teleport waypoint
  Revive = "UI_STC_World_Revive",
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
  SettingsAimedHorizontalSensitivity = "UI_SETTING_FOCUS_HOR_SENSITIVITY",
  SettingsAimedVerticalSensitivity = "UI_SETTING_FOCUS_VER_SENSITIVITY",
  SettingsAnisotropicFiltering = "UI_SETTING_GRAPHICS_ANISOTROPIC_FILTERING",
  SettingsAntiAliasing = "UI_SETTING_GRAPHICS_ANTIALIASING",
  SettingsAudio = "UI_SETTING_PAGE_SOUND_CATEGORY",
  SettingsAudioBalance = "UI_SETTING_AUDIO_BALANCE",
  SettingsAudioTitle = "UI_SETTING_AUDIO_TITLE",
  SettingsBloom = "UI_SETTING_GRAPHICS_BLOOM",
  SettingsBoatCameraCorrection = "UI_SKIFFCAMERA_AUTOFIX_SETTING_DESC",
  SettingsBrightness = "UI_SETTING_GRAPHICS_HDR",
  SettingsCameraTitle = "UI_SETTING_CAMERA_SETTING_TITLE",
  SettingsCameraYAxisReset = "UI_AUTOHORIZONTAL_SETTING_DESC",
  SettingsCombatCamera = "UI_COMBATCAMERA_SETTING_DESC",
  SettingsControls = "UI_SETTING_PAGE_CONTROL_CATEGORY",
  SettingsControlsTitle = "UI_SETTING_INPUT_TYPE_TITLE",
  SettingsControlType = "UI_SETTING_INPUT_TYPE",
  SettingsCoOpTeammateEffects = "UI_SETTING_GRAPHICS_REMOTE_AVATAR_EFFECT",
  SettingsCrowdDensity = "UI_SETTING_GRAPHICS_CROWD_DENSITY",
  SettingsCustom = "UI_SETTING_GRAPHICS_ADVANCED",
  SettingsDefault = "UI_SETTING_GRAPHICS_DEFAULT",
  SettingsDefaultCameraDistance = "UI_SETTING_CAMERA_DEFAULT_DISTANCE",
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
  SettingsGameLanguage = "UI_SETTING_GAME_LANGUAGE",
  SettingsGlobalIllumination = "UI_SETTING_GRAPHICS_GLOBAL_ILLUMINATION",
  SettingsGraphics = "UI_SETTING_PAGE_GRAPHIC_CATEGORY",
  SettingsGraphicsQuality = "UI_SETTING_GRAPHICS_QUALITY",
  SettingsGraphicsTitle = "UI_SETTING_GRAPHICS_TITLE",
  SettingsHigh = "UI_SETTING_HIGH",
  SettingsHorizontalSensitivity = "UI_SETTING_DEFAULT_HOR_SENSITIVITY",
  SettingsInputTypeKeyboard = "UI_SETTING_INPUT_TYPE_KEYBOARD",
  SettingsKeyBindingActions = "UI_SETTING_PAGE_KEYBINDING_CHARACTER_ACTION_TITLE",
  SettingsKeyBindings = "UI_SETTING_PAGE_KEYBINDING_CATEGORY",
  SettingsLanguage = "UI_SETTING_PAGE_LANGUAGE_CATEGORY",
  SettingsLanguageTitle = "UI_SETTING_LANGUAGE_TITLE",
  SettingsLow = "UI_SETTING_LOW",
  SettingsMedium = "UI_SETTING_MEDIUM",
  SettingsMessages = "UI_SETTING_PAGE_MESSAGE_CATEGORY",
  SettingsMotionBlur = "UI_SETTING_GRAPHICS_MOTION_BLUR",
  SettingsMusicVolume = "UI_SETTING_AUDIO_MUSIC",
  SettingsMuteWhenMinimized = "UI_SETTING_AUDIO_MINIMIZEMUTE",
  SettingsOff = "UI_SETTING_CLOSE",
  SettingsOn = "UI_SETTING_OPEN",
  SettingsOnlyWhenNotInCombat = "UI_SKIFFCAMERA_AUTOFIX_SETTING_NOTINCOMBAT",
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
  SettingsVerticalSensitivity = "UI_SETTING_DEFAULT_VER_SENSITIVITY",
  SettingsVisualEffects = "UI_SETTING_GRAPHICS_LATER_EFFECT",
  SettingsVoiceOverLanguage = "UI_SETTING_AUDIO_LANGUAGE",
  SettingsVolume = "UI_SETTING_AUDIO_CONFIG",
  SettingsVolumetricFog = "UI_SETTING_GRAPHICS_VOLUMETRIC_FOG",
  SettingsVSync = "UI_SETTING_GRAPHICS_VSYNC",
  Shop = "UI_STC_GAMEENTRYPAGE_SHOP",
  // The Left Today, Left This Week and Left This Month lines a shop's good shows, its count filled in
  ShopLimitDaily = "UI_MALL_LIMIT_BUY_INFO_DAILY",
  ShopLimitMonthly = "UI_MALL_LIMIT_BUY_INFO",
  ShopLimitWeekly = "UI_MALL_LIMIT_BUY_INFO_WEEKLY",
  // The shop's Buy button, which purchases the picked good
  ShopPurchase = "UI_MALL_PAGE_BTN_BUY",
  // The Refreshes in line a shop's good shows, its countdown filled in
  ShopRefresh = "UI_MALL_REFRESH_COUNTDOWN",
  SilkFlower = "1404683740",
  // The dialogue's button that runs on to the next reply or the end
  Skip = "UI_SKIP_BUTTON",
  SkysplitGembloom = "801054964",
  SmallLampGrass = "144892988",
  Snapdragon = "3558597948",
  Snezhnaya = "Snezhnaya",
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
  Sumeru = "Sumeru",
  SumeruRose = "691451364",
  // The Paimon menu's link to the game's survey, drawn disabled
  Survey = "UI_STC_GAMEENTRYPAGE_SURVEY",
  SweetFlower = "1330975132",
  // The touch layout's aim button a bow's wielder has, as the controls list name it, said in place of its glyph
  SwitchAimingMode = "CONTROL_TOGGLE_ATTACK_MODE",
  SwitchToWalkRun = "CONTROL_SLOW_MOVE",
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
  // The blossom a defeated normal boss leaves for its Original Resin claim, by its English name
  TrounceBlossom = "UI_WORLD_WEEKLYBOSS_TIPS_TITLE",
  Uid = "UI_PLAYER_PROFILE_UID",
  // The offer that spends a Condensed Resin on a challenge's claim, by its English name
  UseCondensedResin = "UI_ABYSSUS_COST_BUTTON_ITEM_CONDENSE_RESIN",
  // The offer that spends Original Resin on a challenge's claim, by its English name
  UseOriginalResin = "UI_ABYSSUS_COST_BUTTON_ITEM_RESIN",
  Valberry = "2722402356",
  // The Paimon menu's link to the game's version highlights, drawn disabled
  VersionHighlights = "UI_STC_GAMEENTRYPAGE_HANDBOOK",
  Viparyas = "3570846172",
  // The weapon screen's three actions, the equipment page's buttons: the weapon's level, its ascension and its refinement
  WeaponAscend = "UI_EQUIP_PAGE_STARUP_BUTTON",
  WeaponEnhance = "UI_EQUIP_PAGE_LEVELUP_BUTTON",
  WeaponRefine = "UI_EQUIP_PAGE_AWAKEN_BUTTON",
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
  // The Change World Level prompt's lines: the World Level it sets and the one now, the lowering's question and tips, and
  // The restoring's tips and label
  WorldLevelAdjustedTo = "UI_WORLDLEVEL_ADJUST_HINT",
  WorldLevelCurrent = "UI_WORLDLEVEL_ADJUST_CURRENT_INFO",
  // The World Level dialog the profile card's info icon opens: what the World Level is, its headings and numbers in
  // Their colour tags, and its button lowering the World Level by one or restoring it once lowered
  WorldLevelInfo = "UI_WORLDLEVEL_INFO",
  WorldLevelLower = "UI_WORLDLEVEL_DOWN_BUTTON",
  WorldLevelLowered = "UI_WORLDLEVEL_ADJUST_DOWN_AIM_INFO",
  WorldLevelLowerQuestion = "UI_WORLDLEVEL_ADJUST_HINT_GETEASY_",
  WorldLevelLowerTips = "UI_WORLDLEVEL_ADJUST_DOWN_TIPS",
  WorldLevelRevert = "UI_WORLDLEVEL_UP_BUTTON",
  WorldLevelReverted = "UI_WORLDLEVEL_ADJUST_UP_AIM_INFO",
  WorldLevelRevertTips = "UI_WORLDLEVEL_ADJUST_UP_TIPS",
  ZaytunPeach = "492153948",
  // The map's zoom slider, named by the game's own word for Zoom
  Zoom = "UI_BUTTON_ZOOM",
}

export const GameTextKeys: readonly GameTextKey[] = Object.values(GameTextKey);
