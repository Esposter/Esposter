import type { GcsimTalentParameter } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentParameter";
import type { GcsimTalentReference } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentReference";

// The parameter a talent reference selects, the label's first unless its selector names another
export const readGcsimTalentParameter = (
  talentParameterMap: Map<string, GcsimTalentParameter>,
  { label, selector, type }: GcsimTalentReference,
): GcsimTalentParameter["parameters"][number] | undefined => {
  const parameters = talentParameterMap.get(`${type}|${label}`)?.parameters;
  return parameters?.[selector] ?? parameters?.[0];
};
