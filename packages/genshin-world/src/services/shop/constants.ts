import type { GameDataKey } from "#src/models/data/GameDataKey";

// The moment a good that never refreshes counts its purchases from, before any of them
export const SHOP_NEVER_REFRESHED_AT = Temporal.Instant.fromEpochMilliseconds(0);
// How many pairs of characters Paimon's Bargains' rotation holds, and the offset that puts January on the fourth of them
export const PAIMON_BARGAINS_PAIR_COUNT = 6;
export const PAIMON_BARGAINS_PAIR_OFFSET = 2;
// Marjorie's shop, the Mondstadt Souvenir Shop, which the Frostbearing Tree's last level opens
export const MONDSTADT_SOUVENIR_SHOP_ID = 1002;
// Brook's and Draff's shops, the two city vendors the wiki gives by day only, from six in the morning until seven at night
export const BROOK_SHOP_ID = 1015;
export const DRAFF_SHOP_ID = 1017;
export const DAY_VENDOR_SHOP_IDS: readonly number[] = [BROOK_SHOP_ID, DRAFF_SHOP_ID];
// The shop Paimon's Bargains sells its Fates from, by the shop's id, which its screen reads the Fates of
export const PAIMON_BARGAINS_SHOP_ID = 1001;
// The Realm Depot, Tubby's shop, which the realm's depot sells its goods from, by the shop's id
export const REALM_DEPOT_SHOP_ID = 1048;
// The keys of the Realm Depot's goods, one for each of its tabs, in the tabs' order
export const REALM_DEPOT_GOODS_KEYS: readonly Extract<GameDataKey, `shops/${string}`>[] = [
  "shops/realmDepotTreasures",
  "shops/realmDepotFurnishings",
  "shops/realmDepotBlueprints",
  "shops/realmDepotRiches",
  "shops/realmDepotCreatures",
  "shops/realmDepotWood",
];
// The shops a city vendor sells from, by the shop's id, each with the keys of the shops dataset its goods are published
// In, read in the keys' order and joined into one list, which a shop whose goods are split across keys needs
export const SHOP_GOODS_KEYS: readonly (readonly [number, readonly Extract<GameDataKey, `shops/${string}`>[]])[] = [
  [PAIMON_BARGAINS_SHOP_ID, ["shops/paimonsBargains"]],
  [MONDSTADT_SOUVENIR_SHOP_ID, ["shops/souvenirMondstadt"]],
  [1004, ["shops/mondstadtGeneralGoods"]],
  [1005, ["shops/goodHunter"]],
  [1011, ["shops/mondstadtFlora"]],
  [1012, ["shops/mondstadtCharles"]],
  [1013, ["shops/mondstadtShiliu"]],
  [1014, ["shops/mondstadtSchulz"]],
  [1015, ["shops/mondstadtBrook"]],
  [1017, ["shops/mondstadtDraff"]],
  [1018, ["shops/mondstadtChloris"]],
  [1064, ["shops/mondstadtFishing"]],
  [1065, ["shops/liyueFishing"]],
  [1066, ["shops/inazumaFishing"]],
  [1071, ["shops/sumeruFishing"]],
  [1090, ["shops/fontaineFishing"]],
  [1122, ["shops/natlanFishing"]],
  [1137, ["shops/nodKraiFishing"]],
  [1156, ["shops/snezhnayaFishing"]],
  [REALM_DEPOT_SHOP_ID, REALM_DEPOT_GOODS_KEYS],
];
