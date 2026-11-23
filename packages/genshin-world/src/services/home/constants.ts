import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

// The lowest rank a Trust Rank or an Adeptal Energy rank can read as, the first row of each table
export const HOME_MINIMUM_RANK = 1;
// The Adventure Rank the Serenitea Pot opens the realm at, and below which it does not
export const HOME_REALM_UNLOCK_RANK = 28;
// Provisional: a Realm Currency or Realm Bounty rate counts per real hour, which a recording of a realm's store across one
// Hour settles, on the roadmap's References sought list
export const HOME_RATE_PERIOD_SECONDS = 3600;
// The bound's counts: eight realms, each with four exterior areas and seven interior ones, and the furnishings an area
// Holds at most as the wiki's Load page gives them, 449 an exterior area and 149 a room. A save's placements are
// Bounded by the most the realms' areas hold at those counts
const HOME_REALM_COUNT = 8;
const HOME_EXTERIOR_AREA_COUNT = 4;
const HOME_INTERIOR_AREA_COUNT = 7;
export const HOME_EXTERIOR_FURNISHING_LIMIT = 449;
export const HOME_INTERIOR_FURNISHING_LIMIT = 149;
// The most placements a save holds. The dump's own scenes hold fewer, so this is a ceiling that every save the game
// Allows fits
export const MAX_HOME_PLACEMENT_COUNT =
  HOME_REALM_COUNT *
  (HOME_EXTERIOR_AREA_COUNT * HOME_EXTERIOR_FURNISHING_LIMIT +
    HOME_INTERIOR_AREA_COUNT * HOME_INTERIOR_FURNISHING_LIMIT);
// The most of each list a realm's progress holds in a stored save: the app's own storage ceilings, which the save schema
// Bounds a realm's lists by, so a crafted save cannot grow the blob without limit. Each is set above the count the dump
// Holds, so every save the game allows is stored, and none is a copy of a game count: the companions a realm deploys (8
// Of the dump's `HomeworldLevelExcelConfigData` rows at the top Trust Rank), the queues a Trust Rank opens (10 levels),
// The furnishing blueprints (1,405 rows of `FurnitureMakeExcelConfigData`, one per configID) and the Companions' one-time
// Rewards (233 distinct `rewardID`s of the `HOME_AVATAR_REWARD_EVENT` rows of `HomeWorldEventExcelConfigData`). Each
// Ceiling is the next power of two above the count
export const MAX_STORED_HOME_COMPANION_COUNT = 16;
export const MAX_STORED_HOME_ORDER_COUNT = 16;
export const MAX_STORED_HOME_BLUEPRINT_COUNT = 2048;
export const MAX_STORED_HOME_REWARD_CLAIM_COUNT = 256;
// The Serenitea Pot's gadget: the material row of the widget type with id 220026, which the dump names with the name hash
// 200477924, the English "Serenitea Pot". The gadget is the material, and the realm is entered by its use
export const HOME_POT_GADGET_ID = 220026;
// Tubby, the realm's steward: the NPC row 13276, named by the name hash 3432976792, who sells from the Realm Depot, shop
// 1048, which `VendorShopTypeMap` keys by him
export const HOME_TUBBY_NPC_ID = 13276;
// Provisional, made up until the PC exports the realm layout: the region a pot set down in the open world is in, which the
// Realm returns the player to, the island's ground and radius, the spawn the player lands at, and the two standing points
export const HOME_STAND_IN_POT_REGION_ID = "mondstadt";
export const HOME_REALM_GROUND_HEIGHT = 0;
export const HOME_REALM_ISLAND_RADIUS = 40;
export const HOME_REALM_SPAWN: WorldJumpPose = { heightOffset: 0, point: { x: 0, z: 0 }, yaw: 0 };
export const HOME_REALM_STEWARD_POINT = { x: 6, z: 0 };
export const HOME_REALM_EXIT_POINT = { x: -6, z: 0 };
