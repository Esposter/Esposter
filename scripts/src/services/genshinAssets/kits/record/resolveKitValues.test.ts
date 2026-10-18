import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { describe, expect, test } from "vitest";

const TALENT_GROUP_ID_MAP = {} as KitTables["talentGroupIdMap"];
const OVERLAY: KitOverlay = { "burst.hits.0.element": { cause: KitProvisionalCause.NoGcsimUnit, value: "Rock" } };

describe(resolveKitValues, () => {
  test("names an overlay value no gcsim folder gives as the unit gcsim does not model", () => {
    const { provenanceMap } = resolveKitValues(new Map(), OVERLAY, new Map(), TALENT_GROUP_ID_MAP, false);
    expect(provenanceMap.get("burst.hits.0.element")).toStrictEqual({
      cause: KitProvisionalCause.NoGcsimUnit,
      source: KitSource.Overlay,
    });
  });

  test("refuses that cause for a character gcsim has a folder for, which can read the value", () => {
    expect(() => resolveKitValues(new Map(), OVERLAY, new Map(), TALENT_GROUP_ID_MAP, true)).toThrow();
  });
});
