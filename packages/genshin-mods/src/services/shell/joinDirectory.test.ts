import { describe, expect, test } from "vitest";

import { joinDirectory } from "./joinDirectory";

describe(joinDirectory, () => {
  test.each([
    ["the base for no folder", "/repo", "", "/repo"],
    ["a relative folder under the base", "/repo", "packages/genshin-mods", "/repo/packages/genshin-mods"],
    ["a sibling through a parent", "/work/repo", "../other", "/work/other"],
    ["an absolute folder over the base", "/repo", "/other", "/other"],
    ["a Windows folder over the base", "/repo", String.raw`C:\other\.\checkout`, "C:/other/checkout"],
    ["a relative folder with no base, its parents kept", "", "../../other", "../../other"],
    ["no folder above the root", "/repo", "../../..", "/"],
  ])("joins %s", (_description, base, next, folder) => {
    expect.hasAssertions();

    expect(joinDirectory(base, next)).toBe(folder);
  });
});
