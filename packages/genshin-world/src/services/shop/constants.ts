import type { GameDataKey } from "#src/models/data/GameDataKey";

// The day of the month a monthly good's limit comes back on, at the game's daily hour
export const MONTHLY_REFRESH_DAY_OF_MONTH = 1;
// The day of the week a weekly good's limit comes back on, at the game's daily hour, numbered as Temporal numbers the days
// From Monday, and the days a week holds
export const WEEKLY_REFRESH_DAY_OF_WEEK = 1;
export const DAYS_IN_WEEK = 7;
// The moment a good that never refreshes counts its purchases from, before any of them
export const SHOP_NEVER_REFRESHED_AT = Temporal.Instant.fromEpochMilliseconds(0);
// How many pairs of characters Paimon's Bargains' rotation holds, and the offset that puts January on the fourth of them
export const PAIMON_BARGAINS_PAIR_COUNT = 6;
export const PAIMON_BARGAINS_PAIR_OFFSET = 2;
// Marjorie's shop, the Mondstadt Souvenir Shop, which the Frostbearing Tree's last level opens
export const MONDSTADT_SOUVENIR_SHOP_ID = 1002;
// The shop Paimon's Bargains sells its Fates from, by the shop's id, which its screen reads the Fates of
export const PAIMON_BARGAINS_SHOP_ID = 1001;
// The shops a city vendor sells from, by the shop's id, each with the key of the shops dataset its goods are published in
export const SHOP_GOODS_KEYS: readonly (readonly [number, Extract<GameDataKey, `shops/${string}`>])[] = [
  [PAIMON_BARGAINS_SHOP_ID, "shops/paimonsBargains"],
  [MONDSTADT_SOUVENIR_SHOP_ID, "shops/souvenirMondstadt"],
  [1004, "shops/mondstadtGeneralGoods"],
  [1011, "shops/mondstadtFlora"],
  [1012, "shops/mondstadtCharles"],
  [1013, "shops/mondstadtShiliu"],
  [1014, "shops/mondstadtSchulz"],
  [1015, "shops/mondstadtBrook"],
  [1017, "shops/mondstadtDraff"],
  [1018, "shops/mondstadtChloris"],
  [1064, "shops/mondstadtFishing"],
];
