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
});
