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

  // `scanCode` drops the bracket, so in the code alone this reads as `getResultfn` — every case above hides
  // That behind an arrow, whose own brackets are dropped too and leave a `=` where the name ends
  test("reports a call whose argument is a bare identifier", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("const result = getResult(fn);")).toStrictEqual([{ after: ";", line: 1 }]);
  });

  test("does not read a longer identifier as the call", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("const wrapped = getResultOrDefault(fn);")).toStrictEqual([]);
  });

  // The scan reads code rather than text, so a call written inside either is not one
  test("reports nothing for a call quoted inside a string", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const documentation = "getResult(() => read());";`)).toStrictEqual([]);
  });

  test("reports nothing for a call written inside a comment", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("// getResult(() => read());\nconst first = 1;")).toStrictEqual([]);
  });

  test("reports nothing for a bare reference the name is not called through", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("const wrap = getResult;")).toStrictEqual([]);
  });

  test("reports the line of each call rather than of the file", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const first = 1;\n\ngetResult(() => read());`)).toStrictEqual([
      { after: ";", line: 3 },
    ]);
  });
});
