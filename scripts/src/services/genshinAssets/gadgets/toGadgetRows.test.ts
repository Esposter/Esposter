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
      },
    ]);
  });
});
