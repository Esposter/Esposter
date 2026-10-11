import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

import { countModuleGraphLines } from "#src/services/dependencies/score/countModuleGraphLines";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(countModuleGraphLines, () => {
  const TEST_PREFIX = "score-";
  const TEST_FILENAME = "index.js";
  const CHILD_FILENAME = "a.js";
  const EXTENSIONLESS_FILENAME = "b.js";
  const MINIFIED_FILENAME = "c.min.js";
  const manifest: InstalledManifest = { exports: { ".": { import: `./${TEST_FILENAME}`, require: "./index.cjs" } } };
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), TEST_PREFIX));
    // The entry reaches its child by an explicit path, an extensionless one and a minified copy, while the declarations
    // And the CJS build beside it are never reached
    writeFileSync(
      join(directory, TEST_FILENAME),
      `import { a } from "./${CHILD_FILENAME}";\nimport "./b";\nimport "./${MINIFIED_FILENAME}";\n`,
    );
    writeFileSync(join(directory, CHILD_FILENAME), "export const a = 1;\n");
    writeFileSync(join(directory, EXTENSIONLESS_FILENAME), "export const b = 2;\n");
    writeFileSync(join(directory, MINIFIED_FILENAME), "export const c=3;\n");
    writeFileSync(join(directory, "index.d.ts"), "export declare const d: number;\n");
    writeFileSync(join(directory, "index.cjs"), 'require("./a.js");\n');
  });
  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("sums the non-blank lines of each module the entry reaches once, leaving out the minified copy", () => {
    expect.hasAssertions();

    expect(countModuleGraphLines(directory, manifest)).toBe(5);
  });
});
