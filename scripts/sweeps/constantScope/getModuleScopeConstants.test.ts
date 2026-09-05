import { getModuleScopeConstants } from "#scripts/sweeps/constantScope/getModuleScopeConstants";
import { describe, expect, test } from "vitest";

describe(getModuleScopeConstants, () => {
  const name = "name";

  // The whole reason this scan exists: a scan that reports nothing reads exactly like a swept tree, so the first
  // Thing it owes is a planted violation it does report
  test("reports a fixture object declared at module scope", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = { id: "" };`)).toStrictEqual([{ line: 1, name }]);
  });

  test("reports a factory call, which is state even though a function produced it", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = createEntity();`)).toStrictEqual([{ line: 1, name }]);
  });

  test("skips an arrow function, which holds no state", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = () => "";`)).toStrictEqual([]);
  });

  // The `=>` lands on a later line, so a line-anchored regex reads the first line as a constant
  test("skips a multi-line arrow function", () => {
    expect.hasAssertions();

    expect(
      getModuleScopeConstants(`const ${name} = (\n  first: string,\n  second: string,\n): string => first + second;`),
    ).toStrictEqual([]);
  });

  test("skips an async function expression, which holds no state either", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = async function () {\n  return "";\n};`)).toStrictEqual([]);
  });

  // The body is rebuilt from `scanCode`'s output, so a comment between two keywords has to leave a boundary —
  // Without one this reads as `asyncfunction` and the exemption stops matching
  test("skips an async function expression with a comment inside its head", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = async/* note */function () {\n  return "";\n};`)).toStrictEqual([]);
  });

  // The formatter indents everything a describe callback holds, so the column-zero anchor is the whole mechanism
  test("skips a declaration nested inside a describe callback", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`describe("suite", () => {\n  const ${name} = { id: "" };\n});`)).toStrictEqual([]);
  });

  test("skips a top-level await, which a synchronous describe callback cannot hold", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = await createEntity();`)).toStrictEqual([]);
  });

  test("skips a vi.hoisted block, which is lifted above the imports", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const { ${name} } = vi.hoisted(() => ({ ${name}: "" }));`)).toStrictEqual([]);
  });

  test("skips every declaration in a helper file, which holds module state by design", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = { id: "" };\n\ndescribe.todo("${name}");`)).toStrictEqual([]);
  });

  // A `;` inside a string ends nothing, so a plain bracket count stops the declaration early and reads the arrow
  // On the next line as a second one
  test("does not end a declaration on a semicolon inside a string", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = {\n  key: ";",\n};\n\nconst other = () => "";`)).toStrictEqual([
      { line: 1, name },
    ]);
  });

  test("does not end a declaration inside a template substitution", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = \`\${[";"].join("")}\`;`)).toStrictEqual([{ line: 1, name }]);
  });

  test("reads past a comment holding an unbalanced bracket", () => {
    expect.hasAssertions();

    expect(getModuleScopeConstants(`const ${name} = {\n  // (\n};`)).toStrictEqual([{ line: 1, name }]);
  });
});
