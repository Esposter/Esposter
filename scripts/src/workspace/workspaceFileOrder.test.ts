import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { WORKSPACE_FILE } from "@esposter/configuration";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * `pnpm-workspace.yaml` is read by hand more than any other config, and an entry written where it was thought of
 * rather than where it sorts is one a reader scans past: the catalog is 200 names long. Its settings, its catalog and
 * its overrides are each in code point order, so a new entry has one place to go and a misplaced one is a plain diff.
 * `packages` leads, as it does in every pnpm workspace, since it is the workspace's definition rather than a setting
 * of it.
 */
describe("workspaceFileOrder", () => {
  const text = readFileSync(resolve(REPOSITORY_ROOT, WORKSPACE_FILE), "utf8");

  test("list the settings after packages in order", () => {
    expect.hasAssertions();

    const [first, ...settings] = Array.from(text.matchAll(/^[A-Za-z]\w*(?=:)/gmu), ([key]) => key);

    expect(first).toBe("packages");
    expect(settings).toStrictEqual(settings.toSorted());
  });

  test.each([DependencyGroup.Catalog, DependencyGroup.Overrides])("list the %s entries in order", (group) => {
    expect.hasAssertions();

    const keys = parseWorkspaceEntries(group, getSection(group, text)).map(({ packageName }) => packageName);

    expect(keys).toStrictEqual(keys.toSorted());
  });
});
