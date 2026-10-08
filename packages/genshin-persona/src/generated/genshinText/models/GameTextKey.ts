// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand
// Every string of the game's a consumer shows, by the game's own text id — the name its manual text map files the
// String under, the raw text hash where it files none, or the account kit's own key for a string the game shows before
// It has loaded its text map. The game already holds each in all fifteen languages, so referencing a new one is a line
// Here and a run of `pnpm -C scripts genshin:text write`, which reads this enum as its inventory; `genshin:text find`
// Prints the id of any English text
export enum GameTextKey {
  // The screens the world opens are named as the Paimon menu names their entries, or as a screen titles its own page
  Achievements = "UI_ACHIEVEMENT_TITLE",
  AdventurerHandbook = "UI_ADVENTURE_CARD_TITLE",
  Archive = "UI_CODEX_HOME_TITLE",
  // A screen's way back to the world
  Back = "VIDEO_RETREAT",
  BattlePass = "UI_STC_GAMEENTRYPAGE_BP",
  // The label over a character's birthday on their profile
  Birthday = "INFORMATION_AVATAR_BIRTHDAY",
  Character = "UI_STC_GAMEENTRYPAGE_PLAYER",
  CharacterArchive = "UI_PLAYER_PROFILE_CHARACTER_NEW",
  Chat = "UI_CHAT_CHAT_BUTTON",
  CoOp = "UI_STC_GAMEENTRYPAGE_ONLINE",
  Events = "UI_STC_GAMEENTRYPAGE_ACTIVITY",
  Friends = "UI_FRIEND_TITLE",
  // The game's own name, as its window's title says it
  GameTitle = "LANGUAGE_WINDOWS_TITLENAME",
  // The health notice's paragraphs, a blank line between them
  HealthNotice = "684850635",
  HealthNoticeTitle = "1737243758",
  Inventory = "UI_STC_BAGPAGE_BAG",
  // The touch controls' jump button, which a screen reader says in place of its glyph
  Jump = "UI_ACTIVITY_LOLI_RUN_JUMP",
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
  Notices = "UI_STC_GAMEENTRYPAGE_BULLETIN",
  // The HUD's corner button that opens the Paimon menu, named for the face it shows
  Paimon = "NPC_EXPNAME_12911",
  PartySetup = "UI_TEAM_TITLE",
  Quests = "UI_STC_GAMEENTRYPAGE_QUEST",
  QuitGame = "UI_STC_GAMEENTRYPAGE_EXIT_TIPS",
  Ready = "ONLINE_DUNGEON_GUEST_IS_READY",
  Settings = "UI_STC_GAMEENTRYPAGE_OPTION",
  Shop = "UI_STC_GAMEENTRYPAGE_SHOP",
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
  Wish = "UI_GACHA_TITLE",
}

export const GameTextKeys: readonly GameTextKey[] = Object.values(GameTextKey);
