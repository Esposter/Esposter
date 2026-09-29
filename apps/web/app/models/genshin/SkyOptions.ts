import type { SkyKeyframe, SkyTargets, WindUniforms } from "genshin-engine";

export interface SkyOptions {
  skyKeyframes: readonly SkyKeyframe[];
  skyTargets: SkyTargets;
  startMinutes: number;
  tilt: number;
  windUniforms: WindUniforms;
}
