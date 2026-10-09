import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";

import { TalentMultiplierLoaderMap } from "#src/generated/talentMultipliers/TalentMultiplierLoaderMap";
import { talentMultiplierMapSchema } from "#src/models/character/TalentMultiplierMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The combat talent multipliers of the characters given, each one's chunk imported on demand and checked against its
// Schema as it arrives, merged by proud skill group. A character the table holds no chunk for is refused
export const readTalentMultipliers = async (characterIds: readonly number[]): Promise<TalentMultiplierMap> => {
  const chunks = await Promise.all(
    characterIds.map(async (characterId) => {
      const loadChunk = TalentMultiplierLoaderMap[characterId];
      if (!loadChunk) throw new InvalidOperationError(Operation.Read, `${characterId}`, "no talent multipliers");
      return talentMultiplierMapSchema.parse((await loadChunk()).default);
    }),
  );
  return Object.fromEntries(chunks.flatMap((chunk) => Object.entries(chunk)));
};
