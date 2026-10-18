import { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";
import { parseMjmlAttributeType } from "#src/services/parseMjmlAttributeType";
import { describe, expect, test } from "vitest";

describe(parseMjmlAttributeType, () => {
  test.each([
    ["boolean", { kind: MjmlAttributeKind.Boolean }],
    ["color", { kind: MjmlAttributeKind.Color }],
    ["enum(full-width,false,)", { kind: MjmlAttributeKind.Enum, options: ["full-width", "false", ""] }],
    ["integer", { kind: MjmlAttributeKind.Integer }],
    ["string", { kind: MjmlAttributeKind.String }],
    [
      "unit(px,%,)",
      { isNegativeAllowed: false, kind: MjmlAttributeKind.Unit, maxCount: 1, minCount: 1, units: ["px", "%", ""] },
    ],
    [
      "unit(px,%){1,4}",
      { isNegativeAllowed: false, kind: MjmlAttributeKind.Unit, maxCount: 4, minCount: 1, units: ["px", "%"] },
    ],
    [
      "unitWithNegative(px,em)",
      { isNegativeAllowed: true, kind: MjmlAttributeKind.Unit, maxCount: 1, minCount: 1, units: ["px", "em"] },
    ],
  ])("%s parses to its type", (grammar, type) => {
    expect.hasAssertions();

    expect(parseMjmlAttributeType(grammar)).toStrictEqual(type);
  });
  test("a grammar it does not know is refused", () => {
    expect.hasAssertions();

    expect(() => parseMjmlAttributeType("date")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: date, is not an MJML attribute type]`,
    );
  });
});
