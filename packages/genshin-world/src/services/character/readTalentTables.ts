import type { CharacterTalentKit } from "#src/models/character/CharacterTalentKit";
import type { TalentUpgradeMap } from "#src/models/character/TalentUpgradeMap";

import { characterTalentKitSchema } from "#src/models/character/CharacterTalentKit";
import { talentUpgradeMapSchema } from "#src/models/character/TalentUpgradeMap";
import { z } from "zod";

// The talent tables `pnpm -C scripts genshin:assets stats` writes, imported on demand as chunks of their own and checked
// Against their shapes as they arrive
export const readTalentTables = async (): Promise<{
  characterTalentKits: CharacterTalentKit[];
  talentUpgradeMap: TalentUpgradeMap;
}> => {
  const [{ default: characterTalentKits }, { default: talentUpgradeMap }] = await Promise.all([
    import("#src/generated/stats/characterTalentKits.json"),
    import("#src/generated/stats/talentUpgrades.json"),
  ]);
  return {
    characterTalentKits: z.array(characterTalentKitSchema).parse(characterTalentKits),
    talentUpgradeMap: talentUpgradeMapSchema.parse(talentUpgradeMap),
  };
};
