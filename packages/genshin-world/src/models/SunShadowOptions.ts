import type { Enemy } from "#src/models/enemy/Enemy";
import type { Locomotion, SunLight } from "genshin-engine";
import type { Object3D } from "three";

export interface SunShadowOptions {
  enemyMap: Map<string, Enemy>;
  // The character's body, whose moves redraw the shadow it casts where a character stands on the field, read each frame
  // Since the body is given only once the character's locomotion has loaded
  getCharacterBody: () => Object3D | undefined;
  // How the character on the body moves, whose body's height lifts the cascades' anchor to the camera's pivot
  getCharacterLocomotion: () => Locomotion | undefined;
  sunLight: SunLight;
}
