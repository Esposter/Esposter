import { describe, expect, test } from "vitest";

import { selectLaidGroundKeys } from "#src/services/world/selectLaidGroundKeys";

describe(selectLaidGroundKeys, () => {
  test("lays a region's plateau alone while its lock holds one", () => {
    expect.hasAssertions();

    expect(selectLaidGroundKeys(["ground/alpha", "ground/alpha/one", "ground/beta/two"])).toStrictEqual([
      "ground/alpha",
      "ground/beta/two",
    ]);
  });

  test("lays a region's pieces and their quarters when its lock holds no plateau", () => {
    expect.hasAssertions();

    expect(selectLaidGroundKeys(["ground/beta/two", "ground/beta/two/0", "ground/gamma"])).toStrictEqual([
      "ground/beta/two",
      "ground/beta/two/0",
      "ground/gamma",
    ]);
  });

  test("lays none of windrise's keys", () => {
    expect.hasAssertions();

    expect(selectLaidGroundKeys(["ground/windrise", "ground/windrise/0", "ground/gamma"])).toStrictEqual([
      "ground/gamma",
    ]);
  });
});
