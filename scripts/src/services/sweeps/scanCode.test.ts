import { scanCode } from "#src/services/sweeps/scanCode";
import { describe, expect, test } from "vitest";

const readCode = (text: string) =>
  Array.from(scanCode(text), ([character]) => character)
    .join("")
    .trim();

describe(scanCode, () => {
  test("drops the brackets and reports the depth and index of what sits inside them", () => {
    expect.hasAssertions();

    expect([...scanCode("a(b)c")]).toStrictEqual([
      ["a", 0, 0],
      ["b", 1, 2],
      ["c", 0, 4],
    ]);
  });

  test("skips a double-quoted string", () => {
    expect.hasAssertions();

    expect(readCode(`a";(){}"b`)).toBe("ab");
  });

  test("skips an escaped quote rather than closing on it", () => {
    expect.hasAssertions();

    expect(readCode(`a"\\";"b`)).toBe("ab");
  });

  test("skips a template literal but reads its substitution", () => {
    expect.hasAssertions();

    expect(readCode(`a\`text\${b}text\`c`)).toBe("abc");
  });

  // A regex literal's quotes and brackets are pattern: read as code they open a string or a bracket nothing closes
  test("skips a regex literal, its character class and its flags", () => {
    expect.hasAssertions();

    expect(readCode(String.raw`a = /"[(]"\/x/gu;b`)).toBe("a = ;b");
  });

  test("reads a division, which no regex literal follows", () => {
    expect.hasAssertions();

    expect(readCode("a / b / c")).toBe("a / b / c");
  });

  // A skipped literal leaves no token behind, so the tail still ended with the `=` before it and read the `/` as a
  // Regex opener — which then ran to the newline and took the `;` that ends the statement with it
  test.each([
    ["a string", 'a="s"/b;c', "a=/b;c"],
    ["a template literal", `a=\`\${s}\`/b;c`, "a=s/b;c"],
  ])("reads a division after %s", (_title, code, expected) => {
    expect.hasAssertions();

    expect(readCode(code)).toBe(expected);
  });

  test("skips a line comment to the end of its line", () => {
    expect.hasAssertions();

    expect(readCode("a// ;(\nb")).toBe("a\nb");
  });

  // A block comment separates the tokens either side of it, so it leaves a space rather than nothing — without
  // One, `async/* note */function` rejoins as `asyncfunction` and stops reading as a function expression
  test("leaves a space where a block comment was", () => {
    expect.hasAssertions();

    expect(readCode("a/* ;( */b")).toBe("a b");
  });

  test("keeps the tokens either side of an inline block comment apart", () => {
    expect.hasAssertions();

    expect(readCode("async/* note */function")).toBe("async function");
  });

  test("skips an unterminated comment to the end of the text", () => {
    expect.hasAssertions();

    expect(readCode("a/* b")).toBe("a");
  });
});
