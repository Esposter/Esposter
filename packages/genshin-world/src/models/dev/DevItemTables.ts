import type { DevSaveTables } from "#src/models/dev/DevSaveTables";

// The name tables a line's item is resolved against: the game's words, and the materials and their names in the reader's language
export type DevItemTables = Pick<DevSaveTables, "gameText" | "materialDataMap" | "nameText">;
