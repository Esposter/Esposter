import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

// Scorpion Blessing: the stacks a Technique of Spirit of Omen: Pyro Scorpion spends, each adding 1 DMG to it
export const scorpionBlessing: GcgCardModule = { checkIsSpent: (_side, zoneCard) => zoneCard.counter <= 0 };
