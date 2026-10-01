// Every string of the game's a consumer shows, by the game's own text id — the name its manual text map files the
// String under, or the raw text hash where it files none. The game already holds each in all fifteen languages,
// So referencing a new one is a line here and a run of `pnpm -C scripts genshin:text write`, which reads this enum as
// Its inventory; `genshin:text find` prints the id of any English text
export enum GameTextKey {
  // The label over a character's birthday on their profile
  Birthday = "INFORMATION_AVATAR_BIRTHDAY",
  Loading = "UI_BEYOND_RECOMMEND_EMPTY_LOADING",
  Ready = "ONLINE_DUNGEON_GUEST_IS_READY",
}

export const GameTextKeys: readonly GameTextKey[] = Object.values(GameTextKey);
