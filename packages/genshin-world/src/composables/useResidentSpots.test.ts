import type { RegionData } from "#src/models/world/RegionData";
import type { Resident } from "#src/models/world/Resident";
import type { GameClock } from "genshin-engine";
import type { Camera } from "three";

import { useResidentSpots } from "#src/composables/useResidentSpots";
import { DAY_END_MINUTES, DAY_START_MINUTES } from "#src/services/resident/constants";
import { PerspectiveCamera, Vector3 } from "three";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { camera, onBeforeRender } = vi.hoisted(() => {
  const view: { value: Camera | undefined } = { value: undefined };
  return { camera: view, onBeforeRender: vi.fn<(callback: () => void) => void>() };
});

// The composable reads only the camera and the loop's onBeforeRender from the TresJS context.
// The fake stands in for those two and nothing else.
// oxlint-disable-next-line vitest/prefer-import-in-mock -- A partial fake: the typed module returns the whole TresJS context
vi.mock("@tresjs/core", () => ({ useLoop: () => ({ onBeforeRender }), useTres: () => ({ camera }) }));

// Each frame runs the callbacks the composable registered on the loop
const renderFrame = () => {
  for (const [render] of onBeforeRender.mock.calls) render();
};

describe(useResidentSpots, () => {
  beforeEach(() => {
    // A default camera looks down the negative z axis, so a resident at a positive z stands behind it, in no view
    camera.value = new PerspectiveCamera();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("setting the time moves residents", () => {
    expect.hasAssertions();

    const resident: Resident = {
      areaId: "areaId",
      day: { position: { x: 0, z: 1 }, rotation: 0 },
      id: "id",
      nameTextId: "nameTextId",
      night: { position: { x: 1, z: 1 }, rotation: 0 },
      talkId: "talkId",
    };
    const regionData: RegionData = {
      enemyCamps: [],
      goToPlaces: [],
      id: "id",
      landmarks: [],
      outcropPlaces: [],
      residents: [resident],
      rivers: [],
      waterfalls: [],
    };
    const regionDataMap = new Map([[regionData.id, regionData]]);
    const gameClock: GameClock = { minutes: DAY_START_MINUTES, minutesPerSecond: 0 };
    const { residentSpots } = useResidentSpots(regionDataMap, gameClock, new Vector3(), () => 0);
    renderFrame();

    expect(residentSpots.value.get(resident.id)).toStrictEqual(resident.day);

    gameClock.minutes = DAY_END_MINUTES;
    renderFrame();

    expect(residentSpots.value.get(resident.id)).toStrictEqual(resident.night);
  });
});
