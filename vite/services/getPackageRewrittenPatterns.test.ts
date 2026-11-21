import { getPackageRewrittenPatterns } from "#vite/services/getPackageRewrittenPatterns";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, test } from "vitest";

describe(getPackageRewrittenPatterns, () => {
  const fixturesRoot = mkdtempSync(join(tmpdir(), "rewritten-patterns-"));

  afterAll(() => {
    rmSync(fixturesRoot, { force: true, recursive: true });
  });

  // A package that writes its own entry un-ignores it in its `.gitignore`, and nothing rewrites that file, so it stays an
  // Input: an edit to it has to invalidate the build, or the cache replays the `dist` built from the old entry
  test("keeps a hand-written entry among the build's inputs", () => {
    expect.hasAssertions();

    const packageRoot = join(fixturesRoot, "hand-written-entry-package");
    mkdirSync(packageRoot);
    writeFileSync(join(packageRoot, ".gitignore"), "!/src/index.ts\n");

    expect(getPackageRewrittenPatterns(packageRoot)).not.toContain("src/index.ts");
  });

  // A package whose build writes its entry rewrites that barrel, so the barrel is left out of the inputs: a task that reads
  // A file it also rewrites is one `vp` refuses to cache
  test("leaves a generated entry out of the build's inputs", () => {
    expect.hasAssertions();

    const packageRoot = join(fixturesRoot, "generated-entry-package");
    mkdirSync(packageRoot);

    expect(getPackageRewrittenPatterns(packageRoot)).toContain("src/index.ts");
  });
});
