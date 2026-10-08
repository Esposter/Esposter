import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { startGadgetCooldown } from "#src/services/gadget/startGadgetCooldown";
import { describe, expect, test } from "vitest";

describe(startGadgetCooldown, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const gadget: GadgetRow = {
    cooldownGroup: 2,
    cooldownOnFailSeconds: 5,
    cooldownSeconds: 30,
    id: 220003,
    isEquipable: true,
    kind: GadgetKind.Detector,
  };

  test("a use that works starts the cooldown of its group", () => {
    expect.hasAssertions();

    expect(startGadgetCooldown(new Map(), gadget, false, epoch)).toStrictEqual(
      new Map([[2, epoch.add({ seconds: 30 })]]),
    );
  });

  test("a failed use starts the cooldown on a failed use instead", () => {
    expect.hasAssertions();

    expect(startGadgetCooldown(new Map(), gadget, true, epoch)).toStrictEqual(
      new Map([[2, epoch.add({ seconds: 5 })]]),
    );
  });

  test("the map given is left as it was", () => {
    expect.hasAssertions();

    const readyAtMap = new Map<number, Temporal.Instant>();
    startGadgetCooldown(readyAtMap, gadget, false, epoch);

    expect(readyAtMap.size).toBe(0);
  });
});
