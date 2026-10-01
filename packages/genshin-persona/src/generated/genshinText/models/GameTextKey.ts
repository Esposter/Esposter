// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand
// Every string of the game's a consumer shows, by the game's own text id — the name its manual text map files the
// String under, or the raw text hash where it files none. The game already holds each in all fifteen languages,
// So referencing a new one is a line here and a run of `pnpm -C scripts genshin:text write`, which reads this enum as
// Its inventory; `genshin:text find` prints the id of any English text
export enum GameTextKey {
  // The label over a character's birthday on their profile
  Birthday = "INFORMATION_AVATAR_BIRTHDAY",
  // The health notice's paragraphs, a blank line between them
  HealthNotice = "684850635",
  HealthNoticeTitle = "1737243758",
  Loading = "UI_BEYOND_RECOMMEND_EMPTY_LOADING",
  // The login screen's status lines under its progress bar, in the order it shows them
  LoginCheckingForUpdates = "1285204118",
  LoginLoadingData = "1128933734",
  LoginLoadingGame = "1102014722",
  LoginPreparingDownload = "796445964",
  // The login screen's title and the label before the account's name
  LoginTitle = "3574932777",
  LoginUserLabel = "2272745789",
  Ready = "ONLINE_DUNGEON_GUEST_IS_READY",
}

export const GameTextKeys: readonly GameTextKey[] = Object.values(GameTextKey);
