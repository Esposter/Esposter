import {
  FORMATTED_SOURCE,
  GENERATED_PATH,
  OUTSIDE_PATH,
  UNFORMATTED_SOURCE,
  UNPARSABLE_PATH,
  UNPARSABLE_SOURCE,
} from "#src/services/format/constants.test";
import { formatFiles } from "#src/services/format/formatFiles";
import { setupFormatterTree } from "#src/services/format/setupFormatterTree.test";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(formatFiles, () => {
  const getRoot = setupFormatterTree();

  test("rewrites the file the formatter would change, and leaves a generated file as its writer wrote it", () => {
    expect.hasAssertions();

    const root = getRoot();

    expect(formatFiles([GENERATED_PATH, OUTSIDE_PATH], root, REPOSITORY_ROOT)).toBe(1);
    expect(readFileSync(join(root, GENERATED_PATH), "utf8")).toBe(UNFORMATTED_SOURCE);
    expect(readFileSync(join(root, OUTSIDE_PATH), "utf8")).toBe(FORMATTED_SOURCE);
  });

  test("rewrites the files before the one it cannot parse, then stops with the formatter's message", () => {
    expect.hasAssertions();

    const root = getRoot();
    writeFileSync(join(root, UNPARSABLE_PATH), UNPARSABLE_SOURCE);

    expect(() =>
      formatFiles([OUTSIDE_PATH, UNPARSABLE_PATH], root, REPOSITORY_ROOT),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: packages/example/src/kit/Broken.ts, x Unexpected token]`,
    );
    expect(readFileSync(join(root, OUTSIDE_PATH), "utf8")).toBe(FORMATTED_SOURCE);
  });
});
