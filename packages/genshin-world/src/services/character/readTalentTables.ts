import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";
import type { TalentUpgradeMap } from "#src/models/character/TalentUpgradeMap";

import { talentUpgradeMapSchema } from "#src/models/character/TalentUpgradeMap";
import { readCharacterTalentKits } from "#src/services/character/readCharacterTalentKits";
import { readGameData } from "#src/services/data/readGameData";

// The talent tables `pnpm -C scripts genshin:assets stats` publishes
// Fetched by their keys from the hosted game data and checked against their shapes as they arrive
export const readTalentTables = async (
  gameDataBaseUrl: string,
): Promise<{ characterTalentKits: CharacterTalentKit[]; talentUpgradeMap: TalentUpgradeMap }> => {
  const [characterTalentKits, talentUpgradeMap] = await Promise.all([
    readCharacterTalentKits(gameDataBaseUrl),
    readGameData(gameDataBaseUrl, "stats/talentUpgrades", talentUpgradeMapSchema),
  ]);
  return { characterTalentKits, talentUpgradeMap };
};
