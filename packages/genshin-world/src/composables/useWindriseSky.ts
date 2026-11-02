import type { Enemy } from "#src/models/enemy/Enemy";
import type {
  FogUniforms,
  GameClock,
  LightUniforms,
  Locomotion,
  PostUniforms,
  SkyUniforms,
  SunLight,
  WindUniforms,
} from "genshin-engine";
import type { HemisphereLight, Object3D } from "three";

import { useSky } from "#src/composables/useSky";
import { useSunShadow } from "#src/composables/useSunShadow";
import {
  SUN_DISTANCE,
  SUN_TILT,
  WINDRISE_SKY_KEYFRAMES,
  WINDRISE_START_MINUTES,
} from "#src/services/windrise/constants";

interface WindriseSkyOptions {
  // Whether the clock stands still this frame, as a screen holding it or the witness's clock asks
  checkIsHeld: () => boolean;
  // The enemies in the world, whose moves redraw the sun's shadow
  enemyMap: Map<string, Enemy>;
  fogUniforms: FogUniforms;
  // The character's body, whose moves redraw the shadow it casts where a character stands on the field
  getCharacterBody: () => Object3D | undefined;
  // How the character on the field moves, whose body's height lifts the cascades' anchor to the camera's pivot
  getCharacterLocomotion: () => Locomotion | undefined;
  // The game's minute of the day the clock is held at, in place of its running from the region's start
  getHeldMinutes: () => number | undefined;
  hemisphere: HemisphereLight;
  lightUniforms: LightUniforms;
  postUniforms: PostUniforms;
  skyUniforms: SkyUniforms;
  sunLight: SunLight;
  windUniforms: WindUniforms;
}

// Windrise's sky and the game's clock running under it, which the sun's shadow follows: the clock starts at its held minute
// Or the region's start, and a minute held anew is set on it. The clock is handed back for the tuning panel and the clock
// Control to set
export const useWindriseSky = ({
  checkIsHeld,
  enemyMap,
  fogUniforms,
  getCharacterBody,
  getCharacterLocomotion,
  getHeldMinutes,
  hemisphere,
  lightUniforms,
  postUniforms,
  skyUniforms,
  sunLight,
  windUniforms,
}: WindriseSkyOptions): GameClock => {
  const gameClock = useSky({
    checkIsHeld,
    skyKeyframes: WINDRISE_SKY_KEYFRAMES,
    skyTargets: {
      fogUniforms,
      hemisphere,
      light: sunLight.light,
      lightDistance: SUN_DISTANCE,
      lightUniforms,
      postUniforms,
      skyUniforms,
    },
    startMinutes: getHeldMinutes() ?? WINDRISE_START_MINUTES,
    tilt: SUN_TILT,
    windUniforms,
  });
  // The sun's shadows are drawn again only when the sun, the view or a caster has moved, after the sky has turned the sun
  useSunShadow({ enemyMap, getCharacterBody, getCharacterLocomotion, sunLight });
  // The clock only starts at its held minute, so a minute held anew is set on it
  watch(getHeldMinutes, (minutes) => {
    if (minutes !== undefined) gameClock.minutes = minutes;
  });
  return gameClock;
};
