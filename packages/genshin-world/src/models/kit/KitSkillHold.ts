import type { KitAction } from "#src/models/kit/KitAction";

// A skill's hold level: the action it plays when released after being held at least its minimum seconds, and the
// Cooldown that level sets, which the skill's own cooldown is replaced by
import type { KitStepContext } from "#src/models/kit/KitStepContext";

export interface KitSkillHold {
  action: KitAction;
  cooldownSeconds: number;
  minimumHeldSeconds: number;
  // The action the hold plays instead while its check holds on the step it starts, such as a passive's or a field's
  variant?: { action: KitAction; checkIsActive: (context: KitStepContext) => boolean };
}
