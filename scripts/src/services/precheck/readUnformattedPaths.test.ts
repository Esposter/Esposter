import { ChangeStatus } from "#src/models/queue/ChangeStatus";
import { GENERATED_PATH, OUTSIDE_PATH, UNPARSABLE_PATH, UNPARSABLE_SOURCE } from "#src/services/format/constants.test";
import { setupFormatterTree } from "#src/services/format/setupFormatterTree.test";
import { readUnformattedPaths } from "#src/services/precheck/readUnformattedPaths";
import { REPOSITORY_ROOT, VITE_CONFIGURATION_FILE } from "#src/services/shared/constants";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

describe(readUnformattedPaths, () => {
  const getRoot = setupFormatterTree();

  test("flags the changed file the formatter would rewrite, and not a generated one", () => {
    expect.hasAssertions();

    const changedFiles = [
      { path: GENERATED_PATH, status: ChangeStatus.Modified },
      { path: OUTSIDE_PATH, status: ChangeStatus.Modified },
    ];

    expect(readUnformattedPaths(changedFiles, getRoot(), REPOSITORY_ROOT)).toStrictEqual([OUTSIDE_PATH]);
  });

  // Oxfmt ignores a component, so it is vize that finds one unformatted
  test("flags a changed component vize would rewrite", () => {
    expect.hasAssertions();

    const root = getRoot();
    const componentPath = "Component.vue";
    writeFileSync(join(root, VITE_CONFIGURATION_FILE), "export default {};\n");
    writeFileSync(join(root, componentPath), "<template><div/></template>\n");

    expect(
      readUnformattedPaths([{ path: componentPath, status: ChangeStatus.Modified }], root, REPOSITORY_ROOT),
    ).toStrictEqual([componentPath]);
  });

  test("stops with the formatter's own message for the one file it cannot parse, checked in a run with good files", () => {
    expect.hasAssertions();
    // The formatter decorates its message for a CI environment, so the run is pinned to the plain form a terminal sees
    vi.stubEnv("CI", undefined);

    const root = getRoot();
    writeFileSync(join(root, UNPARSABLE_PATH), UNPARSABLE_SOURCE);
    const changedFiles = [
      { path: OUTSIDE_PATH, status: ChangeStatus.Modified },
      { path: UNPARSABLE_PATH, status: ChangeStatus.Modified },
    ];

    expect(() => readUnformattedPaths(changedFiles, root, REPOSITORY_ROOT)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: packages/example/src/kit/Broken.ts, x Unexpected token]`,
    );
  });
});
