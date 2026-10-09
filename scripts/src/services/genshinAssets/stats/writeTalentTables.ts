import type { TalentTables } from "#src/models/genshinAssets/stats/TalentTables";

import {
  TALENT_LABEL_GENERATED_DIRECTORY,
  TALENT_MULTIPLIER_GENERATED_DIRECTORY,
} from "#src/services/genshinAssets/stats/constants";
import { getTalentMultiplierLoaderMapSource } from "#src/services/genshinAssets/stats/getTalentMultiplierLoaderMapSource";
import { toJson } from "#src/services/genshinAssets/stats/toJson";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Writes each character's multipliers and labels as a chunk of its own, and the loader map the world imports the
// Multipliers through. Both folders are rewritten whole, so a character gone from the dump leaves no chunk behind
export const writeTalentTables = (talentTables: readonly TalentTables[]): void => {
  for (const directory of [TALENT_MULTIPLIER_GENERATED_DIRECTORY, TALENT_LABEL_GENERATED_DIRECTORY]) {
    rmSync(directory, { force: true, recursive: true });
    mkdirSync(directory, { recursive: true });
  }
  for (const { characterId, labelMap, multiplierMap } of talentTables) {
    writeFileSync(join(TALENT_MULTIPLIER_GENERATED_DIRECTORY, `${characterId}.json`), toJson(multiplierMap));
    writeFileSync(join(TALENT_LABEL_GENERATED_DIRECTORY, `${characterId}.json`), toJson(labelMap));
  }
  writeFileSync(
    join(TALENT_MULTIPLIER_GENERATED_DIRECTORY, "TalentMultiplierLoaderMap.ts"),
    getTalentMultiplierLoaderMapSource(talentTables.map(({ characterId }) => characterId)),
  );
};
