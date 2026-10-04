import type { SkyState } from "genshin-engine";

import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { LOGIN_DAY_FOG_DENSITY } from "#src/services/login/scene/constants";
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

// Each hour's sky is solved as the game's sky shader draws it over its frame's clear sky (genshin:parity sky, its clouds
// Left out by the cloud mask), its colours with its own shape, no colour under none: the dawn's deep blue away from the
// Sun and grey toward it, the dusk's lavender away and rose toward it, the night's with the glow round its moon. The
// Dusk's bottom colour toward the sun stands under the recording's clouds, so no pixel holds it. The haze over the
// Cloud sea (the mean of its brightest two samples low in the frame) and the clouds are read off each reference too.
// The stone's light is solved apart, as the game's deferred pass casts it (data/login/stoneLight.json), so the sun light
// Here lends the stone only its direction and its shadow, and the hemisphere lights nothing of the login's
export const LoginSkyStateMap: Record<LoginTimeOfDay, SkyState> = {
  [LoginTimeOfDay.Dawn]: {
    cloudLitColor: new Color(0xf5efe8),
    cloudShadeColor: new Color(0x8c91a7),
    fogColor: new Color(0xe9d8c7),
    haloColor: new Color(0xc9a575),
    hemisphereGroundColor: new Color(0x8c91a7),
    hemisphereIntensity: 8.34,
    hemisphereSkyColor: new Color(0xf2dfc8),
    horizonBackColor: new Color(0xa99f9f),
    horizonColor: new Color(0x867771),
    lightColor: new Color(0xffd8a8),
    lightDirection: DAWN_SUN_DIRECTION,
    lightIntensity: 9.87,
    moonDirection: DAWN_SUN_DIRECTION.clone().negate(),
    shape: { frontBackBlend: 1, haloHeight: 0.391, horizonBand: 0.344, moonSize: 1.189, sunHaloSize: 2.444 },
    starIntensity: 0,
    sunDirection: DAWN_SUN_DIRECTION,
    sunHaloColor: new Color(0x00173d),
    zenithBackColor: new Color(0x185089),
    zenithColor: new Color(0x888b86),
  },
  [LoginTimeOfDay.Day]: {
    cloudLitColor: new Color(0xffffff),
    cloudShadeColor: new Color(0xb8cbe0),
    fogColor: new Color(0xcfdbf0),
    fogDensity: LOGIN_DAY_FOG_DENSITY,
    haloColor: new Color(0xe0c18b),
    hemisphereGroundColor: new Color(0x9ec0e8),
    hemisphereIntensity: 7.27,
    hemisphereSkyColor: new Color(0xd4e4ef),
    horizonBackColor: new Color(0x78b9e7),
    horizonColor: new Color(0x000000),
    lightColor: new Color(0xfff4e6),
    lightDirection: DAY_SUN_DIRECTION,
    lightIntensity: 8.4,
    moonDirection: DAY_SUN_DIRECTION.clone().negate(),
    shape: { frontBackBlend: 0.835, haloHeight: 0.574, horizonBand: 0.422, moonSize: 0.444, sunHaloSize: 1.241 },
    starIntensity: 0,
    sunDirection: DAY_SUN_DIRECTION,
    sunHaloColor: new Color(0x000000),
    zenithBackColor: new Color(0x1d418c),
    zenithColor: new Color(0xd9f3b1),
  },
  [LoginTimeOfDay.Dusk]: {
    cloudLitColor: new Color(0xfdedc4),
    cloudShadeColor: new Color(0xeb8596),
    fogColor: new Color(0xf0c4aa),
    haloColor: new Color(0xeaf2ca),
    hemisphereGroundColor: new Color(0xab6db4),
    hemisphereIntensity: 2.08,
    hemisphereSkyColor: new Color(0xffd8de),
    horizonBackColor: new Color(0xba766f),
    horizonColor: new Color(0xa10000),
    lightColor: new Color(0xffecc7),
    lightDirection: DUSK_LIGHT_DIRECTION,
    lightIntensity: 26.19,
    moonDirection: DUSK_SUN_DIRECTION.clone().negate(),
    shape: { frontBackBlend: 1, haloHeight: 0.406, horizonBand: 0.273, moonSize: 0.969, sunHaloSize: 5.241 },
    starIntensity: 0,
    sunDirection: DUSK_SUN_DIRECTION,
    sunHaloColor: new Color(0x000000),
    zenithBackColor: new Color(0x78597f),
    zenithColor: new Color(0xc57a78),
  },
  [LoginTimeOfDay.Night]: {
    cloudLitColor: new Color(0x56b0f5),
    cloudShadeColor: new Color(0x255abb),
    fogColor: new Color(0x5ab4f8),
    haloColor: new Color(0x5d92f9),
    hemisphereGroundColor: new Color(0x2a4aa8),
    hemisphereIntensity: 8.96,
    hemisphereSkyColor: new Color(0x2d6fd0),
    horizonBackColor: new Color(0x192975),
    horizonColor: new Color(0x000000),
    lightColor: new Color(0x9cc8ff),
    lightDirection: NIGHT_MOON_DIRECTION,
    lightIntensity: 8.13,
    moonDirection: NIGHT_MOON_DIRECTION,
    moonGlowColor: new Color(0x053a90),
    shape: { frontBackBlend: 0.846, haloHeight: 0.504, horizonBand: 0.519, moonSize: 0.398, sunHaloSize: 4.066 },
    starIntensity: 1,
    sunDirection: NIGHT_MOON_DIRECTION.clone().negate(),
    sunHaloColor: new Color(0x000000),
    zenithBackColor: new Color(0x161e57),
    zenithColor: new Color(0x000000),
  },
};
