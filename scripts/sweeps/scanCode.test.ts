import { scanCode } from "#scripts/sweeps/scanCode";
import { describe, expect, test } from "vitest";

const readCode = (text: string) =>
  [...scanCode(text)]
    .map(([character]) => character)
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
