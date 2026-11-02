import { getUnterminatedResults } from "#src/services/sweeps/unterminatedResults/getUnterminatedResults";
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

  // A combinator hands back the chain still a Result, so one of them alone leaves the chain standing unterminated
  test.each(["andTee", "andThen", "map", "mapErr", "orElse", "orTee"])(
    "reports a call only a %s combinator is chained onto",
    (combinator) => {
      expect.hasAssertions();

      expect(getUnterminatedResults(`getResult(() => read()).${combinator}(console.error);`)).toStrictEqual([
        { after: `.${combinator}(console.error);`, line: 1 },
      ]);
    },
  );

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

  // A bare identifier argument is the shape a name-and-bracket match reads as one longer name
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

  // The scan reads syntax rather than text, so a call written inside either is not one
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
      { after: "; readSomethingElse();", line: 1 },
    ]);
  });

  // Inspecting the binding keeps its value in this statement, so no later line answers for it and it is reported
  test("reports a binding only inspected in an if test", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\nif (result.isErr()) read();`)).toStrictEqual([
      { after: "; if (result.isErr()) read();", line: 1 },
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

  test("reads a binding through its type annotation", () => {
    expect.hasAssertions();

    expect(
      getUnterminatedResults(`const result: Result<void, Error> = getResult(fn);\nreadSomethingElse();`),
    ).toStrictEqual([{ after: "; readSomethingElse();", line: 1 }]);
  });

  // The two characters the annotation is skipped by excluding are the two a type may still spell
  test("reads a binding through a function type annotation", () => {
    expect.hasAssertions();

    expect(
      getUnterminatedResults(`const result: () => Result<void, Error> = getResult(fn);\nreadSomethingElse();`),
    ).toStrictEqual([{ after: "; readSomethingElse();", line: 1 }]);
  });

  test("reads a binding through an object type annotation", () => {
    expect.hasAssertions();

    expect(
      getUnterminatedResults(`const result: { isOk: boolean; value: string } = getResult(fn);\nreadSomethingElse();`),
    ).toStrictEqual([{ after: "; readSomethingElse();", line: 1 }]);
  });

  // A longer name that starts with a terminator is not the terminator, and only the name read whole says which
  test("does not read a longer name starting with a terminator as the terminator", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("getResult(fn).matching(noop);")).toStrictEqual([
      { after: ".matching(noop);", line: 1 },
    ]);
  });

  test("does not read a longer name on the binding as its terminator", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\nresult.matching(noop);`)).toStrictEqual([
      { after: "; result.matching(noop);", line: 1 },
    ]);
  });

  // An identifier is not ASCII, so a name matched with `\w` reads a longer one as the binding it is only the
  // Tail of, and misses one whose own characters are outside the range
  test("reads a binding whose name is not ASCII", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const éresult = getResult(fn);\néresult.match(noop, log);`)).toStrictEqual([]);
  });

  test("does not read a longer non-ASCII name as the binding", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\néresult.match(noop, log);`)).toStrictEqual([
      { after: "; éresult.match(noop, log);", line: 1 },
    ]);
  });

  test("reports a binding only a combinator is called on", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\nresult.orTee(console.error);`)).toStrictEqual([
      { after: "; result.orTee(console.error);", line: 1 },
    ]);
  });

  // A chain on the binding is read to its end, so a terminator at the end of a combinator chain counts
  test("reports nothing for a binding whose combinator chain a terminator ends", () => {
    expect.hasAssertions();

    expect(
      getUnterminatedResults(`const result = getResult(fn);\nresult.andThen(read).match(noop, console.error);`),
    ).toStrictEqual([]);
  });

  // A combinator's Result that a `return` takes leaves the function, and its caller owns the terminator
  test("reports nothing for a binding read through a combinator its function returns", () => {
    expect.hasAssertions();

    expect(
      getUnterminatedResults(`const read = () => {\n  const result = getResult(fn);\n  return result.map(parse);\n};`),
    ).toStrictEqual([]);
  });

  // A `new`, an array or an object takes the value into what the function returns, so the caller owns the terminator
  test.each([
    { shape: "a new expression's argument", statement: "return new Box(result.value);" },
    { shape: "an array element", statement: "return [result.value];" },
    { shape: "an object property", statement: "return { value: result.value };" },
  ])("reports nothing for a binding's value a function returns as $shape", ({ statement }) => {
    expect.hasAssertions();

    expect(
      getUnterminatedResults(`const read = () => {\n  const result = getResult(fn);\n  ${statement}\n};`),
    ).toStrictEqual([]);
  });

  // A field a destructuring assignment writes into takes nothing into a return, so a plain write and this one agree
  test("reports a binding whose value is written into a destructuring target", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\n({ value: result.value } = src);`)).toStrictEqual([
      { after: "; ({ value: result.value } = src);", line: 1 },
    ]);
  });

  // Another object's field spelled the same is not this binding, and reading it as one clears a real finding
  test("does not read a like-named property as the binding", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const result = getResult(fn);\nother.result.match(noop, log);`)).toStrictEqual([
      { after: "; other.result.match(noop, log);", line: 1 },
    ]);
  });

  // `$` is legal in an identifier and an anchor in a pattern, so an unescaped one matches nothing
  test("reads a binding whose name carries a dollar sign", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults(`const $result = getResult(fn);\n$result.match(noop, log);`)).toStrictEqual([]);
  });

  // `await` is not what receives the value, so stripping it is what leaves the call standing as a statement
  test("reports an awaited call nothing terminates", () => {
    expect.hasAssertions();

    expect(getUnterminatedResults("await getResultAsync(fn);")).toStrictEqual([{ after: ";", line: 1 }]);
  });
});
