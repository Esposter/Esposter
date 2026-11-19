import type { SilhouetteSize } from "genshin-engine";

import { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import { WildlifeShape } from "#src/models/wildlife/WildlifeShape";
import { getWildlifeShape } from "#src/services/wildlife/getWildlifeShape";
import { describe, expect, test } from "vitest";

describe(getWildlifeShape, () => {
  const SILHOUETTE_SIZE: SilhouetteSize = { depth: 0.3, height: 0.2, width: 0.1 };

  test("a kind with a silhouette size is drawn as a silhouette", () => {
    expect.hasAssertions();

    const silhouetteSizes = { [WildlifeKind.CrimsonFox]: SILHOUETTE_SIZE };

    expect(getWildlifeShape(WildlifeKind.CrimsonFox, silhouetteSizes)).toStrictEqual(WildlifeShape.Silhouette);
  });

  test("a kind with no silhouette stays a capsule", () => {
    expect.hasAssertions();

    const silhouetteSizes = { [WildlifeKind.CrimsonFox]: SILHOUETTE_SIZE };

    expect(getWildlifeShape(WildlifeKind.Squirrel, silhouetteSizes)).toStrictEqual(WildlifeShape.Capsule);
  });
});
