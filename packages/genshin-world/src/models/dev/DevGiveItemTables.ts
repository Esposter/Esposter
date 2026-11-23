import type { DevSaveTables } from "#src/models/dev/DevSaveTables";

// The tables a dev line's item is given from: its names, and the rooms, reliquary pieces and weapons a bag entry is
// Built from
export type DevGiveItemTables = Pick<
  DevSaveTables,
  "gameText" | "itemRooms" | "materialDataMap" | "nameText" | "reliquaryPieceEntryMap" | "weaponDataMap"
>;
