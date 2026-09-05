import { scanCode } from "#scripts/sweeps/constantScope/scanCode";
import { describe, expect, test } from "vitest";

describe(scanCode, () => {
  const readCode = (text: string) =>
    [...scanCode(text)]
      .map(([character]) => character)
      .join("")
      .trim();

  test("drops the brackets and reports the depth of what sits inside them", () => {
    expect.hasAssertions();

    expect([...scanCode("a(b)c")]).toStrictEqual([
      ["a", 0],
      ["b", 1],
      ["c", 0],
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

    expect(readCode("a`text${b}text`c")).toBe("abc");
  });

  test("skips a line comment to the end of its line", () => {
    expect.hasAssertions();

    expect(readCode("a// ;(\nb")).toBe("a\nb");
  });

  test("skips a block comment", () => {
    expect.hasAssertions();

    expect(readCode("a/* ;( */b")).toBe("ab");
  });

  test("skips an unterminated comment to the end of the text", () => {
    expect.hasAssertions();

    expect(readCode("a/* b")).toBe("a");
  });
});
