import type { KitEffect } from "#src/models/kit/KitEffect";

// The effects on the deployed team, held on one owner so each write a kit makes reassigns the list rather than changing
// It in place, and a walk over the list runs on the list it started with whatever a call it makes writes. The step
// Alone changes it in place while it walks, and drops the effects that ran out by reassigning it once its walks are
// Done. Reads take the list itself. The Character the effects last stepped with on the field is kept beside them, so a
// Step with another on it is a swap
export interface KitEffectState {
  effects: KitEffect[];
  fieldCharacterId?: number;
}
