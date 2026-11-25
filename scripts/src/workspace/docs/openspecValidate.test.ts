import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { spawnPnpm } from "#src/services/shared/spawnPnpm";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * The CLI's own check of what it reads — each change's artifacts and deltas, each spec's Purpose and Requirements —
 * in strict mode, so a change `openspec archive` would refuse fails `pnpm test` first rather than on the day it ships
 * (the `openspec` skill, `references/spec-tests.md`).
 */
describe("openspecValidate", () => {
  test("every change and spec passes strict validation", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    const { stdout } = spawnPnpm(["exec", "openspec", "validate", "--all", "--strict", "--no-interactive", "--json"], {
      cwd: REPOSITORY_ROOT,
    });
    const { items } = parseMachineJson<{
      items: { id: string; issues: { message: string }[]; type: string; valid: boolean }[];
    }>(stdout);
    // Named rather than counted: the failure names the item and what the CLI found wrong with it
    const failures = items
      .filter(({ valid }) => !valid)
      .map(({ id, issues, type }) => `${type}/${id}: ${issues.map(({ message }) => message).join("; ")}`);

    expect(failures).toStrictEqual([]);
  });
});
