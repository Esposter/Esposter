import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";

import { TalentMultiplierLoaderMap } from "#src/generated/talentMultipliers/TalentMultiplierLoaderMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The combat talent multipliers of the characters given, each one's entry of the hosted index fetched on demand and
// Checked against its schema as it arrives, merged by proud skill group. A character the index holds no entry for is
// Refused
export const readTalentMultipliers = async (
  gameDataBaseUrl: string,
  characterIds: readonly number[],
): Promise<TalentMultiplierMap> => {
  const chunks = await Promise.all(
    characterIds.map((characterId) => {
      const loadMultipliers = TalentMultiplierLoaderMap[characterId];
      if (!loadMultipliers) throw new InvalidOperationError(Operation.Read, `${characterId}`, "no talent multipliers");
      return loadMultipliers(gameDataBaseUrl);
    }),
  );
  return Object.fromEntries(chunks.flatMap((chunk) => Object.entries(chunk)));
};
