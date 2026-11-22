import { TEST_FILENAME } from "#src/services/fixtureConstants.test";
import { readPackageManifest } from "#src/services/readPackageManifest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readPackageManifest, () => {
  let packageDirectory: string;

  beforeEach(() => {
    packageDirectory = mkdtempSync(join(tmpdir(), TEST_FILENAME));
  });

  afterEach(() => {
    rmSync(packageDirectory, { force: true, recursive: true });
  });

  test("fails the read of a manifest whose field is not the type the build reads", () => {
    expect.hasAssertions();

    writeFileSync(join(packageDirectory, "package.json"), JSON.stringify({ name: 0 }));

    expect(() => readPackageManifest(packageDirectory)).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [
            "name"
          ],
          "message": "Invalid input: expected string, received number"
        }
      ]]
    `);
  });
});
