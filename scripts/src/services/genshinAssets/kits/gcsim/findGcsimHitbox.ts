import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";

// The hitbox of an ability the config names by the first of the names it has a hitbox for
export const findGcsimHitbox = (
  { abilityHitboxesMap }: GcsimConfig,
  abilityName: string,
  ...names: string[]
): GcsimHitbox | undefined => {
  const hitboxes = abilityHitboxesMap.get(abilityName) ?? [];
  for (const name of names) {
    const hitbox = hitboxes.find((candidate) => candidate.name === name);
    if (hitbox !== undefined) return hitbox;
  }
  return undefined;
};
