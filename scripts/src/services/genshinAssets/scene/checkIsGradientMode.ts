import { GradientMode } from "#src/models/genshinAssets/scene/GradientMode";

export const checkIsGradientMode = (mode: number): mode is GradientMode =>
  mode === GradientMode.Blend || mode === GradientMode.Fixed;
