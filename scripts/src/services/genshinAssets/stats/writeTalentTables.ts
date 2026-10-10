import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { TalentTables } from "#src/models/genshinAssets/stats/TalentTables";

import { TALENT_MULTIPLIER_GENERATED_DIRECTORY } from "#src/services/genshinAssets/stats/constants";
import { getTalentMultiplierLoaderMapSource } from "#src/services/genshinAssets/stats/getTalentMultiplierLoaderMapSource";
import { GameDataset } from "genshin-world";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Writes the loader map whose entries read each character's multipliers from the hosted index, the one generated file that
// Stays committed TS. Returns each character's multipliers and labels as the entries of the two indexes that publish them,
// Keyed by the character's id
export const writeTalentTables = (talentTables: readonly TalentTables[]): GameDataPublication["indexes"] => {
  writeFileSync(
    join(TALENT_MULTIPLIER_GENERATED_DIRECTORY, "TalentMultiplierLoaderMap.ts"),
    getTalentMultiplierLoaderMapSource(talentTables.map(({ characterId }) => characterId)),
  );
  return {
    [GameDataset.TalentLabels]: Object.fromEntries(
      talentTables.map(({ characterId, labelMap }) => [String(characterId), labelMap]),
    ),
    [GameDataset.TalentMultipliers]: Object.fromEntries(
      talentTables.map(({ characterId, multiplierMap }) => [String(characterId), multiplierMap]),
    ),
  };
};
