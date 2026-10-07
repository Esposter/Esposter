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
// Where the dusk's sunlight falls from, apart from where its glow shows: 60 degrees left of the walkway and 15 up, so
// It lights the lantern tower's face toward the frame's left, leaves the door's face and the near towers' dark, and
// Casts the dais's shadow aside rather than over the walkway, as the door recording shows. Its glow just past the
// Frame's edge alone sets no direction a shading reads apart (a grid of its directions fits within a hundredth),
// So the direction is the one of 44, 60 and 80 degrees that scores best on the door recording and the dusk still
const DUSK_LIGHT_DIRECTION = new Vector3(0.837, 0.259, 0.483);

// Each hour's sky is solved as the game's sky shader draws it over the clear sky of every reference at that hour at once
// (genshin:parity sky, its clouds left out by the cloud mask), its colours with its own shape, no halo under none and
// No gradient colour under the tone curve's floor, the night's colour away from the moon standing in red under its
// Black at none, each pixel weighed by how steeply the tone curve shows it: solved in scene colour alone, the curve's
// Inverse took a pixel near white to many times its neighbours' colour, and the day's horizon came out pure blue.
// Solved on its title alone, the day's sky drew its door frame's patch of sky three hundredths worse. The haze
// Over the cloud sea (the mean of its brightest two samples low in the frame) is read off each reference too. The
// Day's and the dusk's cloud colours are solved by their spread against the recordings' (genshin:parity clouds); the
// Dawn's and the night's so solved score their frames worse, so theirs stay read off the references. The stone's light
// Is solved apart, as the game's deferred pass casts it (data/login/stoneLight.json), so the sun light here lends the
// Stone only its direction and its shadow, and the hemisphere lights nothing of the login's. Each hour's haze, its
// Density at the cloud sea's top and how fast it thins with height, is solved over that hour's frames under a light
// Left free in each part's bins (genshin:parity calibrate --haze): the dawn's and the night's are a wall hiding all
// The stone under the cloud sea's billows, a few metres under the walkway, and none above it. The day's and the
// Dusk's, which that measure does not settle, stay as solved with the light: the dusk's rises gently and hides no more
// Than its most opacity, its far towers darker than a haze hiding all of them draws, and the day's thins slowly from a
// Light haze and hides all, its title scoring better and its phone door frame a little worse. The night passes
// Through its own white balance before the tone curve, solved where its stone's light lies flattest over both its
// Frames (genshin:parity balance), which takes the red of its moonlit stone under the curve's black as the game's
// _WhiteBalanceMat does, its stone light solved under it
export const LoginSkyStateMap: Record<LoginTimeOfDay, SkyState> = {
  [LoginTimeOfDay.Dawn]: {
    cloudLitColor: new Color(0xf5efe8),
    cloudShadeColor: new Color(0x8c91a7),
    fogColor: new Color(0xe9d8c7),
    fogDensity: 818,
    fogHeightFalloff: 0.836,
    haloColor: new Color(0xc0b49a),
    hemisphereGroundColor: new Color(0x8c91a7),
    hemisphereIntensity: 8.34,
    hemisphereSkyColor: new Color(0xf2dfc8),
    horizonBackColor: new Color(0x366c96),
    horizonColor: new Color(0x8f8559),
    lightColor: new Color(0xffd8a8),
    lightDirection: DAWN_SUN_DIRECTION,
    lightIntensity: 9.87,
    moonDirection: DAWN_SUN_DIRECTION.clone().negate(),
    shape: { frontBackBlend: 1, haloHeight: 0.617, horizonBand: 0.603, moonSize: 0.174, sunHaloSize: 1 },
    starIntensity: 0,
    sunDirection: DAWN_SUN_DIRECTION,
    sunHaloColor: new Color(0x181873),
    zenithBackColor: new Color(0x18186f),
    zenithColor: new Color(0x3b858e),
  },
  [LoginTimeOfDay.Day]: {
    cloudLitColor: new Color(0xfbfcf4),
    cloudShadeColor: new Color(0xb0dbf5),
    fogColor: new Color(0xcfdbf0),
    fogDensity: 0.2037,
    fogHeightFalloff: 0.1247,
    haloColor: new Color(0xa9cf18),
    hemisphereGroundColor: new Color(0x9ec0e8),
    hemisphereIntensity: 7.27,
    hemisphereSkyColor: new Color(0xd4e4ef),
    horizonBackColor: new Color(0x59a5d7),
    horizonColor: new Color(0x181818),
    lightColor: new Color(0xfff4e6),
    lightDirection: DAY_SUN_DIRECTION,
    lightIntensity: 8.4,
    moonDirection: DAY_SUN_DIRECTION.clone().negate(),
    shape: { frontBackBlend: 1, haloHeight: 0.595, horizonBand: 0.408, moonSize: 0.1, sunHaloSize: 2.428 },
    starIntensity: 0,
    sunDirection: DAY_SUN_DIRECTION,
    sunHaloColor: new Color(0x677918),
    zenithBackColor: new Color(0x29448d),
    zenithColor: new Color(0x181818),
  },
  [LoginTimeOfDay.Dusk]: {
    cloudLitColor: new Color(0xfcfcc4),
    cloudShadeColor: new Color(0xed9ea7),
    fogColor: new Color(0xf0c4aa),
    fogDensity: 0.374,
    fogHeightFalloff: 0.2112,
    fogMaxOpacity: 0.7748,
    haloColor: new Color(0xbf6418),
    hemisphereGroundColor: new Color(0xab6db4),
    hemisphereIntensity: 2.08,
    hemisphereSkyColor: new Color(0xffd8de),
    horizonBackColor: new Color(0x3e3e18),
    horizonColor: new Color(0xcf7118),
    lightColor: new Color(0xffecc7),
    lightDirection: DUSK_LIGHT_DIRECTION,
    lightIntensity: 26.19,
    moonDirection: DUSK_SUN_DIRECTION.clone().negate(),
    shape: { frontBackBlend: 1, haloHeight: 0.221, horizonBand: 0.314, moonSize: 0.1, sunHaloSize: 1 },
    starIntensity: 0,
    sunDirection: DUSK_SUN_DIRECTION,
    sunHaloColor: new Color(0x184a5e),
    zenithBackColor: new Color(0x1b305d),
    zenithColor: new Color(0xb26947),
  },
  [LoginTimeOfDay.Night]: {
    cloudLitColor: new Color(0x56b0f5),
    cloudShadeColor: new Color(0x255abb),
    fogColor: new Color(0x5ab4f8),
    fogDensity: 339400,
    fogHeightFalloff: 1.155,
    fogMaxOpacity: 0.986,
    haloColor: new Color(0x2c4c9a),
    hemisphereGroundColor: new Color(0x2a4aa8),
    hemisphereIntensity: 8.96,
    hemisphereSkyColor: new Color(0x2d6fd0),
    horizonBackColor: new Color(0x1b3784),
    horizonColor: new Color(0x000000),
    lightColor: new Color(0x9cc8ff),
    lightDirection: NIGHT_MOON_DIRECTION,
    lightIntensity: 8.13,
    moonDirection: NIGHT_MOON_DIRECTION,
    moonGlowColor: new Color(0x18234c),
    shape: { frontBackBlend: 1, haloHeight: 0.315, horizonBand: 0.304, moonSize: 1.164, sunHaloSize: 4.599 },
    starIntensity: 1,
    sunDirection: NIGHT_MOON_DIRECTION.clone().negate(),
    sunHaloColor: new Color(0x181818),
    whiteBalance: { temperature: -9.5, tint: 16 },
    zenithBackColor: new Color(0x161d58),
    zenithColor: new Color(0x000000),
  },
};
