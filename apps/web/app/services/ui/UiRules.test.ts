import { UiRules } from "#src/services/ui/UiRules";
import { describe, expect, test } from "vitest";

describe("uiRules", () => {
  // An empty field is left to `required`, so a field that may stay empty is never told off before anything is typed
  test.each([
    UiRules.notProfanity(),
    UiRules.maxLength(0),
    UiRules.maxValue(1),
    UiRules.minValue(1),
    UiRules.pattern(/^a$/u),
  ])("passes an empty field", (rule) => {
    expect.hasAssertions();
    expect(rule("")).toBe(true);
  });

  // A field of spaces is empty once trimmed, so `required` refuses it as it refuses an empty one
  test.each(["", "   "])("refuses a field it requires that holds %j", (value) => {
    expect.hasAssertions();
    expect(UiRules.required()(value)).toBe("This field is required");
  });

  // Zero is a value the field holds, and waving it through as nothing entered is exactly what the rule exists to stop
  test("refuses zero below a minimum of one", () => {
    expect.hasAssertions();
    expect(UiRules.minValue(1)("0")).toBe("You must enter a value of at least 1");
  });
});
