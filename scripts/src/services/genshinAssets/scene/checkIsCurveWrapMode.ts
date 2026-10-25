import { CurveWrapMode } from "#src/models/genshinAssets/scene/CurveWrapMode";

export const checkIsCurveWrapMode = (mode: number): mode is CurveWrapMode =>
  mode === CurveWrapMode.Clamp || mode === CurveWrapMode.PingPong || mode === CurveWrapMode.Repeat;
