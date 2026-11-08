import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SceneTransportPoint } from "#src/models/genshinAssets/world/SceneTransportPoint";

import { fitInteractiveMap } from "#src/services/genshinAssets/fit/fitInteractiveMap";
import { OculusKindLabelIdMap } from "#src/services/genshinAssets/oculi/OculusKindLabelIdMap";
import {
  INTERACTIVE_MAP_STATUE_LABEL_ID,
  INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
} from "#src/services/genshinAssets/points/constants";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { readInteractiveMapPoints } from "#src/services/genshinAssets/points/readInteractiveMapPoints";
import { readSceneTransportPoints } from "#src/services/genshinAssets/world/readSceneTransportPoints";
import type { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { OculusKind } from "genshin-world";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/points/readInteractiveMapPoints"), () => ({
  readInteractiveMapPoints: vi.fn<typeof readInteractiveMapPoints>(),
}));
vi.mock(import("#src/services/genshinAssets/world/readSceneTransportPoints"), () => ({
  readSceneTransportPoints: vi.fn<typeof readSceneTransportPoints>(),
}));
vi.mock(import("#src/services/shared/writeJsonFile"), () => ({ writeJsonFile: vi.fn<typeof writeJsonFile>() }));
vi.mock(import("node:fs/promises"), async (importOriginal) => ({
  ...(await importOriginal()),
  mkdir: vi.fn<() => Promise<undefined>>(),
}));

describe(fitInteractiveMap, () => {
  const anemoculusLabelId = OculusKindLabelIdMap[OculusKind.Anemoculus];
  // Four of Mondstadt's statues and waypoints, with transport points on the same ground, so the fit is the identity
  // Every one of them matches
  const mondstadtPoints: InteractiveMapPoint[] = [
    { area_id: 1, id: 1, label_id: INTERACTIVE_MAP_STATUE_LABEL_ID, x_pos: 0, y_pos: 0, z_level: 0 },
    { area_id: 1, id: 2, label_id: INTERACTIVE_MAP_STATUE_LABEL_ID, x_pos: 100, y_pos: 0, z_level: 0 },
    { area_id: 1, id: 3, label_id: INTERACTIVE_MAP_WAYPOINT_LABEL_ID, x_pos: 0, y_pos: 100, z_level: 0 },
    { area_id: 1, id: 4, label_id: INTERACTIVE_MAP_WAYPOINT_LABEL_ID, x_pos: 30, y_pos: 70, z_level: 0 },
  ];
  const transportPoints: SceneTransportPoint[] = [
    { height: 0, id: "windrise-a", position: { x: 0, z: 0 }, turnDegrees: 0 },
    { height: 0, id: "windrise-b", position: { x: 100, z: 0 }, turnDegrees: 0 },
    { height: 0, id: "windrise-c", position: { x: 0, z: 100 }, turnDegrees: 0 },
    { height: 0, id: "windrise-d", position: { x: 30, z: 70 }, turnDegrees: 0 },
  ];
  const mondstadtOculiCount = InteractiveMapRegionMap.mondstadt?.oculus.count;
  // Every region but Mondstadt holds no matched point, and no Oculus of its kind is on the map in them
  const unmatchedRegionLines = Object.entries(InteractiveMapRegionMap)
    .filter(([region]) => region !== "mondstadt")
    .map(([region, { oculus }]) => `${region}: 0 matched, residual none, Oculi 0 of ${oculus.count}`);

  test("mondstadt reported first", async () => {
    expect.hasAssertions();
    vi.mocked(readInteractiveMapPoints).mockResolvedValue([
      ...mondstadtPoints,
      { area_id: 1, id: 5, label_id: anemoculusLabelId, x_pos: 50, y_pos: 50, z_level: 0 },
      { area_id: 1, id: 6, label_id: anemoculusLabelId, x_pos: 60, y_pos: 40, z_level: 0 },
    ]);
    vi.mocked(readSceneTransportPoints).mockResolvedValue(transportPoints);
    const report = await fitInteractiveMap();
    expect(report).toBe(
      [
        "4 of 4 statues and waypoints matched, residual 0 game units (bar 20)",
        `mondstadt: 4 matched, residual 0, Oculi 2 of ${mondstadtOculiCount}`,
        ...unmatchedRegionLines,
      ].join("\n"),
    );
  });

  test("shortfall kept as it stands", async () => {
    expect.hasAssertions();
    vi.mocked(readInteractiveMapPoints).mockResolvedValue([
      ...mondstadtPoints,
      { area_id: 1, id: 5, label_id: anemoculusLabelId, x_pos: 50, y_pos: 50, z_level: 0 },
    ]);
    vi.mocked(readSceneTransportPoints).mockResolvedValue(transportPoints);
    const report = await fitInteractiveMap();
    expect(report).toBe(
      [
        "4 of 4 statues and waypoints matched, residual 0 game units (bar 20)",
        `mondstadt: 4 matched, residual 0, Oculi 1 of ${mondstadtOculiCount}`,
        ...unmatchedRegionLines,
      ].join("\n"),
    );
  });

  test("snezhnaya with no matched points", async () => {
    expect.hasAssertions();
    // Snezhnaya's statue stands far from every transport point, so the fit leaves it unmatched and its residual none
    vi.mocked(readInteractiveMapPoints).mockResolvedValue([
      ...mondstadtPoints,
      { area_id: 16, id: 7, label_id: INTERACTIVE_MAP_STATUE_LABEL_ID, x_pos: 9000, y_pos: 9000, z_level: 0 },
    ]);
    vi.mocked(readSceneTransportPoints).mockResolvedValue(transportPoints);
    const report = await fitInteractiveMap();
    expect(report).toBe(
      [
        "4 of 5 statues and waypoints matched, residual 0 game units (bar 20)",
        `mondstadt: 4 matched, residual 0, Oculi 0 of ${mondstadtOculiCount}`,
        ...unmatchedRegionLines,
      ].join("\n"),
    );
  });
});
