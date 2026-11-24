/* oxlint-disable typescript/no-inferrable-types -- isolatedDeclarations demands the annotation this regex would
   otherwise infer */
import { KitPlunge } from "genshin-world/definitions";

export const FLOW_START_REGEX: RegExp = /^[[{]/u;

// The constructor of a hit gcsim gives its target alone, `combat.NewSingleTargetHit(e.Key())`, with no reach beyond it
export const SINGLE_TARGET_HIT_CONSTRUCTOR = "NewSingleTargetHit";
// The most texts a constructor's locals or loop indices may give between them, as each one multiplies the texts before
// It
export const MAX_ALTERNATIVES = 16;
// A bare name or a field of one, `stelePos` or `c.qPos`, which a constructor may name a place by
export const PLACE_REGEX: RegExp = /^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/u;

// The two landings: each one's plunge, its frames and hitmark named by its prefix, and its area's hitbox by name
export const GCSIM_PLUNGE_LANDINGS: readonly (readonly [KitPlunge, string, string])[] = [
  [KitPlunge.Low, "low", "Low_Plunge"],
  [KitPlunge.High, "high", "High_Plunge"],
];
