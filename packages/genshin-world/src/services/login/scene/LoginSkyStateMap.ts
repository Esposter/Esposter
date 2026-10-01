import type { SkyState } from "genshin-engine";

import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { getLoginScreenDirection } from "#src/services/login/scene/getLoginScreenDirection";
import { Color, Vector3 } from "three";

// Where each sky's sun or moon stands, from where its reference shows it, through the login camera: the dawn's and the
// Dusk's suns just past the frame's left edge on the horizon, where their glow is brightest, and the night's moon
// Behind the lantern tower. The day's sun is behind the camera, off its frame, so its direction is measured from the
// Faces it lights. The light comes from the sun or the moon, and the other stands opposite
const DAWN_SUN_DIRECTION = getLoginScreenDirection([-0.05, 0.35]);
const DAY_SUN_DIRECTION = new Vector3(-0.526, 0.789, -0.316).normalize();
const DUSK_SUN_DIRECTION = getLoginScreenDirection([-0.05, 0.35]);
const NIGHT_MOON_DIRECTION = getLoginScreenDirection([0.27, 0.11]);

// Each time of day's sky and light, its colours read off its reference: the gradient's zenith and horizon, the haze
// Over the cloud sea (the mean of its brightest two samples low in the frame), the clouds,
// And the sun or the moon the light comes from.
// The light's and the sky's strengths are measured over the stone lit physically, as the game's lighting is its
// Scripts' and never exported: each hour's scaled until its parts stand as bright as its references' (genshin:parity
// exposure, the median luminance over the parts' pixels), but the night's, whose few moonlit parts read brightest to
// FLIP at their own strengths
export const LoginSkyStateMap: Record<LoginTimeOfDay, SkyState> = {
  [LoginTimeOfDay.Dawn]: {
    cloudLitColor: new Color(0xf2dfc8),
    cloudShadeColor: new Color(0x8c91a7),
    fogColor: new Color(0xe9d8c7),
    hemisphereGroundColor: new Color(0x8c91a7),
    hemisphereIntensity: 11.46,
    hemisphereSkyColor: new Color(0xf2dfc8),
    horizonColor: new Color(0xf2c9a4),
    lightColor: new Color(0xffd8a8),
    lightDirection: DAWN_SUN_DIRECTION,
    lightIntensity: 13.57,
    moonDirection: DAWN_SUN_DIRECTION.clone().negate(),
    starIntensity: 0,
    sunDirection: DAWN_SUN_DIRECTION,
    zenithColor: new Color(0x42608c),
  },
  [LoginTimeOfDay.Day]: {
    cloudLitColor: new Color(0xffffff),
    cloudShadeColor: new Color(0xb8cbe0),
    fogColor: new Color(0xceddee),
    hemisphereGroundColor: new Color(0x9ec0e8),
    hemisphereIntensity: 9.56,
    hemisphereSkyColor: new Color(0xd4e4ef),
    horizonColor: new Color(0xb0c9e3),
    lightColor: new Color(0xfff4e6),
    lightDirection: DAY_SUN_DIRECTION,
    lightIntensity: 11.04,
    moonDirection: DAY_SUN_DIRECTION.clone().negate(),
    starIntensity: 0,
    sunDirection: DAY_SUN_DIRECTION,
    zenithColor: new Color(0x3b68a0),
  },
  [LoginTimeOfDay.Dusk]: {
    cloudLitColor: new Color(0xfcdbad),
    cloudShadeColor: new Color(0xa9708d),
    fogColor: new Color(0xf0c4aa),
    hemisphereGroundColor: new Color(0xa9708d),
    hemisphereIntensity: 10.62,
    hemisphereSkyColor: new Color(0xfcdbad),
    horizonColor: new Color(0xf2b08a),
    lightColor: new Color(0xffc890),
    lightDirection: DUSK_SUN_DIRECTION,
    lightIntensity: 12.57,
    moonDirection: DUSK_SUN_DIRECTION.clone().negate(),
    starIntensity: 0,
    sunDirection: DUSK_SUN_DIRECTION,
    zenithColor: new Color(0x7e5485),
  },
  [LoginTimeOfDay.Night]: {
    cloudLitColor: new Color(0x56b0f5),
    cloudShadeColor: new Color(0x255abb),
    fogColor: new Color(0x5ab4f8),
    hemisphereGroundColor: new Color(0x2a4aa8),
    hemisphereIntensity: 2.7,
    hemisphereSkyColor: new Color(0x2d6fd0),
    horizonColor: new Color(0x1f51c6),
    lightColor: new Color(0x9cc8ff),
    lightDirection: NIGHT_MOON_DIRECTION,
    lightIntensity: 2.45,
    moonDirection: NIGHT_MOON_DIRECTION,
    starIntensity: 1,
    sunDirection: NIGHT_MOON_DIRECTION.clone().negate(),
    zenithColor: new Color(0x172161),
  },
};
