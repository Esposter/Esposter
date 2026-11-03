import type { OculusPlace } from "#src/models/oculus/OculusPlace";

import { OculusKind } from "#src/models/oculus/OculusKind";
import { flushReads } from "#src/services/shared/flushReads.test";
import { OCULUS_TOUCH_RADIUS } from "#src/services/statue/constants";
import { startTestWorldSession } from "#src/store/session.fixture";
import { useWorldStatuesStore } from "#src/store/statues";
import { describe, expect, test, vi } from "vitest";

const FOUND_OCULUS_ID = "found";
const UNFOUND_OCULUS_ID = "unfound";
const PLACES: OculusPlace[] = [
  { id: FOUND_OCULUS_ID, kind: OculusKind.Anemoculus, position: { x: 0, z: 0 } },
  { id: UNFOUND_OCULUS_ID, kind: OculusKind.Anemoculus, position: { x: 1, z: 0 } },
];

vi.mock(import("#src/services/statue/readOculusPlaces"), () => ({ readOculusPlaces: () => Promise.resolve(PLACES) }));

describe(useWorldStatuesStore, () => {
  const FAR_X = -100;
  const start = async (characterPosition = { x: FAR_X, z: 0 }) => {
    startTestWorldSession();
    const worldStatuesStore = useWorldStatuesStore();
    worldStatuesStore.start({
      characterBody: { position: characterPosition },
      foundOculusIds: new Set([FOUND_OCULUS_ID]),
      getMapCamera: () => ({ facing: 0, x: 0, yaw: 0, z: 0 }),
      regionStatueProgressMap: new Map(),
    });
    await flushReads();
    return worldStatuesStore;
  };

  test("the Oculi the save names as found are not stood in", async () => {
    expect.hasAssertions();

    const worldStatuesStore = await start();

    expect(worldStatuesStore.unfoundOculusPlaces.map(({ id }) => id)).toStrictEqual([UNFOUND_OCULUS_ID]);
    expect(worldStatuesStore.findTouchedOculus()).toBeUndefined();
  });

  test("an unfound Oculus within the touch radius is the one the body touches", async () => {
    expect.hasAssertions();

    const worldStatuesStore = await start({ x: 1 + OCULUS_TOUCH_RADIUS, z: 0 });

    expect(worldStatuesStore.findTouchedOculus()?.id).toBe(UNFOUND_OCULUS_ID);
  });

  test("an Oculus the save names as found is not touched", async () => {
    expect.hasAssertions();

    const worldStatuesStore = await start({ x: -OCULUS_TOUCH_RADIUS, z: 0 });

    expect(worldStatuesStore.findTouchedOculus()).toBeUndefined();
  });

  test("stopping gives back an empty world", async () => {
    expect.hasAssertions();

    const worldStatuesStore = await start();
    worldStatuesStore.stop();

    expect(worldStatuesStore.foundOculusIds.size).toBe(0);
    expect(worldStatuesStore.oculusPlaces).toStrictEqual([]);
    expect(worldStatuesStore.findTouchedOculus()).toBeUndefined();
  });
});
