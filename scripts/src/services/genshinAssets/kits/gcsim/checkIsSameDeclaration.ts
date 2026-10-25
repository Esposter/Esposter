import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";

// The declaration an attack is made from, by its literal's file, variable and line: a `Mult` set's copy shares its
// Literal's declaration, where a DoT is a literal of its own under the same variable
export const checkIsSameDeclaration = (attack: GcsimAttack, other: GcsimAttack): boolean =>
  attack.file === other.file && attack.siteLine === other.siteLine && attack.variableName === other.variableName;
