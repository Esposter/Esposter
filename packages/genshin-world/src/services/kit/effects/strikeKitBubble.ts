import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBubble } from "#src/models/kit/KitBubble";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { burstKitBubble } from "#src/services/kit/effects/burstKitBubble";

// A hit's bubbles on the enemy it struck, once its damage is dealt: a hit with poise damage bursts the bubble holding the
// Enemy, and a hit that casts a bubble holds the enemy in one after that, so a cast does not burst its own bubble
export const strikeKitBubble = (
  kitEffectState: KitEffectState,
  enemy: Enemy,
  combatant: Combatant,
  kitHit: KitHit,
): void => {
  if (kitHit.poiseDamage > 0) {
    const bubble = kitEffectState.effects.find(
      (effect): effect is KitBubble => effect.kind === "bubble" && effect.enemy === enemy && !effect.isBurst,
    );
    if (bubble) burstKitBubble(bubble);
  }
  if (kitHit.bubble)
    addKitEffect(kitEffectState, {
      combatant,
      enemy,
      explosion: kitHit.bubble.explosion,
      kind: "bubble",
      omen: { ...kitHit.bubble.omen },
      secondsRemaining: kitHit.bubble.secondsRemaining,
    });
};
