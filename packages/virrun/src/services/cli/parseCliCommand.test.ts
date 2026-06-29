import { parseCliCommand } from "@/services/cli/parseCliCommand";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { describe, expect, test } from "vitest";

describe(parseCliCommand, () => {
  test("returns the whole argv as the command when there is no separator", () => {
    expect.hasAssertions();

    expect(parseCliCommand(["echo", "hi"])).toStrictEqual(["echo", "hi"]);
  });

  test("returns only the tokens after the first separator", () => {
    expect.hasAssertions();

    expect(parseCliCommand(["--", "echo", "hi"])).toStrictEqual(["echo", "hi"]);
  });

  test("drops tokens before the separator", () => {
    expect.hasAssertions();

    expect(parseCliCommand(["--flag", "--", "echo", "hi"])).toStrictEqual(["echo", "hi"]);
  });

  test("keeps a later separator as a command token, splitting only on the first", () => {
    expect.hasAssertions();

    expect(parseCliCommand(["--", "git", "clone", "--", "repo"])).toStrictEqual(["git", "clone", "--", "repo"]);
  });

  test("preserves a token containing spaces as a single element", () => {
    expect.hasAssertions();

    expect(parseCliCommand(["--", "echo", `${TEST_FILENAME} ${TEST_FILENAME}`])).toStrictEqual([
      "echo",
      `${TEST_FILENAME} ${TEST_FILENAME}`,
    ]);
  });

  test("preserves shell metacharacters literally without re-tokenizing", () => {
    expect.hasAssertions();

    expect(parseCliCommand(["--", "echo", "*", "a | b", "; rm -rf /"])).toStrictEqual([
      "echo",
      "*",
      "a | b",
      "; rm -rf /",
    ]);
  });

  test("returns an empty array when no arguments are given", () => {
    expect.hasAssertions();

    expect(parseCliCommand([])).toStrictEqual([]);
  });

  test("returns an empty array when the separator has nothing after it", () => {
    expect.hasAssertions();

    expect(parseCliCommand(["--"])).toStrictEqual([]);
  });
});
