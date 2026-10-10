import { UNITY_EULER_ORDER } from "#src/services/genshinAssets/shared/constants";
import { Euler, MathUtils, Quaternion } from "three";

// A placement's Euler turn in degrees, as the game's own order turns it, as a quaternion
export const toWorldQuaternion = ([x, y, z]: readonly [number, number, number]): [number, number, number, number] =>
  new Quaternion()
    .setFromEuler(new Euler(MathUtils.degToRad(x), MathUtils.degToRad(y), MathUtils.degToRad(z), UNITY_EULER_ORDER))
    .toArray();
