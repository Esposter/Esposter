import type { CooldownGroupReadyAtMap } from "#src/models/gadget/CooldownGroupReadyAtMap";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { checkIsGadgetReady } from "#src/services/gadget/checkIsGadgetReady";
import { describe, expect, test } from "vitest";

describe(checkIsGadgetReady, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const gadget: GadgetRow = {
    cooldownGroup: 1,
    cooldownOnFailSeconds: 0,
    cooldownSeconds: 30,
    id: 220003,
    isEquipable: true,
    kind: GadgetKind.Detector,
  };
  const groupMate: GadgetRow = { ...gadget, id: 220009 };
  const readyAtMap: CooldownGroupReadyAtMap = new Map([[1, epoch.add({ seconds: 30 })]]);

  test("a gadget whose group was never used is ready", () => {
    expect.hasAssertions();

    expect(checkIsGadgetReady(new Map(), gadget, epoch)).toBe(true);
  });

  test("a gadget is not ready until its group's moment, and a group-mate waits on the same one", () => {
    expect.hasAssertions();

    expect(checkIsGadgetReady(readyAtMap, gadget, epoch.add({ seconds: 29 }))).toBe(false);
    expect(checkIsGadgetReady(readyAtMap, groupMate, epoch.add({ seconds: 29 }))).toBe(false);
    expect(checkIsGadgetReady(readyAtMap, gadget, epoch.add({ seconds: 30 }))).toBe(true);
  });

  test("a gadget with no group shares its cooldown with no other gadget", () => {
    expect.hasAssertions();

    const ungrouped: GadgetRow = { ...gadget, cooldownGroup: 0, id: 220004 };
    const otherUngrouped: GadgetRow = { ...ungrouped, id: 220021 };
    const usedMap: CooldownGroupReadyAtMap = new Map([[ungrouped.id, epoch.add({ seconds: 30 })]]);

    expect(checkIsGadgetReady(usedMap, ungrouped, epoch)).toBe(false);
    expect(checkIsGadgetReady(usedMap, otherUngrouped, epoch)).toBe(true);
  });
});
