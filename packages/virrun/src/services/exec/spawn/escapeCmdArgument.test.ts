import { escapeCmdArgument } from "#src/services/exec/spawn/escapeCmdArgument";
import { describe, expect, test } from "vitest";

// Each metacharacter, quotes and spaces included, comes out quoted and caret-escaped twice, the way a batch file's own
// Line re-parses the argument. The expected values match upstream cross-spawn's double escape for every argument
// Without a run of two backslashes, which the regressions below cover.
describe(escapeCmdArgument, () => {
  test.each([
    ["&", '^^^"^^^&^^^"'],
    ["|", '^^^"^^^|^^^"'],
    ["<", '^^^"^^^<^^^"'],
    [">", '^^^"^^^>^^^"'],
    ["^", '^^^"^^^^^^^"'],
    ["%", '^^^"^^^%^^^"'],
    ["!", '^^^"^^^!^^^"'],
    ["(", '^^^"^^^(^^^"'],
    [")", '^^^"^^^)^^^"'],
    [";", '^^^"^^^;^^^"'],
    [",", '^^^"^^^,^^^"'],
    [" ", '^^^"^^^ ^^^"'],
    ["f", '^^^"f^^^"'],
    ["?.", '^^^"^^^?.^^^"'],
    ["=`", '^^^"=^^^`^^^"'],
    ["'", '^^^"\'^^^"'],
    ["()", '^^^"^^^(^^^)^^^"'],
    ["%!", '^^^"^^^%^^^!^^^"'],
    ["^<", '^^^"^^^^^^^<^^^"'],
    [">&", '^^^"^^^>^^^&^^^"'],
    ["|;", '^^^"^^^|^^^;^^^"'],
    ["!=", '^^^"^^^!=^^^"'],
    ["bar\\", String.raw`^^^"bar\\^^^"`],
  ])("escapes %j for cmd.exe", (argument, escaped) => {
    expect.hasAssertions();

    expect(escapeCmdArgument(argument)).toBe(escaped);
  });

  // A quote inside the argument is written `\"`, and the quotes around the whole argument are escaped like the rest
  test('escapes the quotes of "f", a quoted argument, as quotes node reads', () => {
    expect.hasAssertions();

    expect(escapeCmdArgument('"f"')).toBe(String.raw`^^^"\^^^"f\^^^"^^^"`);
  });

  // Regression for PR #160, which replaced the backslash regex with a lookahead form that captures one backslash and
  // Stops: a run of two or more before a quote is doubled once, not in full, so MSVCRT reads the quote as closing the
  // Argument and the rest of it splits off. Upstream 7.0.6 gives four backslashes for `\\"`, where five are needed.
  test("#160 doubles every backslash in a run of two that ends at a quote", () => {
    expect.hasAssertions();

    expect(escapeCmdArgument(String.raw`\\"`)).toBe(String.raw`^^^"\\\\\^^^"^^^"`);
  });

  test("#160 doubles every backslash in a run of two that ends the argument", () => {
    expect.hasAssertions();

    expect(escapeCmdArgument(String.raw`x\\`)).toBe(String.raw`^^^"x\\\\^^^"`);
  });

  test("#160 doubles a single backslash before a quote, which the lookahead form already did", () => {
    expect.hasAssertions();

    expect(escapeCmdArgument(String.raw`\"`)).toBe(String.raw`^^^"\\\^^^"^^^"`);
  });

  // Regression for the 7.0.4 release (issue #163), where a replacement string read `$1` out of the argument itself
  test("#163 reads a dollar sign in an argument as data, not as a replacement pattern", () => {
    expect.hasAssertions();

    expect(escapeCmdArgument("$1$1")).toBe('^^^"$1$1^^^"');
  });

  // Regression for CVE-2024-21538 (GHSA-3xgq-45jj-v275, issue #167): the backtracking regex took time quadratic in a
  // Backslash run. A run of twenty thousand is escaped in one pass.
  test("#167 escapes a long backslash run in one pass", () => {
    expect.hasAssertions();

    const RUN_LENGTH = 20_000;

    expect(escapeCmdArgument(`${"\\".repeat(RUN_LENGTH)}"`)).toBe(`^^^"${"\\".repeat(RUN_LENGTH * 2 + 1)}^^^"^^^"`);
  });
});
