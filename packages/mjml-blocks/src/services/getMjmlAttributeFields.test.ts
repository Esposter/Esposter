import { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";
import { getMjmlAttributeFields } from "#src/services/getMjmlAttributeFields";
import { describe, expect, test } from "vitest";

describe(getMjmlAttributeFields, () => {
  test("each attribute is a field, sorted by name, with MJML's default", () => {
    expect.hasAssertions();

    expect(
      getMjmlAttributeFields({
        allowedAttributes: { align: "enum(left,center)", width: "unit(px)" },
        defaultAttributes: { align: "left" },
      }),
    ).toStrictEqual([
      { defaultValue: "left", name: "align", type: { kind: MjmlAttributeKind.Enum, options: ["left", "center"] } },
      {
        defaultValue: undefined,
        name: "width",
        type: { isNegativeAllowed: false, kind: MjmlAttributeKind.Unit, maxCount: 1, minCount: 1, units: ["px"] },
      },
    ]);
  });
});
