import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * What a package declares about its own side effects is the one build input no factory can derive: deciding it
 * statically is undecidable in general, and packages here genuinely have them. Leaving the field off is not the
 * safe middle either — absent means *unknown*, so every consumer's bundler keeps everything, which is the same
 * outcome as declaring `true` while reading as nobody having considered the question.
 */
// eslint-disable-next-line no-restricted-syntax -- a package manifest carries no dates, and this suite has no bundler to make jsonDateParse worth an import
const readJsonFile = (path: string): Record<string, unknown> => JSON.parse(readFileSync(path, "utf8"));

describe("side effects", () => {
  const packagesDirectory = resolve(import.meta.dirname, "../packages");
  // Discovered rather than listed, for the same reason the declaration-generation invariant discovers its set: a
  // Listed one stops covering the package added after it was written, which is the only way this can be broken.
  // (`packages/app` is a Nuxt application, has no tsdown config, and nothing resolves into it.)
  const PACKAGE_NAMES = readdirSync(packagesDirectory).filter((packageName) =>
    existsSync(resolve(packagesDirectory, packageName, "tsdown.config.ts")),
  );
  // The Functions app registers each handler with a bare `app.eventGrid(...)` call in a module whose only export
  // Is `export default {}`, which the barrel does not re-export. Told it has no side effects, rolldown drops
  // Every registration and the deployed app reports Running while running no trigger — so it is the one package
  // Whose whole self is a side effect. A package with one such module names that module instead, which is what
  // Keeps a blanket `true` from being the easy answer for a package that is mostly tree-shakeable.
  const SIDE_EFFECTING_PACKAGE_NAME = "azure-functions";
  const readSideEffects = (packageName: string): unknown =>
    readJsonFile(resolve(packagesDirectory, packageName, "package.json")).sideEffects;

  test("are declared by every package a bundler resolves", () => {
    expect.hasAssertions();
    // Named rather than counted: the package that never answered the question names itself in the failure.
    const undeclaredPackageNames = PACKAGE_NAMES.filter((packageName) => readSideEffects(packageName) === undefined);

    expect(undeclaredPackageNames).toStrictEqual([]);
  });

  test("are claimed wholesale only by the package whose entry exists to run", () => {
    expect.hasAssertions();
    const wholesalePackageNames = PACKAGE_NAMES.filter((packageName) => readSideEffects(packageName) === true);

    expect(wholesalePackageNames).toStrictEqual([SIDE_EFFECTING_PACKAGE_NAME]);
  });
});
