import type { KitHit } from "#src/models/kit/KitHit";
import type { Except, RequiredKeysOf } from "type-fest";

// Whether a hit's fields are a whole hit short of exactly the fields named, those its behaviour gives: each field every
// Hit holds is missing where it is named and held where it is not
export const checkIsKitHitShortOf = <K extends RequiredKeysOf<KitHit>>(
  fields: Partial<KitHit>,
  shortFields: readonly K[],
): fields is Except<KitHit, K> => {
  const { hitArea, hitmarkSeconds, poiseDamage, talentMultiplier } = fields;
  const requiredFieldValueMap: Record<RequiredKeysOf<KitHit>, unknown> = {
    hitArea,
    hitmarkSeconds,
    poiseDamage,
    talentMultiplier,
  };
  const shortFieldSet = new Set<string>(shortFields);
  return Object.entries(requiredFieldValueMap).every(
    ([field, value]) => (value === undefined) === shortFieldSet.has(field),
  );
};
