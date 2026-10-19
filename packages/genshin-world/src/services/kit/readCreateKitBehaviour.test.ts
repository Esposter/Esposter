import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { readCreateKitBehaviour } from "#src/services/kit/readCreateKitBehaviour";
import { describe, expect, test } from "vitest";

describe(readCreateKitBehaviour, () => {
  // An id no character holds, so no behaviour module is listed for it
  const UNLISTED_CHARACTER_ID = 1;

  test("gives a character with no behaviour module of its own a behaviour that returns nothing", async () => {
    expect.hasAssertions();

    const createBehaviour = await readCreateKitBehaviour(UNLISTED_CHARACTER_ID);

    expect(createBehaviour({} as KitRecordReader)).toStrictEqual({});
  });
});
