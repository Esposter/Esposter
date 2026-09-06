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

  test("does not read a name the call is only the tail of as the call", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("const wrapped = mygetResult(fn);")).toStrictEqual([]);
  });

  // Whitespace and a block comment are trivia to the grammar, so the `(` they sit in front of still opens this
  // Call's argument list
  test("reports a call written with a space before its bracket", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("getResult (fn);")).toStrictEqual([{ after: ";", line: 1 }]);
  });

  test("reports nothing for a terminated call a comment splits from its bracket", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("getResult /* note */ (fn).match(noop, console.error);")).toStrictEqual([]);
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

  // Naming the chain and terminating it below is the repo's own spelling, so what follows the call is `;` and
  // The name is where the terminator went
  test("reports nothing for a binding terminated on a later line", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\nresult.match(noop, console.error);`)).toStrictEqual(
      [],
    );
  });

  test("reads an optional call on the binding as the terminator", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\nresult?.match(noop, console.error);`)).toStrictEqual(
      [],
    );
  });

  test("reports a binding no later line reads", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\nreadSomethingElse();`)).toStrictEqual([
      { after: "; readSomethingElse;", line: 1 },
    ]);
  });

  // The value leaves the statement, so the terminator is the caller's — every shape of that
  test("reports nothing for a chain its own function returns", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("const read = () => getResult(fn);")).toStrictEqual([]);
  });

  test("reports nothing for a chain handed to a combinator's callback", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("getResult(first).orElse(() => getResult(second)).match(noop, log);")).toStrictEqual(
      [],
    );
  });

  test("reports nothing for a chain passed as an argument", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("handle(getResult(fn));")).toStrictEqual([]);
  });

  // `await` is not what receives the value, so stripping it is what leaves the call standing as a statement
  test("reports an awaited call nothing terminates", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("await getResultAsync(fn);")).toStrictEqual([{ after: ";", line: 1 }]);
  });
});
