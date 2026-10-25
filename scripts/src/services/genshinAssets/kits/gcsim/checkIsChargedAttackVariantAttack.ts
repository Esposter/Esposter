import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";

// Whether an attack is a charged attack's variant's, the `swift` talent variable's: its queue calls are joined to the
// Variant, so the charged attack takes none of them
export const checkIsChargedAttackVariantAttack = ({ talentVariable }: GcsimAttack): boolean =>
  talentVariable === "swift";
