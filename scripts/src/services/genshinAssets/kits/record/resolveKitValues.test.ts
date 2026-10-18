import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { resolveKitValues } from "#src/services/genshinAssets/kits/record/resolveKitValues";
import { Element } from "genshin-world";
import { describe, expect, test } from "vitest";

const TABLES = { element: Element.Geo, talentGroupIdMap: {} } as unknown as KitTables;
const OVERLAY: KitOverlay = { "burst.hits.0.element": { cause: KitProvisionalCause.NoGcsimUnit, value: "Rock" } };

describe(resolveKitValues, () => {
  test("names an overlay value no gcsim folder gives as the unit gcsim does not model", () => {
    const { provenanceMap } = resolveKitValues(new Map(), OVERLAY, new Map(), TABLES, false);
    expect(provenanceMap.get("burst.hits.0.element")).toStrictEqual({
      cause: KitProvisionalCause.NoGcsimUnit,
      source: KitSource.Overlay,
    });
  });

  test("refuses that cause for a character gcsim has a folder for, which can read the value", () => {
    expect(() => resolveKitValues(new Map(), OVERLAY, new Map(), TABLES, true)).toThrow();
  });

  test("gives a burst's first hit the character's element where no source gives one, as a rule", () => {
    const { provenanceMap, valueMap } = resolveKitValues(
      new Map(),
      { "burst.hits.length": { cause: KitProvisionalCause.NoGcsimUnit, value: 1 } },
      new Map(),
      TABLES,
      false,
    );
    expect(valueMap.get("burst.hits.0.element")).toBe(Element.Geo);
    expect(provenanceMap.get("burst.hits.0.element")).toStrictEqual({
      rule: KitRule.EnergyElement,
      source: KitSource.Rule,
    });
  });
});
