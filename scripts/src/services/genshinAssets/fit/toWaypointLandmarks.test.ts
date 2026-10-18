import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SceneTransportPoint } from "#src/models/genshinAssets/world/SceneTransportPoint";
import type { GroundPoint } from "genshin-engine";

import { toWaypointLandmarks } from "#src/services/genshinAssets/fit/toWaypointLandmarks";
import {
  GROUND_LAYER,
  INTERACTIVE_MAP_STATUE_LABEL_ID,
  INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
} from "#src/services/genshinAssets/points/constants";
import { JUMP_LANDMARK_KINDS, LandmarkKind } from "genshin-world";
import { describe, expect, test } from "vitest";

const ORIGIN = [100, 20, 200] as const;
const IDENTITY_TRANSFORM = { mirrored: false, offset: { x: 0, z: 0 }, scale: 1, turn: 0 };
const AREA_OUTLINE: GroundPoint[] = [
  { x: -100, z: -300 },
  { x: 200, z: -300 },
  { x: 200, z: 100 },
  { x: -100, z: 100 },
];
const createMapPoint = (overrides: Partial<InteractiveMapPoint>): InteractiveMapPoint => ({
  area_id: 1,
  id: 11,
  label_id: INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
  x_pos: 150,
  y_pos: 300,
  z_level: GROUND_LAYER,
  ...overrides,
});
const TRANSPORT_POINT: SceneTransportPoint = { height: 30, id: "7", position: { x: 150, z: 300 }, turnDegrees: 90 };
const landmarksAt = (mapPoints: InteractiveMapPoint[]) =>
  toWaypointLandmarks({
    areas: [],
    getWorldHeight: () => 5,
    mapPoints,
    origin: ORIGIN,
    region: "mondstadt",
    transform: IDENTITY_TRANSFORM,
    transportPoints: [TRANSPORT_POINT],
  });

describe(toWaypointLandmarks, () => {
  test("a waypoint is listed as a jump target", () => {
    expect.hasAssertions();

    expect({
      jumpTarget: JUMP_LANDMARK_KINDS.includes(LandmarkKind.TeleportWaypoint),
      landmarks: toWaypointLandmarks({
        areas: [{ id: "starfell-valley", outline: AREA_OUTLINE }],
        getWorldHeight: () => 5,
        mapPoints: [createMapPoint({})],
        origin: ORIGIN,
        region: "mondstadt",
        transform: IDENTITY_TRANSFORM,
        transportPoints: [TRANSPORT_POINT],
      }),
    }).toStrictEqual({
      jumpTarget: true,
      landmarks: [
        {
          areaId: "starfell-valley",
          arrival: { heightOffset: 5, position: { x: 50, z: -100 }, rotation: -1.5708 },
          heightOffset: 5,
          id: "mondstadt-waypoint-7",
          kind: LandmarkKind.TeleportWaypoint,
          position: { x: 50, z: -100 },
          rotation: -1.5708,
        },
      ],
    });
  });

  test("a transport point with no paired map waypoint is not a waypoint", () => {
    expect.hasAssertions();

    expect({
      statueLabel: landmarksAt([createMapPoint({ label_id: INTERACTIVE_MAP_STATUE_LABEL_ID })]),
      beyondBar: landmarksAt([createMapPoint({ x_pos: 175 })]),
    }).toStrictEqual({ beyondBar: [], statueLabel: [] });
  });
});
