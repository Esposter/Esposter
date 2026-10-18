import type { RegionGround } from "#src/models/world/RegionGround";

import { readWindriseBaseGrounds } from "#src/services/windrise/readWindriseBaseGrounds";
import { describe, expect, test } from "vitest";

// A ground reader that records each key it is asked for, resolving each with a ground whose base counts the keys read
const createRecordingGroundReader = () => {
  const readKeys: string[] = [];
  const readGround = (key: string) => {
    readKeys.push(key);
    return Promise.resolve({ base: readKeys.length, features: [], hills: [] } satisfies RegionGround);
  };
  return { readGround, readKeys };
};

describe(readWindriseBaseGrounds, () => {
  test("reads Windrise's record alone while the lock holds one", async () => {
    expect.hasAssertions();

    const { readGround, readKeys } = createRecordingGroundReader();
    const baseGrounds = await readWindriseBaseGrounds(["ground/windrise", "ground/liyue/0"], readGround);

    expect({ bases: baseGrounds.map(({ base }) => base), readKeys }).toStrictEqual({
      bases: [1],
      readKeys: ["ground/windrise"],
    });
  });

  test("reads Windrise's quarters in the lock's order when it holds no record", async () => {
    expect.hasAssertions();

    const { readGround, readKeys } = createRecordingGroundReader();
    const baseGrounds = await readWindriseBaseGrounds(
      ["ground/windrise/0", "ground/windrise/1", "ground/liyue/0", "ground/windrise/2", "ground/windrise/3"],
      readGround,
    );

    expect({ bases: baseGrounds.map(({ base }) => base), readKeys }).toStrictEqual({
      bases: [1, 2, 3, 4],
      readKeys: ["ground/windrise/0", "ground/windrise/1", "ground/windrise/2", "ground/windrise/3"],
    });
  });
});
