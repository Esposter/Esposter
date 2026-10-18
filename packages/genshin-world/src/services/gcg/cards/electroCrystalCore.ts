import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

export const ELECTRO_CRYSTAL_CORE_ID = 124_014;
const ELECTRO_CRYSTAL_CORE_HP = 1;

// Electro Crystal Core, Electro Hypostasis' state: once, when the character would be defeated, it is spent and the character
// Is restored to 1 HP. A spent state is pruned from the field
export const electroCrystalCore: GcgCardModule = {
  initialUsages: 1,
  replaceDefeat: (_context, zoneCard) => {
    if (zoneCard.usages <= 0) return undefined;
    zoneCard.usages = 0;
    return ELECTRO_CRYSTAL_CORE_HP;
  },
};
