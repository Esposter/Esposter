import { getPluginItems } from "#src/services/resume/getPluginItems";
import { describe, expect, test } from "vitest";

describe(getPluginItems, () => {
  test("lists the plugins whose key is not installed", () => {
    expect.hasAssertions();

    expect(getPluginItems("marketplace", ["a", "b"], ["a@marketplace", "b@other"])).toStrictEqual([
      { action: "claude plugin install b@marketplace --scope user", text: "b@marketplace missing" },
    ]);
  });
});
