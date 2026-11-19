import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SceneTransportPoint } from "#src/models/genshinAssets/world/SceneTransportPoint";
import type { GroundPoint } from "genshin-engine";

import { toPairedLandmarks } from "#src/services/genshinAssets/fit/toPairedLandmarks";
import {
  GROUND_LAYER,
  INTERACTIVE_MAP_STATUE_LABEL_ID,
  INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
} from "#src/services/genshinAssets/points/constants";
import { LandmarkKind } from "genshin-world";
import { describe, expect, test } from "vitest";

const createMapPoint = (overrides: Partial<InteractiveMapPoint>): InteractiveMapPoint => ({
  area_id: 1,
  id: 11,
  label_id: INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
  x_pos: 150,
  y_pos: 300,
  z_level: GROUND_LAYER,
  ...overrides,
});

describe(toPairedLandmarks, () => {
  const ORIGIN = [100, 20, 200] as const;
  const IDENTITY_TRANSFORM = { mirrored: false, offset: { x: 0, z: 0 }, scale: 1, turn: 0 };
  const AREA_OUTLINE: GroundPoint[] = [
    { x: -100, z: -300 },
    { x: 200, z: -300 },
    { x: 200, z: 100 },
    { x: -100, z: 100 },
  ];
  const TRANSPORT_POINT: SceneTransportPoint = { height: 30, id: "7", position: { x: 150, z: 300 }, turnDegrees: 90 };
  const WAYPOINT_PAIRING = {
    idWord: "waypoint",
    kind: LandmarkKind.TeleportWaypoint,
    labelId: INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
  } as const;
  const landmarksAt = (mapPoints: InteractiveMapPoint[]) =>
    toPairedLandmarks({
      ...WAYPOINT_PAIRING,
      areas: [],
      getWorldHeight: () => 5,
      mapPoints,
      origin: ORIGIN,
      region: "mondstadt",
      transform: IDENTITY_TRANSFORM,
      transportPoints: [TRANSPORT_POINT],
    });

  test("a waypoint's map point is paired with its transport point, in the area it stands in", () => {
    expect.hasAssertions();

    expect(
      toPairedLandmarks({
        ...WAYPOINT_PAIRING,
        areas: [{ id: "starfell-valley", outline: AREA_OUTLINE }],
        getWorldHeight: () => 5,
        mapPoints: [createMapPoint({})],
        origin: ORIGIN,
        region: "mondstadt",
        transform: IDENTITY_TRANSFORM,
        transportPoints: [TRANSPORT_POINT],
      }),
    ).toStrictEqual([
      {
        areaId: "starfell-valley",
        arrival: { heightOffset: 5, position: { x: 50, z: -100 }, rotation: -1.5708 },
        heightOffset: 5,
        id: "mondstadt-waypoint-7",
        kind: LandmarkKind.TeleportWaypoint,
        position: { x: 50, z: -100 },
        rotation: -1.5708,
      },
    ]);
  });

  test("a Statue of the New Moon is paired from the Statue of The Seven's label", () => {
    expect.hasAssertions();

    expect(
      toPairedLandmarks({
        areas: [{ id: "starfell-valley", outline: AREA_OUTLINE }],
        getWorldHeight: () => 5,
        idWord: "new-moon-statue",
        kind: LandmarkKind.StatueOfTheNewMoon,
        labelId: INTERACTIVE_MAP_STATUE_LABEL_ID,
        mapPoints: [createMapPoint({ label_id: INTERACTIVE_MAP_STATUE_LABEL_ID })],
        origin: ORIGIN,
        region: "mondstadt",
        transform: IDENTITY_TRANSFORM,
        transportPoints: [TRANSPORT_POINT],
      }),
    ).toStrictEqual([
      {
        areaId: "starfell-valley",
        arrival: { heightOffset: 5, position: { x: 50, z: -100 }, rotation: -1.5708 },
        heightOffset: 5,
        id: "mondstadt-new-moon-statue-7",
        kind: LandmarkKind.StatueOfTheNewMoon,
        position: { x: 50, z: -100 },
        rotation: -1.5708,
      },
    ]);
  });

  test("a transport point with no paired map waypoint is not a waypoint", () => {
    expect.hasAssertions();

    expect({
      beyondBar: landmarksAt([createMapPoint({ x_pos: 175 })]),
      statueLabel: landmarksAt([createMapPoint({ label_id: INTERACTIVE_MAP_STATUE_LABEL_ID })]),
    }).toStrictEqual({ beyondBar: [], statueLabel: [] });
  });
});
