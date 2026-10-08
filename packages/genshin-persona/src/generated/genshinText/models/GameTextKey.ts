// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand
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
  // The Paimon menu's profile card, its experience and rank, the world level and the player's UID with its copy
  AdventureExp = "UI_PLAYER_PROFILE_PLAYEREXP",
  AdventureRank = "UI_PLAYER_PROFILE_PLAYERLV",
  AdventurerHandbook = "UI_ADVENTURE_CARD_TITLE",
  Archive = "UI_CODEX_HOME_TITLE",
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
  // The settings' side bar tab for the sound, with the graphics one beside it
  Audio = "UI_SETTING_PAGE_SOUND_CATEGORY",
  // A screen's way back to the world
  Back = "VIDEO_RETREAT",
  BattlePass = "UI_STC_GAMEENTRYPAGE_BP",
  // The label over a character's birthday on their profile
  Birthday = "INFORMATION_AVATAR_BIRTHDAY",
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
  // The Paimon menu's link to the game's community, which opens a web page
  Community = "UI_STC_GAMEENTRYPAGE_COMMUNITY",
  CompatibilityMode = "1992637634",
  // The quit prompt's first button, which goes back to the world
  ContinueGame = "UI_LOGOUT_CONFIRM_CONTINUE_GAME",
  CoOp = "UI_STC_GAMEENTRYPAGE_ONLINE",
  Copy = "UI_FRIEND_COPY",
  // The enemies' drops by their item names
  DamagedMask = "461826100",
  // The dialogue's auto-play button, as it reads while off and while playing
  DialogueAuto = "UI_TALK_DIALOG_AUTO_TALK_START",
  DialogueAutoPlaying = "UI_TALK_DIALOG_AUTO_TALK_STOP",
  // The HUD's skill and burst buttons, named as the controls name their keys
  ElementalBurst = "CONTROL_SKILL5",
  ElementalSkill = "CONTROL_SKILL2",
  Events = "UI_STC_GAMEENTRYPAGE_ACTIVITY",
  // The quit prompt's button that exits the game to the desktop
  ExitToDesktop = "UI_LOGOUT_CONFIRM_EXIT_TO_DESKTOP",
  // The quit prompt's button that leaves the world for the login interface
  ExitToLoginInterface = "UI_LOGOUT_CONFIRM_EXIT_TO_TITLE_SCREEN",
  // The feedback link, a web page the Paimon menu opens
  Feedback = "UI_STC_GAMEENTRYPAGE_FEEDBACK",
  Friends = "UI_FRIEND_TITLE",
  GameTitle = "LANGUAGE_WINDOWS_TITLENAME",
  GenesisCrystal = "2722599324",
  // The game's own name, as its window's title says it
  // The settings' graphics tab and its rows: the quality tier, the custom tier's and the global illumination
  Graphics = "UI_SETTING_PAGE_GRAPHIC_CATEGORY",
  GraphicsAdvanced = "UI_SETTING_GRAPHICS_ADVANCED",
  GraphicsGlobalIllumination = "UI_SETTING_GRAPHICS_GLOBAL_ILLUMINATION",
  GraphicsQuality = "UI_SETTING_GRAPHICS_QUALITY",
  // The Adventurer Handbook's tabs
  HandbookCommissions = "UI_ADVENTURE_CARD_EVENT_TITLE",
  HandbookDomains = "UI_ADVENTURE_CARD_DUNGEON_TITLE",
  HandbookEmbattle = "UI_ADVENTURE_INVESTIGATION_CHARASCEND",
  HandbookEnemies = "UI_ADVENTURE_INVESTIGATION_MONSTER_PAGE",
  HandbookExperience = "UI_ADVENTURE_TRAVELS",
  HandbookGuide = "UI_TEXT_QUEST_GUIDE_BOOKMARK",
  // The HUD's HP bars, named for a screen reader
  Health = "FIGHT_PROP_CUR_HP",
  // The health notice's paragraphs, a blank line between them
  HealthNotice = "684850635",
  HealthNoticeTitle = "1737243758",
  IntertwinedFate = "4203128180",
  Inventory = "UI_STC_BAGPAGE_BAG",
  // The bag's tabs, and a tab's room as its name, its count and its limit fill `{0} {1}/{2}`
  InventoryArtifacts = "ITEM_EQUIP",
  InventoryCapacity = "UI_STC_BAGPAGE_CAPACITY_TITLE",
  InventoryCharacterDevelopmentItems = "ITEM_AVATAR",
  InventoryFood = "ITEM_FOOD",
  InventoryFurnishings = "ITEM_FURNITURE",
  InventoryGadget = "ITEM_CITY_REPUTATION",
  InventoryMaterials = "ITEM_MATERIAL",
  InventoryPreciousItems = "ITEM_CONSUME",
  InventoryQuest = "ITEM_QUEST",
  InventoryWeapons = "ITEM_WEAPON",
  // An item and its count, its name in place of `{0}` and the count in place of `{1}`
  ItemCount = "SHOP_ITEM_NAME_AND_COUNT",
  // The touch controls' jump button, which a screen reader says in place of its glyph
  Jump = "UI_ACTIVITY_LOLI_RUN_JUMP",
  // A level as the game writes one, its number in place of `{0}`
  LevelFormat = "UI_COMMON_LEVEL_FORMAT",
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
  Mail = "UI_PLAYER_PROFILE_MAIL",

  Map = "UI_STC_MAP_TITLE",
  MasterlessStardust = "3899400612",
  MasterlessStarglitter = "1417946372",
  Mora = "3578052980",
  Notices = "UI_STC_GAMEENTRYPAGE_BULLETIN",
  OminousMask = "1726035172",
  // The HUD's corner button that opens the Paimon menu, named for the face it shows
  Paimon = "NPC_EXPNAME_12911",
  PartySetup = "UI_TEAM_TITLE",
  PressToOpen = "1860729186",
  Primogem = "2696654964",
  // The quest screen's button on the quest being navigated to
  QuestCancelNavigation = "TASK_TRACK_CLEAR",
  // The quest screen's lists, each a tab and a heading over its quests
  QuestCategoryArchon = "TASK_TYPE_MAIN",
  QuestCategoryCommission = "TASK_TYPE_WORLD",
  QuestCategoryStory = "TASK_TYPE_BRANCH",
  QuestCategoryWorld = "TASK_TYPE_OTHERS",
  // The same button on any other quest
  QuestNavigate = "TASK_TRACK_ENSURE",
  Quests = "UI_STC_GAMEENTRYPAGE_QUEST",
  QuitGame = "UI_STC_GAMEENTRYPAGE_EXIT_TIPS",
  Ready = "ONLINE_DUNGEON_GUEST_IS_READY",
  Settings = "UI_STC_GAMEENTRYPAGE_OPTION",
  Shop = "UI_STC_GAMEENTRYPAGE_SHOP",
  // The dialogue's button that runs on to the next reply or the end
  Skip = "UI_SKIP_BUTTON",
  // The weapons' and artifacts' sort, by level or quality, ascending or descending
  SortAscending = "UI_RelicIterations_Ordering_Ascending",
  SortDescending = "UI_RelicIterations_Ordering_Descending",
  SortLevel = "SORT_BY_LEVEL",
  SortQuality = "SORT_BY_QUALITY",
  StainedMask = "3015475460",
  // The HUD's stamina meter, named for a screen reader
  Stamina = "133358079",
  // A Statue of The Seven, as the map titles its mark
  StatueOfTheSeven = "UI_MAPMARK_MarkGoddess_TITLE",
  // Photo mode's own shutter, which the Paimon menu's entry into it says too
  TakePhoto = "UI_PIC_MAIN_PCPS_C",
  // The map's way to a place, as its button says
  Teleport = "UI_BUTTON_GOTO",
  Time = "UI_STC_GAMEENTRYPAGE_TIME",
  // The mainland client's publishing licence under its title logo: its approval, ISBN, publisher and copyright holder
  TitleLicence = "3231160485",
  TrainingGuide = "UI_TRAININGGUIDE_TITLE",
  // The player's own title, a word per gender where the language has one
  Traveler = "UI_TEXT_QUEST_GUIDE_LABEL",
  UID = "UI_PLAYER_PROFILE_UID",
  Wish = "UI_GACHA_TITLE",
  // The wish's kinds, a set's button with its count in place of `{0}`, and the Epitomized Path with its Fate Points
  // In place of `{0}` of `{1}`
  WishBeginners = "UI_GACHA_SHOW_PANEL_A016_TITLE",
  WishCharacterEvent = "UI_GACHA_TYPE_03",
  WishCount = "UI_GACHAPAGE_DOGACHA",
  WishEpitomizedPath = "UI_GACHA_WISH",
  WishFatePoint = "UI_GACHA_WISH_POINT",
  WishStandard = "UI_GACHA_TYPE_02",
  WishWeaponEvent = "UI_GACHA_TYPE_04",
  WorldLevel = "UI_WORLDLEVEL_TITLE",
}

export const GameTextKeys: readonly GameTextKey[] = Object.values(GameTextKey);
