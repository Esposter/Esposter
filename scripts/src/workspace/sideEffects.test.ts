import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readJsonFile } from "#src/workspace/readJsonFile.test";
import { readTsdownPackagePaths } from "#src/workspace/readTsdownPackagePaths.test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * What a package declares about its own side effects is the one build input no factory can derive: deciding it
 * statically is undecidable in general, and packages here genuinely have them. Leaving the field off is not the
 * safe middle either — absent means *unknown*, so every consumer's bundler keeps everything, which is the same
 * outcome as declaring `true` while reading as nobody having considered the question.
 */
// The field is only the three shapes a bundler acts on. Anything else — `null`, a bare path string, an array
// Holding something other than globs — is read by every bundler as no declaration at all, so a package carrying
// One has not answered the question however deliberate the value looks in the manifest.
const checkIsSideEffectsDeclaration = (sideEffects: unknown): boolean =>
  typeof sideEffects === "boolean" ||
  (Array.isArray(sideEffects) && sideEffects.every((entry) => typeof entry === "string"));
const readSideEffects = (packagePath: string): unknown =>
  readJsonFile(resolve(REPOSITORY_ROOT, packagePath, PACKAGE_JSON_FILENAME)).sideEffects;

describe("sideEffects", () => {
  const PACKAGE_PATHS = readTsdownPackagePaths();
  const STYLESHEET_GLOB = "**/*.css";

  test("are declared by every package a bundler resolves", () => {
    expect.hasAssertions();

    // Named rather than counted: the package that never answered the question names itself in the failure.
    const undeclaredPackagePaths = PACKAGE_PATHS.filter(
      (packagePath) => !checkIsSideEffectsDeclaration(readSideEffects(packagePath)),
    );

    expect(undeclaredPackagePaths).toStrictEqual([]);
  });

  // A component's stylesheet is imported by its own module for no binding, so a package answering `false` has every
  // Stylesheet dropped by a consumer's bundler and ships components that render unstyled, with nothing failing
  test("keep the stylesheets of a package whose components carry styles", () => {
    expect.hasAssertions();

    const droppedStylesheetPackagePaths = PACKAGE_PATHS.filter((packagePath) => {
      const sideEffects = readSideEffects(packagePath);
      if (Array.isArray(sideEffects) && sideEffects.includes(STYLESHEET_GLOB)) return false;

      const sourceDirectory = resolve(REPOSITORY_ROOT, packagePath, "src");
      return (
        existsSync(sourceDirectory) &&
        readdirSync(sourceDirectory, { recursive: true }).some(
          (file) =>
            typeof file === "string" &&
            file.endsWith(".vue") &&
            readFileSync(resolve(sourceDirectory, file), "utf8").includes("<style"),
        )
      );
    });

    expect(droppedStylesheetPackagePaths).toStrictEqual([]);
  });
});
