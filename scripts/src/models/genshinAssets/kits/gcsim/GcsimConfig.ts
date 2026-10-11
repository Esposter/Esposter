import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimTalentVariable } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentVariable";

// What the builder reads of a gcsim character's `config.yml`: each ability's hitboxes by the ability's name, the names
// The character is known by, its own and its shortcuts, and the talent variables in the order the config declares them
export interface GcsimConfig {
  abilityHitboxesMap: Map<string, GcsimHitbox[]>;
  names: string[];
  talentVariables: GcsimTalentVariable[];
}
