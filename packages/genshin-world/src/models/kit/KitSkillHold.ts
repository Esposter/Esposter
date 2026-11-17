import type { KitAction } from "#src/models/kit/KitAction";
import type { KitVariant } from "#src/models/kit/KitVariant";

// A skill's hold level: the action it plays when released after being held at least its minimum seconds, and the
// Cooldown that level sets, which the skill's own cooldown is replaced by
export interface KitSkillHold {
  action: KitAction;
  cooldownSeconds: number;
  minimumHeldSeconds: number;
  // The action the hold plays instead while its check holds on the step it starts, such as a passive's or a field's
  variant?: KitVariant;
}
