import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { checkIsCitedBy } from "#src/services/genshinAssets/kits/record/checkIsCitedBy";
import { describe, expect, test } from "vitest";

describe(checkIsCitedBy, () => {
  const provenance: KitValueSource = { page: "Lightning Rose", revisionId: 2, row: 1, source: KitSource.Wiki };

  test("matches a wiki provenance of the cited page and row", () => {
    expect.hasAssertions();

    expect(checkIsCitedBy(provenance, { page: "Lightning Rose", row: 1 })).toBe(true);
  });

  test("does not match another row of the page", () => {
    expect.hasAssertions();

    expect(checkIsCitedBy(provenance, { page: "Lightning Rose", row: 2 })).toBe(false);
  });
});
