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

  test("reads a comment between two composable calls, a JSDoc included, as part of their run", () => {
    expect.hasAssertions();

    expect(
      getDeclarationLines("const a = useA();\n// The second call\n/**\n * Its JSDoc\n */\nconst b = useB();"),
    ).toStrictEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  test("keeps a comment beside code as code", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("const a = useA();\n// The second call\nconst b = compute(1);")).toStrictEqual(
      new Set([1]),
    );
  });

  test("reads a props destructure of a defineProps call as declaration, through its closing line", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("const {\n  a,\n  b: c,\n} = defineProps<Props>();\nconst d = 0;")).toStrictEqual(
      new Set([1, 2, 3, 4]),
    );
  });

  test("reads a withDefaults call as declaration, through its closing brace", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("const props = withDefaults(propsSource, {\n  a: 1,\n});\nconst b = 0;")).toStrictEqual(
      new Set([1, 2, 3]),
    );
  });

  test("keeps a destructure's computed default as code, its closing macro line still preamble", () => {
    expect.hasAssertions();

    expect(getDeclarationLines("const {\n  a = makeA(),\n} = defineProps<Props>();")).toStrictEqual(new Set([3]));
  });
});
