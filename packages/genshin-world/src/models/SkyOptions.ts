import type { SkyKeyframe, SkyTargets, WindUniforms } from "genshin-engine";

export interface SkyOptions {
  // Whether the clock stands still this frame, as a tool holding the witness's clock asks, so one view draws one frame
  checkIsHeld?: () => boolean;
  skyKeyframes: readonly SkyKeyframe[];
  skyTargets: SkyTargets;
  startMinutes: number;
  tilt: number;
  windUniforms: WindUniforms;
}
