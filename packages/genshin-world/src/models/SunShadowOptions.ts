import type { Enemy } from "#src/models/enemy/Enemy";
import type { SunLight } from "genshin-engine";
import type { Object3D } from "three";

export interface SunShadowOptions {
  enemyMap: Map<string, Enemy>;
  // The character's body, whose moves redraw the shadow it casts where a character stands on the field, read each frame
  // Since the body is given only once the character's locomotion has loaded
  getCharacterBody: () => Object3D | undefined;
  sunLight: SunLight;
}
