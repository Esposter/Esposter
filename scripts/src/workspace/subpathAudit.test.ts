import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readJsonFile } from "#src/workspace/readJsonFile.test";
import { readTsdownPackagePaths } from "#src/workspace/readTsdownPackagePaths.test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

// A private package's subpath arm is generated from the entries it builds, so nothing else stops one outliving every
// Consumer, and every consumer of a private package is in the repo, so a file here must name it. A published package's
// Arms are the surface outside consumers import, which no file in the repo names, so only a private package is audited.
// A subpath is read by the specifier a file would import it by, the package name and the subpath, with a glob's `*`
// Cut off so `./eslint/*` matches `@esposter/configuration/eslint/...`.
//
// A file reads a subpath only when its text names the specifier, so the text is searched for the specifier rather than
// Parsed. Docs and manifests are no consumer: a README that names an entry, or the manifest that declares it, is the
// Description the audit is checking, not a use of it.
const readConsumerTexts = (): string[] =>
  readSweepFilePaths("apps", "packages", "scripts")
    .filter((path) => /\.(?:[cm]?[jt]sx?|vue|ya?ml)$/u.test(path) && !path.includes("/dist/"))
    .map((path) => readFileSync(resolve(REPOSITORY_ROOT, path), "utf8"));
const readManifest = (packagePath: string) =>
  readJsonFile(resolve(REPOSITORY_ROOT, packagePath, PACKAGE_JSON_FILENAME)) as {
    exports?: Record<string, unknown>;
    name: string;
    private?: boolean;
  };
const readSubpathSpecifiers = (packagePath: string): string[] => {
  const manifest = readManifest(packagePath);

  return Object.keys(manifest.exports ?? {})
    .filter((key) => key !== "." && key !== `./${PACKAGE_JSON_FILENAME}`)
    .map((key) => `${manifest.name}${key.slice(1)}`.replace(/\*.*$/u, ""));
};

describe("subpathAudit", () => {
  test(
    "every subpath export of a private package that builds is named by a source file",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      // Named rather than counted: the failure lists each subpath with no consumer. The fix: a consumer that names it.
      // Or an `exports.exclude` in the package's `tsdown.config.ts`, when a file loads it by path and needs no arm
      // (`.agents/skills/build/references/subpaths.md`).
      const consumerTexts = readConsumerTexts();
      const unconsumedSpecifiers = readTsdownPackagePaths()
        .filter((packagePath) => readManifest(packagePath).private === true)
        .flatMap((packagePath) =>
          readSubpathSpecifiers(packagePath).filter(
            (specifier) => !consumerTexts.some((text) => text.includes(specifier)),
          ),
        );

      expect(unconsumedSpecifiers).toStrictEqual([]);
    },
  );
});
