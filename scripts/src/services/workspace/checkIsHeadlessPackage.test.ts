import { checkIsHeadlessPackage } from "#src/services/workspace/checkIsHeadlessPackage";
import { HEADLESS_KEYWORD } from "#src/services/workspace/constants";
import { describe, expect, test } from "vitest";

describe(checkIsHeadlessPackage, () => {
  const NON_HEADLESS_NAME = "vue-grid-layout";

  test("a name containing headless makes a package headless", () => {
    expect.hasAssertions();
    expect(checkIsHeadlessPackage({ name: "vue-grid-layout-headless" })).toBe(true);
  });

  test("a keyword headless makes a package headless", () => {
    expect.hasAssertions();
    expect(checkIsHeadlessPackage({ keywords: [HEADLESS_KEYWORD], name: NON_HEADLESS_NAME })).toBe(true);
  });

  test("a package with neither a headless name nor keyword is not headless", () => {
    expect.hasAssertions();
    expect(checkIsHeadlessPackage({ keywords: ["vue"], name: NON_HEADLESS_NAME })).toBe(false);
  });
});
