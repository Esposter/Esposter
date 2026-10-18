import { readDomainEntrancePoints } from "#src/services/genshinAssets/domains/readDomainEntrancePoints";
import { readScenePointsOfKind } from "#src/services/genshinAssets/world/readScenePointsOfKind";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinAssets/world/readScenePointsOfKind"), () => ({
  readScenePointsOfKind: vi.fn<typeof readScenePointsOfKind>(),
}));

describe(readDomainEntrancePoints, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("a scene whose entrance points hold no transport position is refused rather than read as no entrances", async () => {
    expect.hasAssertions();

    vi.mocked(readScenePointsOfKind).mockResolvedValueOnce([["7", { $type: "Point", renamedPosition: { x: 1 } }]]);
    await expect(readDomainEntrancePoints()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: BinOutput/Scene/Point/scene3_point.json, has no point holding tranPos]`,
    );
  });
});
