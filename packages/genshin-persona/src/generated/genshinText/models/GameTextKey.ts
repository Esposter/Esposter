// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand
// Every string of the game's a consumer shows, by the game's own text id — the name its manual text map files the
// String under, the raw text hash where it files none, or the account kit's own key for a string the game shows before
// It has loaded its text map. The game already holds each in all fifteen languages, so referencing a new one is a line
// Here and a run of `pnpm -C scripts genshin:text write`, which reads this enum as its inventory; `genshin:text find`
// Prints the id of any English text
export enum GameTextKey {
  // The label over a character's birthday on their profile
  Birthday = "INFORMATION_AVATAR_BIRTHDAY",
  // The game's own name, as its window's title says it
  GameTitle = "LANGUAGE_WINDOWS_TITLENAME",
  // The health notice's paragraphs, a blank line between them
  HealthNotice = "684850635",
  HealthNoticeTitle = "1737243758",
  Loading = "UI_BEYOND_RECOMMEND_EMPTY_LOADING",
  // The door's prompt, worded per platform in the game's text and the PC's kept
  LoginBegin = "3535917252",
  // The login screen's status lines under its progress bar, in the order it shows them
  LoginCheckingForUpdates = "1285204118",
  LoginLoadingData = "1128933734",
  LoginLoadingGame = "1102014722",
  // What the login screen's round buttons do, which a screen reader says in place of their glyphs: the door's log
  // Out, the notices, the quit at the foot's left, the client's repair and the settings
  LoginLogOut = "496124396",
  LoginNotices = "UI_STC_GAMEENTRYPAGE_BULLETIN",
  LoginPreparingDownload = "796445964",
  LoginQuit = "UI_STC_GAMEENTRYPAGE_EXIT_TIPS",
  LoginRepair = "857403427",
  LoginSettings = "UI_STC_GAMEENTRYPAGE_OPTION",
  // The login screen's title and the label before the account's name
  LoginTitle = "3574932777",
  LoginUserLabel = "2272745789",
  // The welcome card's greeting, the player's name in place of its `%s`
  LoginWelcome = "tips_enter_game",
  Ready = "ONLINE_DUNGEON_GUEST_IS_READY",
  // The mainland client's publishing licence under its title logo: its approval, ISBN, publisher and copyright holder
  TitleLicence = "3231160485",
  // The player's own title, a word per gender where the language has one
  Traveler = "UI_TEXT_QUEST_GUIDE_LABEL",
}

export const GameTextKeys: readonly GameTextKey[] = Object.values(GameTextKey);
