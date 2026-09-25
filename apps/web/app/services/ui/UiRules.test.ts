import { UiRules } from "@/services/ui/UiRules";
import { describe, expect, test } from "vitest";

describe("uiRules", () => {
  // An empty field is left to `required`, so a field that may stay empty is never told off before anything is typed
  test.each([UiRules.isNotProfanity(), UiRules.maxLength(0), UiRules.minValue(1), UiRules.pattern(/^a$/u)])(
    "passes an empty field",
    (rule) => {
      expect.hasAssertions();
      expect(rule("")).toBe(true);
    },
  );

  test("refuses an empty field it requires", () => {
    expect.hasAssertions();
    expect(UiRules.required()("")).toBe("This field is required");
  });

  // Zero is a value the field holds, and waving it through as nothing entered is exactly what the rule exists to stop
  test("refuses zero below a minimum of one", () => {
    expect.hasAssertions();
    expect(UiRules.minValue(1)("0")).toBe("You must enter a value of at least 1");
  });
});
