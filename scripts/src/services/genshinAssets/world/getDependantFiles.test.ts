import { getDependantFiles } from "#src/services/genshinAssets/world/getDependantFiles";
import { describe, expect, test } from "vitest";

describe(getDependantFiles, () => {
  test("gives each name the files depending on the file holding it, by the offset the index gives it", () => {
    expect.hasAssertions();

    const dependantOfA = { block: "c", dependencies: ["a"], offset: 0 };
    const dependantOfB = { block: "b", dependencies: ["b"], offset: 0 };

    expect(
      getDependantFiles(
        [
          { block: "a", name: "a", offset: 0, pathId: "", type: "" },
          { block: "a", name: "b", offset: 1, pathId: "", type: "" },
        ],
        new Map([
          ["a", { block: "a", dependencies: [], offset: 0 }],
          ["b", { block: "a", dependencies: [], offset: 1 }],
          ["c", dependantOfB],
          ["d", dependantOfA],
        ]),
      ),
    ).toStrictEqual(
      new Map([
        ["a", [dependantOfA]],
        ["b", [dependantOfB]],
      ]),
    );
  });
});
