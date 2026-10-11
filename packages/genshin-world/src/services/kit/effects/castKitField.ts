import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitField } from "#src/services/kit/effects/createKitField";

// A field cast onto the team's effects, made as createKitField makes it, and returned for a kit that reads it again
export const castKitField = (kitEffectState: KitEffectState, ...field: Parameters<typeof createKitField>): KitField => {
  const kitField = createKitField(...field);
  addKitEffect(kitEffectState, kitField);
  return kitField;
};
