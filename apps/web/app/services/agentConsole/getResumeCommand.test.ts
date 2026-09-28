import { getResumeCommand } from "@/services/agentConsole/getResumeCommand";
import { describe, expect, test } from "vitest";

describe(getResumeCommand, () => {
  test.each([
    ["/a'$(b)", String.raw`cd -- '/a'\''$(b)' && claude --resume 'c'`],
    [
      String.raw`C:\a'’$(b)`,
      String.raw`Set-Location -LiteralPath 'C:\a''’’$(b)' -ErrorAction Stop; claude --resume 'c'`,
    ],
    [String.raw`\\a\b`, String.raw`Set-Location -LiteralPath '\\a\b' -ErrorAction Stop; claude --resume 'c'`],
  ])("quotes %s for its own shell", (cwd, expected) => {
    expect.hasAssertions();

    expect(getResumeCommand(cwd, "c")).toBe(expected);
  });
});
