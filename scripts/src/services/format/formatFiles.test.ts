import {
  FORMATTED_SOURCE,
  GENERATED_PATH,
  OUTSIDE_PATH,
  UNFORMATTED_SOURCE,
} from "#src/services/format/constants.test";
import { formatFiles } from "#src/services/format/formatFiles";
import { setupFormatterTree } from "#src/services/format/setupFormatterTree.test";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
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
});
