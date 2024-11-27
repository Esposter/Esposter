import type { Position } from "grid-engine";

export const getAttackPosition = (isToEnemy: boolean): Position =>
  isToEnemy ? { x: 745, y: 140 } : { x: 256, y: 344 };
