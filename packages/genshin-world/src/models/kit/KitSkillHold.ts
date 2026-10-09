import type { KitAction } from "#src/models/kit/KitAction";

// A skill's hold level: the action it plays when released after being held at least its minimum seconds, and the
// Cooldown that level sets, which the skill's own cooldown is replaced by
export interface KitSkillHold {
  action: KitAction;
  cooldownSeconds: number;
  minimumHeldSeconds: number;
}
