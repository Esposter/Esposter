import { REPOSITORY_ROOT, PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readTsdownPackagePaths } from "#src/workspace/readTsdownPackagePaths.test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

// A subpath arm is generated from the entries a package builds, so nothing else stops one outliving every consumer. A
// Subpath is read by the specifier a file would import it by, the package name and the subpath, with a glob's `*` cut
// Off so `./eslint/*` matches `@esposter/configuration/eslint/...`.
//
// A file reads a subpath only when its text names the specifier, so the text is searched for the specifier rather than
// Parsed. Docs and manifests are no consumer: a README that names an entry, or the manifest that declares it, is the
// Description the audit is checking, not a use of it.
const readConsumerTexts = (): string[] =>
  readSweepFilePaths("apps", "packages", "scripts")
    .filter((path) => /\.(?:[cm]?[jt]sx?|vue|ya?ml)$/.test(path) && !path.includes("/dist/"))
    .map((path) => readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"));
const readSubpathSpecifiers = (packagePath: string): string[] => {
  const manifest: { exports?: Record<string, unknown>; name: string } = JSON.parse(
    readFileSync(resolve(REPOSITORY_ROOT, packagePath, PACKAGE_JSON_FILENAME), "utf8"),
  );

  return Object.keys(manifest.exports ?? {})
    .filter((key) => key !== "." && key !== `./${PACKAGE_JSON_FILENAME}`)
    .map((key) => `${manifest.name}${key.slice(1)}`.replace(/\*.*$/, ""));
};

describe("subpathAudit", () => {
  test(
    "every subpath export of a package that builds is named by a source file",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      // Named rather than counted: the failure lists each subpath with no consumer. The fix is a consumer that names it,
      // or an `exports.exclude` in the package's `tsdown.config.ts` when a file loads it by path and needs no arm
      // (`.agents/skills/build/references/subpaths.md`).
      const consumerTexts = readConsumerTexts();
      const unconsumedSpecifiers = readTsdownPackagePaths().flatMap((packagePath) =>
        readSubpathSpecifiers(packagePath).filter(
          (specifier) => !consumerTexts.some((text) => text.includes(specifier)),
        ),
      );

      expect(unconsumedSpecifiers).toStrictEqual([]);
    },
  );
});
