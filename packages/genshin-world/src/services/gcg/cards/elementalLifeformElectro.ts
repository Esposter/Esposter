import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

// Elemental Lifeform: Electro, which Electro Slime's Elemental Sedimentation gives it at the battle's start: the character
// Always has Electro applied, and takes no Electro DMG
export const elementalLifeformElectro: GcgCardModule = {
  immuneElement: Element.Electro,
  permanentAura: Element.Electro,
};
