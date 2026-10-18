import { removeDynamicJsonImportAttributes } from "#src/removeDynamicJsonImportAttributes";
import { describe, expect, test } from "vitest";

describe(removeDynamicJsonImportAttributes, () => {
  test("removes the type attribute from a dynamic JSON import", () => {
    expect.hasAssertions();

    expect(
      removeDynamicJsonImportAttributes(
        `const a = async () => (await import("./a.json", { with: { type: "json" } })).default;`,
      ),
    ).toBe(`const a = async () => (await import("./a.json")).default;`);
  });

  test("leaves a static JSON import's attribute for Vite to strip", () => {
    expect.hasAssertions();

    const code = `import a from "./a.json" with { type: "json" };`;

    expect(removeDynamicJsonImportAttributes(code)).toBe(code);
  });

  test("leaves a non-JSON dynamic import untouched", () => {
    expect.hasAssertions();

    const code = `const a = import("./a.vue");`;

    expect(removeDynamicJsonImportAttributes(code)).toBe(code);
  });
});
