import type { KitAction } from "#src/models/kit/KitAction";

// A skill that can be pressed again in a row: its follow-up presses, each played by the press after the one before it,
// And the seconds after a press within which the next may come, which a press restarts
export interface KitSkillChain {
  followUps: KitAction[];
  windowSeconds: number;
}
