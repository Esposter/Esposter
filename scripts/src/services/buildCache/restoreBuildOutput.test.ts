import { BUILD_OUTPUT_DIRECTORY } from "#src/services/buildCache/constants";
import { restoreBuildOutput } from "#src/services/buildCache/restoreBuildOutput";
import { storeBuildOutput } from "#src/services/buildCache/storeBuildOutput";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const BARREL_PATH = "src/index.ts";
const BARREL_CONTENT = "export * from './a';\n";
const DIST_CONTENT = "export {};\n";

describe(restoreBuildOutput, () => {
  let temporaryDirectory: string;
  const packageDirectory = () => join(temporaryDirectory, "package");
  const keyDirectory = () => join(temporaryDirectory, "cache", "key");

  beforeAll(() => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), "restore-build-output-"));
    mkdirSync(join(packageDirectory(), "src"), { recursive: true });
    mkdirSync(join(packageDirectory(), BUILD_OUTPUT_DIRECTORY), { recursive: true });
    writeFileSync(join(packageDirectory(), BARREL_PATH), BARREL_CONTENT);
    writeFileSync(join(packageDirectory(), BUILD_OUTPUT_DIRECTORY, "index.js"), DIST_CONTENT);
  });

  afterAll(() => {
    rmSync(temporaryDirectory, { force: true, recursive: true });
  });

  test("a hit leaves the same barrel and dist a build wrote", () => {
    expect.hasAssertions();

    storeBuildOutput(packageDirectory(), keyDirectory(), [BARREL_PATH]);
    rmSync(join(packageDirectory(), BARREL_PATH));
    rmSync(join(packageDirectory(), BUILD_OUTPUT_DIRECTORY), { force: true, recursive: true });

    restoreBuildOutput(packageDirectory(), keyDirectory());
    expect(readFileSync(join(packageDirectory(), BARREL_PATH), "utf8")).toBe(BARREL_CONTENT);
    expect(readFileSync(join(packageDirectory(), BUILD_OUTPUT_DIRECTORY, "index.js"), "utf8")).toBe(DIST_CONTENT);
  });
});
