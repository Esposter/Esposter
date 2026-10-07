import type { ToneMapping } from "three";

import { NoToneMapping } from "three";

// The game's tone curve, which the post pipeline ends every frame on: each channel 1 - 2^(-exposure x), lifted a
// Ten-thousandth and raised to its contrast and a hundredth, at most 1, as the uber pass's program draws it behind
// _MHYBloomTonemapping (the login's Display.reference.ts). Its contrast is the post profile's 0.5, the one value of
// Its fields the recordings' shading measures near (`genshin:parity passes`' display), and its exposure the
// Profile's 1 beside it, which only scales the scene and so is carried by whatever light is solved under it. The
// Pipeline draws the curve itself, so the renderer maps nothing: a TresJS canvas sets its own tone mapping (ACES
// Filmic unless told) over the renderer's, so every canvas passes none
export const GENSHIN_TONE_MAPPING: ToneMapping = NoToneMapping;
export const GENSHIN_TONE_CONTRAST = 0.5;
export const GENSHIN_TONE_EXPOSURE = 1;
// The program's own constants: what it adds to the contrast and what it lifts each channel by before raising it
export const TONE_CONTRAST_OFFSET = 0.01;
export const TONE_CURVE_LIFT = 1e-4;
// The darkest scene colour the curve shows, black, a ten-thousandth or so under none: the lift lets a channel the
// Program's _WhiteBalanceMat takes a hair under none still show, darker than the curve's black at none, as a quarter of
// The night's pixels do in their red. Under it the program raises a negative and shows nothing
export const TONE_CURVE_FLOOR: number = -Math.log2(1 + TONE_CURVE_LIFT) / GENSHIN_TONE_EXPOSURE;
