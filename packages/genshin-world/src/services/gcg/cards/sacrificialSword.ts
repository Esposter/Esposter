import { createGcgSacrificialWeapon } from "#src/services/gcg/effects/createGcgSacrificialWeapon";

// Sacrificial Sword: the equipped Sword character deals +1 DMG, and after it uses an Elemental Skill a die of its Element is
// Created, once per round
export const sacrificialSword = createGcgSacrificialWeapon(311_502, "SWORD");
