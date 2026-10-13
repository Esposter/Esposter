import { listRepositoryFiles } from "#src/services/files/listRepositoryFiles";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(listRepositoryFiles, () => {
  let cwd: string;

  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), "agent-console-list-"));
  });
  afterEach(() => {
    rmSync(cwd, { force: true, recursive: true });
  });

  test("walks the directory outside a repository, skipping node_modules", async () => {
    expect.hasAssertions();

    mkdirSync(join(cwd, "src"));
    mkdirSync(join(cwd, "node_modules"));
    writeFileSync(join(cwd, "src", "index.ts"), "");
    writeFileSync(join(cwd, "node_modules", "dependency.js"), "");

    await expect(listRepositoryFiles(cwd)).resolves.toStrictEqual(["src/index.ts"]);
  });
});
