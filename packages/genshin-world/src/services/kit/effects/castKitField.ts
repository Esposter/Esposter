import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitField } from "#src/services/kit/effects/createKitField";

export const castKitField = (kitEffectState: KitEffectState, ...field: Parameters<typeof createKitField>): void =>
  addKitEffect(kitEffectState, createKitField(...field));
