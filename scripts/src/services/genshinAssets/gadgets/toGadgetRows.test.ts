import type { ConfigWidgetRow } from "#src/models/genshinAssets/gadgets/ConfigWidgetRow";

import { toGadgetRows } from "#src/services/genshinAssets/gadgets/toGadgetRows";
import { describe, expect, test } from "vitest";

describe(toGadgetRows, () => {
  test("a widget of a built kind is a row with its omitted fields at zero, and a kind not built is left out", () => {
    expect.hasAssertions();

    const widgets: Record<string, ConfigWidgetRow> = {
      "101516": { $type: "ConfigWidgetTakePhoto" },
      "220004": { $type: "ConfigWidgetClientCollector", coolDown: 100, isEquipable: true },
    };

    expect(toGadgetRows(widgets)).toStrictEqual([
      {
        cooldownGroup: 0,
        cooldownOnFailSeconds: 0,
        cooldownSeconds: 100,
        id: 220004,
        isEquipable: true,
        kind: "Collector",
        region: "",
      },
    ]);
  });

  test("a treasure compass names the region its city joins, and a widget naming no city has none", () => {
    expect.hasAssertions();

    const widgets: Record<string, ConfigWidgetRow> = {
      "220003": { $type: "ConfigWidgetClientDetector", allowCityId: 2, coolDown: 30 },
      "220013": { $type: "ConfigWidgetTreasureMapDetector", coolDown: 30 },
    };

    expect(toGadgetRows(widgets).map(({ id, region }) => ({ id, region }))).toStrictEqual([
      { id: 220003, region: "liyue" },
      { id: 220013, region: "" },
    ]);
  });
});
