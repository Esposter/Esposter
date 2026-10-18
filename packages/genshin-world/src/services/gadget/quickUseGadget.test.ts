import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { quickUseGadget } from "#src/services/gadget/quickUseGadget";
import { describe, expect, test } from "vitest";

describe(quickUseGadget, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const GROUP_ID = 3;
  const gadget: GadgetRow = {
    cooldownGroup: GROUP_ID,
    cooldownOnFailSeconds: 5,
    cooldownSeconds: 30,
    gatherItemId: 0,
    id: 1001,
    isEquipable: true,
    kind: GadgetKind.Detector,
    region: "",
  };

  test("z uses the equipped gadget", () => {
    expect.hasAssertions();

    expect(quickUseGadget(new Map(), gadget, epoch)).toStrictEqual(new Map([[GROUP_ID, epoch.add({ seconds: 30 })]]));
  });

  test("z does nothing while the gadget's cooldown runs", () => {
    expect.hasAssertions();

    const readyAt = epoch.add({ seconds: 10 });
    const cooldownGroupReadyAtMap = new Map([[GROUP_ID, readyAt]]);

    expect(quickUseGadget(cooldownGroupReadyAtMap, gadget, epoch)).toStrictEqual(new Map([[GROUP_ID, readyAt]]));
  });
});
