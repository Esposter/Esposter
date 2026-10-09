import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

// Illusory Bubble: when the side's skill deals DMG, the bubble is removed and that DMG doubled, after every additive bonus
export const illusoryBubble: GcgCardModule = {
  initialUsages: 1,
  multiplyDamageDealt: (_context, damage, zoneCard) => {
    zoneCard.usages = 0;
    return { ...damage, value: damage.value * 2 };
  },
};
