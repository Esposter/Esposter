import { escapeCmdCommand } from "#src/services/exec/spawn/escapeCmdCommand";
import { describe, expect, test } from "vitest";

describe(escapeCmdCommand, () => {
  test.each([
    [String.raw`C:\Program Files\nodejs\node.exe`, String.raw`C:\Program^ Files\nodejs\node.exe`],
    ["a&b", "a^&b"],
    ["pnpm", "pnpm"],
  ])("caret-escapes the metacharacters of %j, so a path with a space is one word", (command, escaped) => {
    expect.hasAssertions();

    expect(escapeCmdCommand(command)).toBe(escaped);
  });
});
