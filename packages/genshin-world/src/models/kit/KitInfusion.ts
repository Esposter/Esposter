import type { Element } from "#src/models/Element";
import type { KitSwapEndable } from "#src/models/kit/KitSwapEndable";

// An infusion a character's normal attacks, charged attack and plunges deal the element of, for the seconds left of it
export interface KitInfusion extends KitSwapEndable {
  characterId: number;
  // The factor the cooldown of a skill or a burst its character casts is multiplied by while it holds, if it lowers them
  cooldownMultiplier?: number;
  // The DMG Bonus each hit it infuses carries, if it raises them
  damageBonus?: number;
  element: Element;
  // Whether the infusion converts the attacks it infuses, so each hit with a converted poise or reach deals that instead
  isConverted?: true;
  kind: "infusion";
  // The share the infusion raises its character's Normal ATK SPD by, if it raises it, which plays each normal attack's
  // Seconds and hitmarks that much faster
  normalAttackSpeedBonus?: number;
  secondsRemaining: number;
}
