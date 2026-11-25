import type { ResolvedConfig } from "vite";

import { autoImportDeclarationsPlugin } from "#src/services/autoImportDeclarationsPlugin";
import { TEST_FILENAME } from "#src/services/fixtureConstants.test";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(autoImportDeclarationsPlugin, () => {
  let root = "";

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), TEST_FILENAME));
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  // The root Vitest run loads a package's config as a project from the repository root, so the working directory is
  // Not the package's folder there, and only Vite's resolved root is
  test("the declarations are written to Vite's root, not the working directory", async () => {
    expect.hasAssertions();

    const { buildStart, configResolved } = autoImportDeclarationsPlugin(["vue"]);
    (configResolved as (config: ResolvedConfig) => void)({ root } as ResolvedConfig);
    await (buildStart as () => Promise<void>)();

    expect(existsSync(join(root, "auto-imports.d.ts"))).toBe(true);
  });
});
