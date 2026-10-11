import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitRecord, TalentMultiplierMap } from "genshin-world";

import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { unflattenKitValues } from "#src/services/genshinAssets/kits/record/unflattenKitValues";
import { kitParameterSchema, kitRecordSchema } from "genshin-world";

// A kit module's record with each number it writes as a literal taken as the table's parameter a source reads for its
// Path, where that parameter is the number at every level, so the record reproduces the module at any level: Noelle's
// Burst cooldown of 15 is her burst group's `CD`, which no level changes
export const adoptKitParameters = (
  moduleRecord: KitRecord,
  sourceCandidateMap: ReadonlyMap<string, readonly KitCandidate[]>,
  talentMultiplierMap: TalentMultiplierMap,
): KitRecord => {
  const valueMap = flattenKitValues(moduleRecord);
  for (const [path, value] of valueMap) {
    if (typeof value !== "number") continue;
    const parameter = (sourceCandidateMap.get(path) ?? [])
      .map((candidate) => kitParameterSchema.safeParse(candidate.value).data)
      .find(
        (candidateParameter) =>
          typeof candidateParameter === "object" &&
          (talentMultiplierMap[candidateParameter.proudSkillGroupId] ?? []).length > 0 &&
          (talentMultiplierMap[candidateParameter.proudSkillGroupId] ?? []).every(
            ({ paramList }) => (paramList[candidateParameter.index] ?? 0) === value,
          ),
      );
    if (parameter !== undefined) valueMap.set(path, parameter);
  }
  return kitRecordSchema.parse(unflattenKitValues(valueMap));
};
