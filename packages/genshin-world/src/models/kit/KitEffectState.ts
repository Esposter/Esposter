import type { GroundPoint } from "genshin-engine";

import type { KitEffect } from "#src/models/kit/KitEffect";

// The effects on the deployed team, held on one owner so each write a kit makes reassigns the list rather than changing
// It in place, and a walk over the list runs on the list it started with whatever a call it makes writes. The step alone
// Changes it in place, dropping the effects that ran out once its walks are done. Reads take the list itself. The
// Character the effects last stepped with on the field is kept beside them, so a step with another on it is a swap
export interface KitEffectState {
  effects: KitEffect[];
  fieldCharacterId?: number;
  // The field character's body on the ground at the last step, which the step's movement is measured from
  fieldPosition?: GroundPoint;
}
