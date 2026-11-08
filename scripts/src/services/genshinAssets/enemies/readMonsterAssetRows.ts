import type { MonsterAssetRow } from "#src/models/genshinAssets/enemies/MonsterAssetRow";

import { MONSTER_TABLE_NAME } from "#src/services/genshinAssets/enemies/constants";
import { EXCEL_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The path hash fields a row keeps as the text the dump writes them in, since a number keeps only a 64-bit hash's high
// Bits and rounds its low bits away
const PATH_HASH_KEYS = new Set(["combatConfigHash", "controllerPathHash", "prefabPathHash"]);

// Every row of the game's monster table, its path hashes read from their source text. Not through readExcelTable, whose
// `fillDumpDefaults` writes 0 into a row the dump leaves a hash out of, and the unnamed count would then read that 0 as a
// Hash no path names
export const readMonsterAssetRows = (): MonsterAssetRow[] =>
  parseMachineJson<MonsterAssetRow[]>(
    readFileSync(join(EXCEL_DIRECTORY, `${MONSTER_TABLE_NAME}.json`), "utf8"),
    (key, value, { source }) => (PATH_HASH_KEYS.has(key) && source !== undefined ? source : value),
  );
