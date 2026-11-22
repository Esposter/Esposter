import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { checkHoldsUnclassified } from "#src/services/sweeps/ledgerCoverage/checkHoldsUnclassified";
import { describe, expect, test } from "vitest";

describe(checkHoldsUnclassified, () => {
  test("holds an overlay with an Unclassified entry", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = { "a.b": { cause: KitProvisionalCause.Unclassified, value: 0 } };

    expect(checkHoldsUnclassified(overlay)).toBe(true);
  });

  test("passes an overlay whose entries are classified or sourced", () => {
    expect.hasAssertions();

    const overlay: KitOverlay = {
      "a.b": { cause: KitProvisionalCause.Unsourced, value: 0 },
      "a.c": { source: KitSource.Gcsim, value: 1 },
    };

    expect(checkHoldsUnclassified(overlay)).toBe(false);
  });
});
