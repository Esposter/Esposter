import type { Vector } from "#src/models/shared/Vector";

export const ORIGIN: Vector = [0, 0, 0];

// The octaves and seed the residual is drawn with, fixed so one residual always fits to the same noise
export const RESIDUAL_OCTAVES = 3;
export const RESIDUAL_SEED = 1;

// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const NUMBER_REGEX: RegExp = /-?\d+(?:\.\d+)?/gu;
