import { createGcgSacrificialWeapon } from "#src/services/gcg/effects/createGcgSacrificialWeapon";

// Sacrificial Bow: the equipped Bow character deals +1 DMG, and after it uses an Elemental Skill a die of its Element is
// Created, once per round
export const sacrificialBow = createGcgSacrificialWeapon(311_202, "BOW");
