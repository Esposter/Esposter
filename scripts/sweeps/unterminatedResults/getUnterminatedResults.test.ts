import { getUnterminatedResults } from "#scripts/sweeps/unterminatedResults/getUnterminatedResults";
import { describe, expect, test } from "vitest";

describe(getUnterminatedResults, () => {
  // The whole reason this scan exists: a scan that reports nothing reads exactly like a terminated tree, so the
  // First thing it owes is a planted violation it does report
  test("reports a call nothing chains onto", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("getResult(() => read());")).toStrictEqual([{ after: ";", line: 1 }]);
  });

  test("reports nothing for a call its own terminator follows", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("getResult(() => read()).match(noop, console.error);")).toStrictEqual([]);
  });

  test("reports nothing for the async form either", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("getResultAsync(async () => read()).match(noop, console.error);")).toStrictEqual([]);
  });

  // A fixed window around the call is what this replaces: the terminator sits wherever the callback ends
  test("finds a terminator many lines below the call", () => {
    expect.hasAssertions();

    expect(
      getUnterminatedResults(`getResult(() => {\n  first();\n  second();\n  third();\n}).match(noop, console.error);`),
    ).toStrictEqual([]);
  });

  test("reads past a closing bracket inside a string", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`getResult(() => ")").match(noop, console.error);`)).toStrictEqual([]);
  });

  test("reads past a closing bracket inside a comment", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`getResult(() => {\n  // )\n  read();\n});`)).toStrictEqual([
      { after: ";", line: 1 },
    ]);
  });

  test("reports the line of each call rather than of the file", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const first = 1;\n\ngetResult(() => read());`)).toStrictEqual([
      { after: ";", line: 3 },
    ]);
  });
});
