import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { GadgetKind } from "#src/models/gadget/GadgetKind";
import { equipGadget } from "#src/services/gadget/equipGadget";
import { describe, expect, test } from "vitest";

const createGadget = (id: number, isEquipable: boolean): GadgetRow => ({
  cooldownGroup: 0,
  cooldownOnFailSeconds: 0,
  cooldownSeconds: 30,
  gatherItemId: 0,
  id,
  isEquipable,
  kind: GadgetKind.Detector,
  maxPoints: 0,
  region: "",
});

describe(equipGadget, () => {
  const EQUIPABLE_GADGET_ID = 1001;

  const NOT_EQUIPABLE_GADGET_ID = 1002;

  const OTHER_GADGET_ID = 1003;

  test("an equipable gadget is equipped from its tab", () => {
    expect.hasAssertions();

    expect(equipGadget({ items: [], nextId: 0 }, createGadget(EQUIPABLE_GADGET_ID, true))).toStrictEqual({
      equippedGadgetItemId: EQUIPABLE_GADGET_ID,
      items: [],
      nextId: 0,
    });
  });

  test("a gadget the game does not mark equipable is refused", () => {
    expect.hasAssertions();

    const inventory = { equippedGadgetItemId: OTHER_GADGET_ID, items: [], nextId: 0 };

    expect(equipGadget(inventory, createGadget(NOT_EQUIPABLE_GADGET_ID, false))).toStrictEqual({
      equippedGadgetItemId: OTHER_GADGET_ID,
      items: [],
      nextId: 0,
    });
  });
});
