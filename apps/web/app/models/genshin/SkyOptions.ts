import type { SkyKeyframe, SkyTargets } from "genshin-engine";
import type { Vector2 } from "three";

export interface SkyOptions {
  cloudDriftPerSecond: Vector2;
  skyKeyframes: readonly SkyKeyframe[];
  skyTargets: SkyTargets;
  startMinutes: number;
  tilt: number;
}
