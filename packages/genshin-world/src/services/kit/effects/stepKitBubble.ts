import type { KitBubble } from "#src/models/kit/KitBubble";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { burstKitBubble } from "#src/services/kit/effects/burstKitBubble";

// A bubble run on by a step: one that has run out bursts, and a burst bubble's explosion lands on its enemy alone, from
// Where the enemy stands. A bubble still holding its enemy strikes nothing
export const stepKitBubble = (bubble: KitBubble): KitStrike[] => {
  if (bubble.secondsRemaining > 0 && !bubble.isBurst) return [];
  burstKitBubble(bubble);
  const { enemy } = bubble;
  return [
    {
      body: { facing: 0, height: 0, position: { x: enemy.position.x, z: enemy.position.z } },
      combatant: bubble.combatant,
      hit: bubble.explosion,
      target: enemy,
    },
  ];
};
