import type { StatueLevel } from "#src/models/statue/StatueLevel";
import { describe } from "vitest";

// The Oculus the statue suites offer and touch, by its item id
export const OCULUS_ITEM_ID = 1;
// A region's two levels: level one takes no Oculi, and level two takes the one Oculus
export const LEVELS: StatueLevel[] = [
  { items: [], level: 1, rewards: [{ itemCount: 1, itemId: 2 }], staminaShare: 0 },
  {
    items: [{ itemCount: 1, itemId: OCULUS_ITEM_ID }],
    level: 2,
    rewards: [{ itemCount: 1, itemId: 2 }],
    staminaShare: 0,
  },
];

describe.todo("constants");
