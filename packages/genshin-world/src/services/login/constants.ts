import type { LoginTower } from "#src/models/login/LoginTower";
import type { GradeOptions, RampOptions, SkyState } from "genshin-engine";

import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { LoginTowerKind } from "#src/models/login/LoginTowerKind";
import { Color, Vector3 } from "three";

// The camera, matched to the four time-of-day references, which share one pose: the walkway's edges meet 0.524 across
// And 0.546 down the frame, so it looks a touch right and up of the walkway's line, from eye height over its surface
export const LOGIN_CAMERA_FOV = 45;
export const LOGIN_CAMERA_POSITION: [number, number, number] = [0, 3.3, 0];
export const LOGIN_CAMERA_TARGET: [number, number, number] = [3.53, 7.11, -99.87];
// Where every tower's shaft ends, out of sight under the cloud sea
export const LOGIN_TOWER_FLOOR = -60;
// The cloud sea's top, below the walkway, and how far it reaches
export const LOGIN_CLOUD_SEA_HEIGHT = -9;
export const LOGIN_CLOUD_SEA_SIZE = 2400;
// The walkway, from the camera's feet to the step it ends at, and the wings either side of it, in metres
export const LOGIN_WALKWAY_WIDTH = 5.4;
export const LOGIN_WALKWAY_LENGTH = 34;
export const LOGIN_WALKWAY_DEPTH = 1.6;
export const LOGIN_WALKWAY_START = 6;
export const LOGIN_WING_WIDTH = 10;
export const LOGIN_WING_LENGTH = 7;
export const LOGIN_WING_CENTRE = -17;
export const LOGIN_STEP_WIDTH = 7.2;
export const LOGIN_STEP_HEIGHT = 1.16;
export const LOGIN_STEP_LENGTH = 4;
export const LOGIN_STONE_COLOR = 0xf3e9e0;
export const LOGIN_GOLD_COLOR = 0xd6b25e;
export const LOGIN_RIM_STRENGTH = 0.4;
export const LOGIN_RAMP_OPTIONS: RampOptions = { resolution: 64, softness: 0.1, terminator: 0.5 };
export const LOGIN_GRADE_OPTIONS: GradeOptions = {
  contrast: 1,
  highlightTint: [0, 0, 0],
  saturation: 1.05,
  shadowTint: [0, 0, 0.02],
  size: 32,
};
// The haze the cloud sea gives off, thick enough that the far towers pale into the horizon's colour
export const LOGIN_FOG_DENSITY = 0.006;
export const LOGIN_FOG_HEIGHT_FALLOFF = 0.03;
export const LOGIN_FOG_START_DISTANCE = 20;
export const LOGIN_LIGHT_DISTANCE = 120;
export const LOGIN_CLOUD_COVERAGE = 0.4;
// Each tower's shaft diameter, its axis and its top, placed where its box stands in the references: the depth of each is
// Chosen so its shaft is a believable width for its kind, and the flight past them is what tunes it
export const LOGIN_TOWERS: LoginTower[] = [
  { diameter: 6.48, kind: LoginTowerKind.Crowned, position: [-11.4, -39.8], top: 21.3 },
  { diameter: 6.31, kind: LoginTowerKind.Ringed, position: [-12.4, -74.8], top: 23.4 },
  { diameter: 7.5, kind: LoginTowerKind.Ringed, position: [15.4, -94], top: 18.8 },
  { diameter: 7.51, kind: LoginTowerKind.Ringed, position: [15.1, -40.7], top: 24 },
  { diameter: 4.6, kind: LoginTowerKind.Ringed, position: [41.3, -77.9], top: 22.6 },
  { diameter: 6.1, kind: LoginTowerKind.Crowned, position: [43.2, -58], top: 16.9 },
  { diameter: 6.97, kind: LoginTowerKind.Ringed, position: [64.7, -107], top: 24.8 },
  { diameter: 1.04, kind: LoginTowerKind.Slender, position: [-17.8, -45.4], top: 11.1 },
  { diameter: 6.36, kind: LoginTowerKind.Ringed, position: [-53.9, -121.2], top: 24.8 },
  { diameter: 5.83, kind: LoginTowerKind.Crowned, position: [-57.6, -111.9], top: 11.6 },
  { diameter: 3.45, kind: LoginTowerKind.Slender, position: [-77.1, -132.5], top: 14.7 },
  { diameter: 5.01, kind: LoginTowerKind.Ringed, position: [-19, -170.5], top: 12.6 },
  { diameter: 5.3, kind: LoginTowerKind.Ringed, position: [-9.1, -200.5], top: 5.9 },
  { diameter: 4.51, kind: LoginTowerKind.Ringed, position: [16, -169.4], top: 11.2 },
  { diameter: 5.01, kind: LoginTowerKind.Ringed, position: [31, -168.8], top: 11.2 },
  { diameter: 4.42, kind: LoginTowerKind.Ringed, position: [40.6, -148.4], top: 12.7 },
];
// Each time of day's sky and light, its colours read off its reference: the gradient's zenith and horizon, the clouds,
// And where the light comes from, which is from the left in all four (low at dawn and dusk, and the moon's at night)
export const LoginSkyStateMap: Record<LoginTimeOfDay, SkyState> = {
  [LoginTimeOfDay.Dawn]: {
    cloudLitColor: new Color(0xf2dfc8),
    cloudShadeColor: new Color(0x8c91a7),
    hemisphereGroundColor: new Color(0xf2dfc8),
    hemisphereIntensity: 1.1,
    hemisphereSkyColor: new Color(0x8c91a7),
    horizonColor: new Color(0xf2c9a4),
    lightColor: new Color(0xffd8a8),
    lightDirection: new Vector3(-0.951, 0.08, -0.3).normalize(),
    lightIntensity: 1.3,
    moonDirection: new Vector3(0.951, -0.08, 0.3).normalize(),
    starIntensity: 0,
    sunDirection: new Vector3(-0.951, 0.08, -0.3).normalize(),
    zenithColor: new Color(0x42608c),
  },
  [LoginTimeOfDay.Day]: {
    cloudLitColor: new Color(0xffffff),
    cloudShadeColor: new Color(0xb8cbe0),
    hemisphereGroundColor: new Color(0xd4e4ef),
    hemisphereIntensity: 1.3,
    hemisphereSkyColor: new Color(0x9ec0e8),
    horizonColor: new Color(0xb0c9e3),
    lightColor: new Color(0xfff4e6),
    lightDirection: new Vector3(-0.526, 0.789, -0.316).normalize(),
    lightIntensity: 1.5,
    moonDirection: new Vector3(0.526, -0.789, 0.316).normalize(),
    starIntensity: 0,
    sunDirection: new Vector3(-0.526, 0.789, -0.316).normalize(),
    zenithColor: new Color(0x3b68a0),
  },
  [LoginTimeOfDay.Dusk]: {
    cloudLitColor: new Color(0xfcdbad),
    cloudShadeColor: new Color(0xa9708d),
    hemisphereGroundColor: new Color(0xfcdbad),
    hemisphereIntensity: 1.1,
    hemisphereSkyColor: new Color(0xa9708d),
    horizonColor: new Color(0xf2b08a),
    lightColor: new Color(0xffc890),
    lightDirection: new Vector3(-0.902, 0.251, -0.351).normalize(),
    lightIntensity: 1.3,
    moonDirection: new Vector3(0.902, -0.251, 0.351).normalize(),
    starIntensity: 0,
    sunDirection: new Vector3(-0.902, 0.251, -0.351).normalize(),
    zenithColor: new Color(0x7e5485),
  },
  [LoginTimeOfDay.Night]: {
    cloudLitColor: new Color(0x56b0f5),
    cloudShadeColor: new Color(0x255abb),
    hemisphereGroundColor: new Color(0x2d6fd0),
    hemisphereIntensity: 1,
    hemisphereSkyColor: new Color(0x2a4aa8),
    horizonColor: new Color(0x1f51c6),
    lightColor: new Color(0x9cc8ff),
    lightDirection: new Vector3(-0.551, 0.451, -0.702).normalize(),
    lightIntensity: 0.9,
    moonDirection: new Vector3(-0.551, 0.451, -0.702).normalize(),
    starIntensity: 1,
    sunDirection: new Vector3(0.551, -0.451, 0.702).normalize(),
    zenithColor: new Color(0x172161),
  },
};
