import type { KitEffect } from "#src/models/kit/KitEffect";

// The effects on the deployed team, held on one owner so each write reassigns the list rather than changing it in place,
// Which every holder of the list would see. Reads take the list itself. The character the effects last stepped with on
// The field is kept beside them, so a step with another on it is a swap
export interface KitEffectState {
  effects: KitEffect[];
  fieldCharacterId?: number;
}
