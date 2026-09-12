import { REPOSITORY_ROOT } from "#src/services/constants";
import { parseMachineJson } from "#src/services/parseMachineJson";
import { parseWorkspacePackageGlobs } from "#src/services/parseWorkspacePackageGlobs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * `lerna.json` has to repeat the workspace globs because lerna-lite reads neither `pnpm-workspace.yaml` nor a
 * `workspaces` field pnpm does not use — with no `packages` key it silently falls back to its own default,
 * `packages/*`, and versions only what that glob happens to reach. That is not a failure anyone sees: the release
 * runs green, publishes the libraries, and leaves every member outside `packages/` pinned at whatever version it
 * held the day it moved — which is exactly what the move to `apps/` did. So the repeat is enforced rather than
 * trusted, against the one file pnpm actually reads.
 */
describe("lerna packages", () => {
  const LERNA_FILENAME = "lerna.json";
  const WORKSPACE_FILENAME = "pnpm-workspace.yaml";

  test("declare every workspace glob pnpm does", () => {
    expect.hasAssertions();

    const { packages } = parseMachineJson<{ packages: string[] }>(
      readFileSync(resolve(REPOSITORY_ROOT, LERNA_FILENAME), "utf8"),
    );

    expect(packages).toStrictEqual(
      parseWorkspacePackageGlobs(readFileSync(resolve(REPOSITORY_ROOT, WORKSPACE_FILENAME), "utf8")),
    );
  });
});
