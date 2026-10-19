import { getDeclarationLines } from "#src/services/sweeps/duplicateCode/getDeclarationLines";
import { describe, expect, test } from "vitest";

describe(getDeclarationLines, () => {
  test("reads an interface and a props, emits or model declaration as declarations, through their closing braces", () => {
    expect.hasAssertions();

    expect(
      getDeclarationLines(
        "interface Props {\n  a: string;\n}\nconst b = 0;\nconst isOpen = defineModel<boolean>({ default: false });\nconst emit = defineEmits<{\n  c: [];\n}>();",
      ),
    ).toStrictEqual(new Set([1, 2, 3, 5, 6, 7, 8]));
  });

  test("reads a composable's bare call as component wiring", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("const settingsStore = useSettingsStore();\nconst a = compute(1);")).toStrictEqual(
      new Set([1]),
    );
  });

  test("reads a composable's destructured call of bare names and aliases as component wiring", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("const {\n  a,\n  b: c,\n} = useWorldSave({ events });\nconst d = 0;")).toStrictEqual(
      new Set([1, 2, 3, 4]),
    );
  });

  test("reads a composable's return of bare names as component wiring", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("return {\n  a,\n  b,\n};\nconst c = 0;")).toStrictEqual(new Set([1, 2, 3, 4]));
  });

  test("keeps a composable's destructured call holding a computed value as code", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("const {\n  name: value + 1,\n} = useWorldSave({ events });")).toStrictEqual(new Set());
  });

  test("keeps a composable's return holding a computed value as code", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("return {\n  name: value + 1,\n};")).toStrictEqual(new Set());
  });
});
