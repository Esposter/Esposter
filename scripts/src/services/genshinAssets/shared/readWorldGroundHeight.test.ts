import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { TerrainFeatureKind } from "genshin-engine";
import { describe, expect, test, vi } from "vitest";

const { lockObjects, readKeys, records } = vi.hoisted(() => ({
  lockObjects: { "ground/liyue": "liyue", "ground/mondstadt": "mondstadt", "ground/windrise": "windrise" },
  readKeys: [] as string[],
  records: {} as Record<string, object>,
}));

vi.mock(import("#src/services/gameData/readGameDataLock"), () => ({
  readGameDataLock: () => Promise.resolve({ indexes: {}, objects: lockObjects }),
}));

vi.mock(import("#src/services/gameData/readPublishedGameData"), () => ({
  readPublishedGameData: <T>(key: string): Promise<T> => {
    readKeys.push(key);
    return Promise.resolve(records[key] as T);
  },
}));

const WINDRISE_BASE = 10;
const LIYUE_HEIGHT = 5;
const MONDSTADT_HEIGHT = 40;
const LIYUE_PLACE = { x: 100, z: 0 };
const MONDSTADT_PLACE = { x: -100, z: 0 };
const plateau = ({ x, z }: { x: number; z: number }, height: number) => ({
  falloff: 6,
  height,
  kind: TerrainFeatureKind.Plateau,
  radius: 60,
  x,
  z,
});

describe(readWorldGroundHeight, () => {
  test("reads Windrise's base and the laid regions' grounds, leaving Mondstadt's plateau unlaid", async () => {
    expect.hasAssertions();

    records["ground/windrise"] = { base: WINDRISE_BASE, features: [], hills: [] };
    records["ground/liyue"] = { base: 0, features: [plateau(LIYUE_PLACE, LIYUE_HEIGHT)], hills: [] };
    records["ground/mondstadt"] = { base: 0, features: [plateau(MONDSTADT_PLACE, MONDSTADT_HEIGHT)], hills: [] };
    readKeys.splice(0);

    const getHeight = await readWorldGroundHeight();

    expect(readKeys.toSorted()).toStrictEqual(["ground/liyue", "ground/windrise"]);
    expect(getHeight(LIYUE_PLACE.x, LIYUE_PLACE.z)).toBeCloseTo(WINDRISE_BASE + LIYUE_HEIGHT);
    expect(getHeight(MONDSTADT_PLACE.x, MONDSTADT_PLACE.z)).toBe(WINDRISE_BASE);
  });
});
