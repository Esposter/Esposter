import type { KitBubble } from "#src/models/kit/KitBubble";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { createKitBody } from "#src/services/kit/createKitBody";
import { burstKitBubble } from "#src/services/kit/effects/burstKitBubble";

// A bubble run on by a step: one that has run out bursts, and a burst bubble's explosion lands on its enemy alone, from
// Where the enemy stands. A bubble still holding its enemy strikes nothing
export const stepKitBubble = (bubble: KitBubble): KitStrike | undefined => {
  if (bubble.secondsRemaining > 0 && !bubble.isBurst) return undefined;
  burstKitBubble(bubble);
  const { enemy } = bubble;
  return {
    body: createKitBody({ x: enemy.position.x, z: enemy.position.z }),
    combatant: bubble.combatant,
    hit: bubble.explosion,
    target: enemy,
  };
};
