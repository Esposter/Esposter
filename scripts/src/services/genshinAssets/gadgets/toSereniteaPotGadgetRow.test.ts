import { toSereniteaPotGadgetRow } from "#src/services/genshinAssets/gadgets/toSereniteaPotGadgetRow";
import { describe, expect, test } from "vitest";

describe(toSereniteaPotGadgetRow, () => {
  test("a widget material is a device row, equipable and placed one at a time, with no cooldown", () => {
    expect.hasAssertions();

    expect(toSereniteaPotGadgetRow([{ id: 900001, materialType: "MATERIAL_WIDGET" }], 900001)).toStrictEqual({
      cooldownGroup: 0,
      cooldownOnFailSeconds: 0,
      cooldownSeconds: 0,
      gatherItemId: 0,
      id: 900001,
      isEquipable: true,
      kind: "Device",
      maxCountByPlayer: 1,
      maxCountInScene: 1,
      maxPoints: 0,
      region: "",
    });
  });

  test("an item the material table gives no widget row for is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toSereniteaPotGadgetRow([{ id: 900002, materialType: "MATERIAL_WIDGET" }], 900001),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: material 900001, has no widget material row]`,
    );
    expect(() =>
      toSereniteaPotGadgetRow([{ id: 900001, materialType: "MATERIAL_CONSUME" }], 900001),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: material 900001, has no widget material row]`,
    );
  });
});
