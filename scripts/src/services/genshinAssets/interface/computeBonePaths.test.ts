import { computeBonePaths } from "#src/services/genshinAssets/interface/computeBonePaths";
import { describe, expect, test } from "vitest";

describe(computeBonePaths, () => {
  test("names each bone by the names from the rig's root down to it, the root's own empty name leading", () => {
    expect.hasAssertions();

    expect(
      computeBonePaths([
        { name: "", parent: -1 },
        { name: "Bip001", parent: 0 },
        { name: "Bip001 Pelvis", parent: 1 },
      ]),
    ).toStrictEqual(["", "/Bip001", "/Bip001/Bip001 Pelvis"]);
  });
});
