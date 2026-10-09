import type { KitBubble } from "#src/models/kit/KitBubble";

import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";

// Bursts a bubble once: its Omen goes on its enemy from the burst, and its seconds are zeroed so the step after it drops
// It once its explosion has landed
export const burstKitBubble = (bubble: KitBubble): void => {
  if (bubble.isBurst) return;
  bubble.isBurst = true;
  bubble.secondsRemaining = 0;
  addEnemyStatus(bubble.enemy, { ...bubble.omen });
};
