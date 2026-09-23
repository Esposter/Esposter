import { getShortcutKeyLabels } from "@/services/ui/getShortcutKeyLabels";
import { describe, expect, test } from "vitest";

describe(getShortcutKeyLabels, () => {
  test.each([
    ["ctrl+k", [["Ctrl", "K"]]],
    ["shift+?", [["Shift", "?"]]],
    ["g-/", [["G"], ["/"]]],
    ["arrowup", [["↑"]]],
  ])("reads %s as its key caps", (shortcut, expected) => {
    expect.hasAssertions();

    expect(getShortcutKeyLabels(shortcut)).toStrictEqual(expected);
  });
});
