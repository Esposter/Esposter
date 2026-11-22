import type { PackageManifest } from "@esposter/configuration";
import type { Node } from "oxc-parser";

import { getImportedPackageName } from "#src/services/dependencies/score/getImportedPackageName";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getChildren } from "#src/services/shared/getChildren";
import { parseSourceUnlinked } from "#src/services/shared/parseSourceUnlinked";
import { readVueSegments } from "#src/services/shared/readVueSegments";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { NON_SOURCE_SUFFIXES } from "@esposter/configuration/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const getLoadablePackageName = (specifier: string): string | undefined =>
  /^(?:\.|#|node:)/u.test(specifier) ? undefined : getImportedPackageName(specifier);

// The script text of a source file, a `.vue` file reduced to its script blocks
const readScripts = (path: string): string[] => {
  const text = readFileSync(join(REPOSITORY_ROOT, path), "utf8");
  return path.endsWith(".vue")
    ? readVueSegments(text)
        .filter(({ isScript }) => isScript)
        .map(({ text: script }) => script)
    : [text];
};

// The workspace packages the filter keeps, each with the directory its sources sit under
const readPackages = (checkIsKept: (manifest: PackageManifest) => boolean) =>
  readWorkspacePackages(REPOSITORY_ROOT)
    .filter(({ manifest }) => checkIsKept(manifest))
    .map(({ directory, manifest, workspaceDirectory }) => ({
      manifest,
      packagePath: workspaceDirectory ? `${workspaceDirectory}/${directory}` : directory,
    }));

/**
 * A private package is built into one artifact, so its `dependencies` are the names its code loads and its
 * `devDependencies` are the names only its types, tests and tooling reach. A name its non-test sources import only as
 * types is erased by the build and belongs in `devDependencies`. A published package is the other case: a type in its
 * signature is one its consumers resolve, so it keeps the name in `dependencies`, and a module its declarations augment
 * is one its consumers resolve the same way.
 */
describe("typeOnlyDependencies", () => {
  const SOURCE_PATH_REGEX = /\.(?:[cm]?[jt]s|vue)$/u;
  const TEST_PATH_REGEX = new RegExp(
    `(?:${NON_SOURCE_SUFFIXES.map((suffix) => RegExp.escape(suffix)).join("|")})$|/(?:fixtures|tests?)/`,
    "u",
  );
  const DECLARATION_PATH_REGEX = /\.d\.[cm]?ts$/u;
  // Only a source that writes `import(` can hold a dynamic import or an import type, and either sits anywhere in its tree
  const IMPORT_CALL_REGEX = /\bimport\s*\(/u;
  const DECLARE_MODULE_REGEX = /\bdeclare\s+module\b/u;
  // A name a bundler resolves rather than a package a consumer installs: a virtual module or a wildcard
  const BUNDLER_RESOLVED_REGEX = /[*:]/u;
  // The Claude Code host hands its module to every plugin, so no package of a plugin's holds it
  const HOST_MODULE_NAME = "claude-code";

  const isSourcePath = (path: string) => SOURCE_PATH_REGEX.test(path) && !TEST_PATH_REGEX.test(path);

  // Records, per package name, whether the source loads it as a value (a static import, a re-export or a dynamic
  // `import()`) or only names its types
  const collectUsage = (node: Node, valueNames: Set<string>, typeNames: Set<string>): void => {
    const note = (specifier: unknown, isType: boolean) => {
      const name = typeof specifier === "string" ? getLoadablePackageName(specifier) : undefined;
      if (name) (isType ? typeNames : valueNames).add(name);
    };
    if (node.type === "ImportDeclaration") note(node.source.value, node.importKind === "type");
    else if ((node.type === "ExportAllDeclaration" || node.type === "ExportNamedDeclaration") && node.source)
      note(node.source.value, node.exportKind === "type");
    else if (node.type === "ImportExpression" && node.source.type === "Literal") note(node.source.value, false);
    else if (node.type === "TSImportType") note(node.source.value, true);
    for (const child of getChildren(node)) collectUsage(child, valueNames, typeNames);
  };

  // A static import or re-export stands among a program's statements, or in a `declare module` block among them, so a
  // Source that writes no `import(` is read from those statements and never walked whole
  const collectScriptUsage = (script: string, valueNames: Set<string>, typeNames: Set<string>): void => {
    const program = parseSourceUnlinked(script);
    if (IMPORT_CALL_REGEX.test(script)) collectUsage(program, valueNames, typeNames);
    else
      for (const statement of program.body)
        if (
          statement.type === "ImportDeclaration" ||
          statement.type === "ExportAllDeclaration" ||
          (statement.type === "ExportNamedDeclaration" && statement.source) ||
          statement.type === "TSModuleDeclaration"
        )
          collectUsage(statement, valueNames, typeNames);
  };

  const getAugmentedPackageName = (id: string): string | undefined => {
    if (BUNDLER_RESOLVED_REGEX.test(id)) return undefined;
    const name = getLoadablePackageName(id);
    return name === HOST_MODULE_NAME ? undefined : name;
  };

  // The packages a script's top-level `declare module "name"` blocks name, each augmenting or declaring a module
  const collectAugmentedNames = (script: string, names: Set<string>): void => {
    if (!DECLARE_MODULE_REGEX.test(script)) return;
    for (const statement of parseSourceUnlinked(script).body) {
      if (statement.type !== "TSModuleDeclaration" || statement.id.type !== "Literal") continue;
      const name = getAugmentedPackageName(statement.id.value);
      if (name) names.add(name);
    }
  };

  test("list a name only its types are imported from in devDependencies", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    const packages = readPackages((manifest) => manifest.private === true && manifest.dependencies !== undefined);
    // One listing for every package: git walks its index once, where a spawn for each package pays the process start again
    const sourcePaths = readSweepFilePaths(...packages.map(({ packagePath }) => packagePath)).filter(
      (path) => isSourcePath(path) && !DECLARATION_PATH_REGEX.test(path),
    );
    const misplaced = packages.flatMap(({ manifest, packagePath }) => {
      const valueNames = new Set<string>();
      const typeNames = new Set<string>();
      for (const path of sourcePaths.filter((sourcePath) => sourcePath.startsWith(`${packagePath}/`)))
        for (const script of readScripts(path)) collectScriptUsage(script, valueNames, typeNames);
      return Object.keys(manifest.dependencies ?? {})
        .filter((name) => typeNames.has(name) && !valueNames.has(name))
        .map((name) => `${manifest.name} -> ${name}`);
    });

    expect(misplaced).toStrictEqual([]);
  });

  test(
    "list a module a published package augments that neither its dependencies nor its peers hold",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      const packages = readPackages((manifest) => manifest.private !== true);
      const sourcePaths = readSweepFilePaths(...packages.map(({ packagePath }) => packagePath)).filter((path) =>
        isSourcePath(path),
      );
      const unheld = packages.flatMap(({ manifest, packagePath }) => {
        const augmentedNames = new Set<string>();
        for (const path of sourcePaths.filter((sourcePath) => sourcePath.startsWith(`${packagePath}/`)))
          for (const script of readScripts(path)) collectAugmentedNames(script, augmentedNames);
        // A peer is installed by the consumer beside the package, so a name either list holds is one a consumer resolves
        const held = new Set([
          ...Object.keys(manifest.dependencies ?? {}),
          ...Object.keys(manifest.peerDependencies ?? {}),
        ]);
        return [...augmentedNames].filter((name) => !held.has(name)).map((name) => `${manifest.name} -> ${name}`);
      });

      expect(unheld).toStrictEqual([]);
    },
  );
});
