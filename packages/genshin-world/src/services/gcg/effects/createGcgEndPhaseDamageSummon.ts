import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

// A summon that deals its damage at End Phase and is spent after its usages, with an effect of its own run beside the damage
export const createGcgEndPhaseDamageSummon = ({
  damage,
  damageType,
  onEndPhase,
  usages,
}: {
  damage: number;
  damageType: Element;
  onEndPhase?: (context: GcgEffectContext) => void;
  usages: number;
}): GcgCardModule => ({
  initialUsages: usages,
  onEndPhase: (context, zoneCard) => {
    zoneCard.usages -= 1;
    onEndPhase?.(context);
    return { damageType, value: damage };
  },
});
