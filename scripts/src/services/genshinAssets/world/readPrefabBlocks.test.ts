import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";
import type { readIndexedAssets as baseReadIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";

import { readPrefabBlocks } from "#src/services/genshinAssets/world/readPrefabBlocks";
import { describe, expect, test, vi } from "vitest";

const { readIndexedAssets } = vi.hoisted(() => ({ readIndexedAssets: vi.fn<typeof baseReadIndexedAssets>() }));

vi.mock(import("#src/services/genshinAssets/shared/readIndexedAssets"), () => ({
  readIndexedAssets: readIndexedAssets as typeof baseReadIndexedAssets,
}));

describe(readPrefabBlocks, () => {
  test("follows a building's mesh into the files depending on it that the index lists nothing in, and a prop's nowhere", async () => {
    expect.hasAssertions();

    const building: IndexedAsset = { block: "a", name: "Build_", offset: 0, pathId: "", type: "" };
    const prop: IndexedAsset = { block: "a", name: "", offset: 1, pathId: "", type: "" };
    const listed: IndexedAsset = { block: "d", name: "", offset: 0, pathId: "", type: "" };
    readIndexedAssets.mockImplementationOnce((predicate) =>
      Promise.resolve([listed, building].filter((asset) => predicate(asset))),
    );

    await expect(
      readPrefabBlocks(
        [building, prop],
        new Map([
          ["a", { block: "a", dependencies: [], offset: 0 }],
          ["b", { block: "a", dependencies: [], offset: 1 }],
          ["c", { block: "c", dependencies: ["a"], offset: 0 }],
          ["d", { block: "d", dependencies: ["a"], offset: 0 }],
          ["e", { block: "e", dependencies: ["b"], offset: 0 }],
        ]),
      ),
    ).resolves.toStrictEqual(
      new Map([
        ["", ["a"]],
        ["Build_", ["a", "c"]],
      ]),
    );
  });
});
