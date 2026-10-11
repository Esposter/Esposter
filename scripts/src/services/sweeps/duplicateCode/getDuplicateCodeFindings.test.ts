import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getDuplicateCodeFindings } from "#src/services/sweeps/duplicateCode/getDuplicateCodeFindings";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(getDuplicateCodeFindings, () => {
  const createClone = (startLine: number, endLine: number) => {
    const duplication = (sourceId: string) => ({
      end: { line: endLine },
      range: [0, 0] as [number, number],
      sourceId: join(REPOSITORY_ROOT, sourceId),
      start: { line: startLine },
    });
    return { duplicationA: duplication("a"), duplicationB: duplication("b"), format: "typescript" };
  };

  test("reads a clone whose lines are import declarations in both files as no finding", () => {
    expect.hasAssertions();

    expect(getDuplicateCodeFindings([createClone(1, 2)], () => `import a from "a";\nimport b from "b";`)).toStrictEqual(
      [],
    );
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
