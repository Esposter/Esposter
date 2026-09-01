import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The invariant `getTsdownConfiguration` leaves behind: declarations are emitted only where
 * `isolatedDeclarations` holds, so no build here takes the slow path. With it, rolldown-plugin-dts uses the oxc
 * transform and the emit is part of the bundle; without it, the plugin builds a whole TypeScript program instead,
 * which for a package of inferred types is minutes rather than milliseconds. Nothing fails when a package crosses
 * that line — the build still succeeds, the declarations are still correct, and only the clock knows.
 */
// eslint-disable-next-line no-restricted-syntax -- neither a manifest nor a tsconfig carries a date, so jsonDateParse would only cost a parse
const readJsonFile = (path: string): Record<string, unknown> => JSON.parse(readFileSync(path, "utf8"));

describe("declaration generation", () => {
  const packagesDirectory = resolve(import.meta.dirname, "../packages");
  // A package builds with tsdown exactly when it has a tsdown config, so the set is discovered rather than listed:
  // A listed set silently stops covering the package added after it was written, which is the only way this
  // Invariant can be broken. (`packages/app` is a Nuxt application, has no tsdown config, and emits nothing.)
  const PACKAGE_NAMES = readdirSync(packagesDirectory).filter((packageName) =>
    existsSync(resolve(packagesDirectory, packageName, "tsdown.config.ts")),
  );
  // The one package the invariant cannot cover: an SFC's types cannot be written out by hand, so its declarations
  // Go through vue-tsc by way of `dts.vue` whatever `isolatedDeclarations` says. Any other package joining it is
  // The regression this test exists to show.
  const VUE_TSC_PACKAGE_NAME = "vue-phaserjs";
  // A private package emits nothing: everything that types against a workspace package resolves the source
  // Condition and reads its TypeScript, so its declarations would have no reader. The factory derives it from
  // `private` rather than an opt-in, which is why nothing here reads a per-package dts setting.
  const readEmitsDeclarations = (packageDirectory: string): boolean =>
    readJsonFile(resolve(packageDirectory, "package.json")).private !== true;
  // `extends` resolves relative to the file that declares it and may be a list, later entries winning, so the chain
  // Is walked to its root and merged back down — the same order TypeScript itself applies.
  const readIsolatedDeclarations = (tsconfigPath: string): boolean => {
    const tsconfig = readJsonFile(tsconfigPath);
    const extended = tsconfig.extends;
    const extendedPaths = Array.isArray(extended) ? extended : typeof extended === "string" ? [extended] : [];
    const inherited = extendedPaths.reduce(
      (isolatedDeclarations, extendedPath) =>
        readIsolatedDeclarations(resolve(dirname(tsconfigPath), String(extendedPath))) || isolatedDeclarations,
      false,
    );
    const { isolatedDeclarations } = (tsconfig.compilerOptions ?? {}) as { isolatedDeclarations?: boolean };
    return isolatedDeclarations ?? inherited;
  };

  test("emits declarations only where the isolated transform can produce them", () => {
    expect.hasAssertions();
    // Named rather than counted: a package that starts emitting declarations without `isolatedDeclarations` names
    // Itself in the failure. An empty discovery cannot pass this either, since the exception must be present.
    const slowPathPackageNames = PACKAGE_NAMES.filter((packageName) => {
      const packageDirectory = resolve(packagesDirectory, packageName);
      return (
        readEmitsDeclarations(packageDirectory) && !readIsolatedDeclarations(resolve(packageDirectory, "tsconfig.json"))
      );
    });

    expect(slowPathPackageNames).toStrictEqual([VUE_TSC_PACKAGE_NAME]);
  });
});
