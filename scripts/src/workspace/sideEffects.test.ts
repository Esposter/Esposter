import { WORKSPACE_DIRECTORIES } from "#scripts/services/constants";
import { parseMachineJson } from "#scripts/services/parseMachineJson";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * What a package declares about its own side effects is the one build input no factory can derive: deciding it
 * statically is undecidable in general, and packages here genuinely have them. Leaving the field off is not the
 * safe middle either — absent means *unknown*, so every consumer's bundler keeps everything, which is the same
 * outcome as declaring `true` while reading as nobody having considered the question.
 */
const readJsonFile = (path: string) => parseMachineJson<Record<string, unknown>>(readFileSync(path, "utf8"));
// The field is only the three shapes a bundler acts on. Anything else — `null`, a bare path string, an array
// Holding something other than globs — is read by every bundler as no declaration at all, so a package carrying
// One has not answered the question however deliberate the value looks in the manifest.
const checkIsSideEffectsDeclaration = (sideEffects: unknown): boolean =>
  typeof sideEffects === "boolean" ||
  (Array.isArray(sideEffects) && sideEffects.every((entry) => typeof entry === "string"));

describe("side effects", () => {
  const repositoryRoot = resolve(import.meta.dirname, "../../..");
  // Discovered rather than listed, for the same reason the declaration-generation invariant discovers its set: a
  // Listed one stops covering the package added after it was written, which is the only way this can be broken.
  // Both workspace roots, because two of the members that build sit under `apps`. (`apps/web` is a Nuxt
  // Application, has no tsdown config, and nothing resolves into it.)
  const PACKAGE_PATHS = WORKSPACE_DIRECTORIES.flatMap((workspaceDirectory) =>
    readdirSync(resolve(repositoryRoot, workspaceDirectory)).map(
      (packageName) => `${workspaceDirectory}/${packageName}`,
    ),
  ).filter((packagePath) => existsSync(resolve(repositoryRoot, packagePath, "tsdown.config.ts")));
  // The Functions app registers each handler with a bare `app.eventGrid(...)` call in a module whose only export
  // Is `export default {}`, which the barrel does not re-export. Told it has no side effects, rolldown drops
  // Every registration and the deployed app reports Running while running no trigger — so it is the one package
  // Whose whole self is a side effect. A package with one such module names that module instead, which is what
  // Keeps a blanket `true` from being the easy answer for a package that is mostly tree-shakeable.
  const SIDE_EFFECTING_PACKAGE_PATH = "apps/functions";
  const readSideEffects = (packagePath: string): unknown =>
    readJsonFile(resolve(repositoryRoot, packagePath, "package.json")).sideEffects;

  test("are declared by every package a bundler resolves", () => {
    expect.hasAssertions();
    // Named rather than counted: the package that never answered the question names itself in the failure.
    const undeclaredPackagePaths = PACKAGE_PATHS.filter(
      (packagePath) => !checkIsSideEffectsDeclaration(readSideEffects(packagePath)),
    );

    expect(undeclaredPackagePaths).toStrictEqual([]);
  });

  test("are claimed wholesale only by the package whose entry exists to run", () => {
    expect.hasAssertions();
    const wholesalePackagePaths = PACKAGE_PATHS.filter((packagePath) => readSideEffects(packagePath) === true);

    expect(wholesalePackagePaths).toStrictEqual([SIDE_EFFECTING_PACKAGE_PATH]);
  });
});
