import { createGcgSacrificialWeapon } from "#src/services/gcg/effects/createGcgSacrificialWeapon";

// Sacrificial Greatsword: the equipped Claymore character deals +1 DMG, and after it uses an Elemental Skill a die of its
// Element is created, once per round
export const sacrificialGreatsword = createGcgSacrificialWeapon(311_302, "CLAYMORE");
