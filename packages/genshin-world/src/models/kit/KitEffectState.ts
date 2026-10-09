import type { KitEffect } from "#src/models/kit/KitEffect";

// The effects on the deployed team, held on one owner so each write reassigns the list rather than changing it in place,
// Which every holder of the list would see. Reads take the list itself
export interface KitEffectState {
  effects: KitEffect[];
}
