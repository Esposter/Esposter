import { tokenizeShellCommand } from "@/services/exec/vfs/tokenizeShellCommand";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(tokenizeShellCommand, () => {
  test("splits on whitespace", () => {
    expect.hasAssertions();

    expect(tokenizeShellCommand("node -e ")).toStrictEqual(["node", "-e"]);
  });

  test("keeps a double-quoted segment as one token", () => {
    expect.hasAssertions();

    const tokens = tokenizeShellCommand('node -e "a b"');

    expect(tokens).toStrictEqual(["node", "-e", "a b"]);
  });

  test("keeps a single-quoted segment as one token", () => {
    expect.hasAssertions();

    const tokens = tokenizeShellCommand("node -e 'a b'");

    expect(tokens).toStrictEqual(["node", "-e", "a b"]);
  });

  test("preserves an empty quoted token", () => {
    expect.hasAssertions();

    const tokens = tokenizeShellCommand('node -e ""');

    expect(takeOne(tokens ?? [], 2)).toBe("");
  });

  test("returns undefined on an unbalanced quote", () => {
    expect.hasAssertions();

    expect(tokenizeShellCommand('node -e "a')).toBeUndefined();
  });

  test("returns undefined on an unquoted shell operator", () => {
    expect.hasAssertions();

    expect(tokenizeShellCommand('node -e "a" | cat')).toBeUndefined();
  });

  test("keeps a shell operator that sits inside quotes", () => {
    expect.hasAssertions();

    expect(tokenizeShellCommand('node -e "a | b"')).toStrictEqual(["node", "-e", "a | b"]);
  });
});
