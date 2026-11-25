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
import { readTsdownPackagePaths } from "#src/workspace/packages/readTsdownPackagePaths.test";
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

// The names a package's two lists hold, which a consumer resolves: a peer is installed beside the package by the
// Consumer
const readHeldNames = (manifest: PackageManifest) =>
  new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})]);

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
  // Only a source that writes `import(` can hold a dynamic import or an import type, and either sits anywhere in its
  // Tree
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

  // The source files of each package's directory, declarations left out
  const readSourcePaths = (packages: { packagePath: string }[]) =>
    readSweepFilePaths(...packages.map(({ packagePath }) => packagePath)).filter(
      (path) => isSourcePath(path) && !DECLARATION_PATH_REGEX.test(path),
    );

  // The names the sources under `directory` load, as values and as types alone
  const collectPackageUsage = (directory: string, sourcePaths: readonly string[]) => {
    const valueNames = new Set<string>();
    const typeNames = new Set<string>();
    for (const path of sourcePaths.filter((sourcePath) => sourcePath.startsWith(`${directory}/`)))
      for (const script of readScripts(path)) collectScriptUsage(script, valueNames, typeNames);
    return { typeNames, valueNames };
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
    // One listing for every package: git walks its index once, where a spawn for each package pays the process start
    // Again
    const sourcePaths = readSourcePaths(packages);
    const misplaced = packages.flatMap(({ manifest, packagePath }) => {
      const { typeNames, valueNames } = collectPackageUsage(packagePath, sourcePaths);
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
        const held = readHeldNames(manifest);
        return [...augmentedNames].filter((name) => !held.has(name)).map((name) => `${manifest.name} -> ${name}`);
      });

      expect(unheld).toStrictEqual([]);
    },
  );

  // A workspace sibling a built package loads is kept external by its runtime fields alone: tsdown bundles
  // A devDependency its source imports, which copies the sibling's modules into this package's `dist`. A published
  // Package's declarations name the types it imports, so its consumers resolve those names as well
  test(
    "list each workspace sibling a built package loads in dependencies or peerDependencies",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      const builtPackagePaths = new Set(readTsdownPackagePaths());
      const siblingNames = new Set(readWorkspacePackages(REPOSITORY_ROOT).map(({ manifest }) => manifest.name));
      const packages = readPackages(() => true).filter(({ packagePath }) => builtPackagePaths.has(packagePath));
      const sourcePaths = readSourcePaths(packages);
      const unexternal = packages.flatMap(({ manifest, packagePath }) => {
        const { typeNames, valueNames } = collectPackageUsage(`${packagePath}/src`, sourcePaths);
        const loadedNames = manifest.private === true ? valueNames : new Set([...valueNames, ...typeNames]);
        const externalNames = readHeldNames(manifest);
        return [...loadedNames]
          .filter((name) => siblingNames.has(name) && !externalNames.has(name))
          .map((name) => `${manifest.name} -> ${name}`);
      });

      expect(unexternal).toStrictEqual([]);
    },
  );

  // A published package's declarations name the types its signatures take, and a consumer resolves those names from the
  // Package's own lists. A type a devDependency supplies is named there with nothing installed beside it to resolve it
  test(
    "list a name a published package's types import only from devDependencies in dependencies",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      const packages = readPackages((manifest) => manifest.private !== true);
      const sourcePaths = readSourcePaths(packages);
      const misplaced = packages.flatMap(({ manifest, packagePath }) => {
        const { typeNames, valueNames } = collectPackageUsage(`${packagePath}/src`, sourcePaths);
        const heldNames = readHeldNames(manifest);
        return Object.keys(manifest.devDependencies ?? {})
          .filter((name) => typeNames.has(name) && !valueNames.has(name) && !heldNames.has(name))
          .map((name) => `${manifest.name} -> ${name}`);
      });

      expect(misplaced).toStrictEqual([]);
    },
  );
});
