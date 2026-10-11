import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/getDuplicateCodeFindings";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const createClone = (startLine: number, endLine: number, sourceIdA = "a", sourceIdB = "b") => {
  const duplication = (sourceId: string) => ({
    end: { line: endLine },
    range: [0, 0] as [number, number],
    sourceId: join(REPOSITORY_ROOT, sourceId),
    start: { line: startLine },
  });
  return { duplicationA: duplication(sourceIdA), duplicationB: duplication(sourceIdB), format: "typescript" };
};

describe(getDuplicateCodeFindings, () => {
  const pluginRoots = ["packages/first", "packages/second", "packages/mod"].map((directory) =>
    join(REPOSITORY_ROOT, directory),
  );
  const readPluginRoot = (sourceId: string) => pluginRoots.find((pluginRoot) => sourceId.startsWith(pluginRoot));

  test("reads a clone whose lines are import declarations in both files as no finding", () => {
    expect.hasAssertions();

    expect(getDuplicateCodeFindings([createClone(1, 2)], () => `import a from "a";\nimport b from "b";`)).toStrictEqual(
      [],
    );
  });

  test("reads a clone running from an identical import block into differing bodies as no finding", () => {
    expect.hasAssertions();

    const sourceIdA = join(REPOSITORY_ROOT, "a");
    const sourceA = `import a from "a";\nimport b from "b";\nconst first = 0;\nconst second = 1;`;
    const sourceB = `import a from "a";\nimport b from "b";\nconst third = 2;\nconst fourth = 3;`;
    expect(
      getDuplicateCodeFindings([createClone(1, 4)], (sourceId) => (sourceId === sourceIdA ? sourceA : sourceB)),
    ).toStrictEqual([]);
  });

  test("reads a clone of a declaration in both files as no finding", () => {
    expect.hasAssertions();

    expect(
      getDuplicateCodeFindings(
        [createClone(1, 3)],
        () => `interface Props {
  a: string;
}`,
      ),
    ).toStrictEqual([]);
  });

  test("reads a clone of enum-keyed record rows in both files as no finding", () => {
    expect.hasAssertions();

    expect(
      getDuplicateCodeFindings(
        [createClone(1, 3)],
        () => `export const map: Record<Kind, Item[]> = {
  [Kind.A]: [],
};`,
      ),
    ).toStrictEqual([]);
  });

  test("reads a clone of numeric and colour rows in both files as no finding", () => {
    expect.hasAssertions();

    expect(
      getDuplicateCodeFindings(
        [createClone(2, 3)],
        () => `export const map: Record<number, number> = {
  1: 17.165605,
  2: 18.535048,
};`,
      ),
    ).toStrictEqual([]);
  });

  test("reads a clone across two Claude plugins as no finding", () => {
    expect.hasAssertions();

    expect(
      getDuplicateCodeFindings(
        [createClone(1, 2, "packages/first/src/a.ts", "packages/second/src/b.ts")],
        () => `const a = 0;\nconst b = 1;`,
        readPluginRoot,
      ),
    ).toStrictEqual([]);
  });

  test("reads a clone within one Claude plugin as a finding", () => {
    expect.hasAssertions();

    expect(
      getDuplicateCodeFindings(
        [createClone(1, 2, "packages/first/src/a.ts", "packages/first/src/b.ts")],
        () => `const a = 0;\nconst b = 1;`,
        readPluginRoot,
      ),
    ).toStrictEqual([{ lines: 2, paths: ["packages/first/src/a.ts:1", "packages/first/src/b.ts:1"] }]);
  });

  test("reads a clone of two register files of a Claude plugin as no finding", () => {
    expect.hasAssertions();

    expect(
      getDuplicateCodeFindings(
        [
          createClone(
            1,
            2,
            "packages/mod/src/services/ward/registerWard.ts",
            "packages/mod/src/services/registerBand.ts",
          ),
        ],
        () => `const a = 0;\nconst b = 1;`,
        readPluginRoot,
      ),
    ).toStrictEqual([]);
  });

  test("reads a clone of two non-register files of a Claude plugin as a finding", () => {
    expect.hasAssertions();

    expect(
      getDuplicateCodeFindings(
        [createClone(1, 2, "packages/mod/src/services/ward/getWard.ts", "packages/mod/src/services/getBand.ts")],
        () => `const a = 0;\nconst b = 1;`,
        readPluginRoot,
      ),
    ).toStrictEqual([
      { lines: 2, paths: ["packages/mod/src/services/ward/getWard.ts:1", "packages/mod/src/services/getBand.ts:1"] },
    ]);
  });

  test("reads a clone holding code as a finding at its start lines, largest first", () => {
    expect.hasAssertions();

    expect(
      getDuplicateCodeFindings(
        [createClone(1, 2), createClone(1, 3)],
        () => `const a = 0;\nconst b = 1;\nconst c = 2;`,
      ),
    ).toStrictEqual([
      { lines: 3, paths: ["a:1", "b:1"] },
      { lines: 2, paths: ["a:1", "b:1"] },
    ]);
  });
});
