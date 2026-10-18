import type { CooldownGroupReadyAtMap } from "#src/models/gadget/CooldownGroupReadyAtMap";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { getGadgetCooldownSeconds } from "#src/services/gadget/getGadgetCooldownSeconds";
import { describe, expect, test } from "vitest";

describe(getGadgetCooldownSeconds, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const gadget: GadgetRow = {
    cooldownGroup: 1,
    cooldownOnFailSeconds: 0,
    cooldownSeconds: 30,
    gatherItemId: 0,
    id: 220003,
    isEquipable: true,
    kind: GadgetKind.Detector,
    maxPoints: 0,
    region: "",
  };
  const readyAtMap: CooldownGroupReadyAtMap = new Map([[1, epoch.add({ seconds: 30 })]]);

  test("a gadget that was never used has no seconds left", () => {
    expect.hasAssertions();

    expect(getGadgetCooldownSeconds(new Map(), gadget, epoch)).toBe(0);
  });

  test("a gadget shows the seconds left of its group's cooldown, and none once it is ready", () => {
    expect.hasAssertions();

    expect(getGadgetCooldownSeconds(readyAtMap, gadget, epoch.add({ seconds: 12 }))).toBe(18);
    expect(getGadgetCooldownSeconds(readyAtMap, gadget, epoch.add({ seconds: 30 }))).toBe(0);
    expect(getGadgetCooldownSeconds(readyAtMap, gadget, epoch.add({ seconds: 45 }))).toBe(0);
  });
});
