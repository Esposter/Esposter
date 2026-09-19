import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A Pulumi stack file is tracked, and this repository is public, so an encrypted value written into one is
 * ciphertext published to everybody — betting the secret on one algorithm, one key and however long the repository
 * outlives them, for nothing: every secret this estate holds already lives in the `esposter-infra/prod` ESC
 * environment, which is where the stack reads them from (`apps/infra/docs/stacks.md`). `pulumi config set
 * --secret` is the one command that puts one here, and it is easy to reach for, so the tree is checked rather
 * than the habit trusted.
 */
describe("stackConfig", () => {
  // What `pulumi config set --secret` writes into a stack file
  const SECURE_VALUE_REGEX = /^\s*secure:/mu;

  test("no stack file carries an encrypted value", () => {
    expect.hasAssertions();

    const stackPaths = getSweepFilePaths("Pulumi.*.yaml", "**/Pulumi.*.yaml");

    expect(
      stackPaths.filter((path) => SECURE_VALUE_REGEX.test(readFileSync(join(REPOSITORY_ROOT, path), "utf8"))),
    ).toStrictEqual([]);
  });
});
