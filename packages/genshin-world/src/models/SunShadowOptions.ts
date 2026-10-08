import type { Enemy } from "#src/models/enemy/Enemy";
import type { SunLight } from "genshin-engine";
import type { Object3D } from "three";

export interface SunShadowOptions {
  // The character's body, whose moves redraw the shadow it casts where a character stands on the field
  characterBody?: Object3D;
  enemyMap: Map<string, Enemy>;
  sunLight: SunLight;
}
