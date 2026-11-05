import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { getImportedPackageName } from "#src/services/dependencies/score/getImportedPackageName";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getChildren } from "#src/services/shared/getChildren";
import { parseSourceUnlinked } from "#src/services/shared/parseSourceUnlinked";
import { readVueSegments } from "#src/services/shared/readVueSegments";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const getLoadablePackageName = (specifier: string): string | undefined =>
  /^(?:\.|#|node:)/u.test(specifier) ? undefined : getImportedPackageName(specifier);

/**
 * A private package is built into one artifact, so its `dependencies` are the names its code loads and its
 * `devDependencies` are the names only its types, tests and tooling reach. A name its non-test sources import only as
 * types is erased by the build and belongs in `devDependencies`. A published package is the other case: a type in its
 * signature is one its consumers resolve, so it keeps the name in `dependencies`.
 */
describe("typeOnlyDependencies", () => {
  const SOURCE_PATH_REGEX = /\.(?:[cm]?[jt]s|vue)$/u;
  const NON_SOURCE_PATH_REGEX = /\.(?:bench|test-d|test|typebench)\.ts$|\.d\.[cm]?ts$|\/(?:fixtures|tests?)\//u;
  // Only a source that writes `import(` can hold a dynamic import or an import type, and either sits anywhere in its tree
  const IMPORT_CALL_REGEX = /\bimport\s*\(/u;

  // Records, per package name, whether the source loads it as a value (a static import, a re-export or a dynamic
  // `import()`) or only names its types
  const collectUsage = (node: SyntaxNode, valueNames: Set<string>, typeNames: Set<string>): void => {
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

  test("list a name only its types are imported from in devDependencies", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    const packages = readWorkspacePackages(REPOSITORY_ROOT)
      .filter(({ manifest }) => manifest.private && manifest.dependencies)
      .map(({ directory, manifest, workspaceDirectory }) => ({
        manifest,
        packagePath: workspaceDirectory ? `${workspaceDirectory}/${directory}` : directory,
      }));
    // One listing for every package: git walks its index once, where a spawn for each package pays the process start again
    const sourcePaths = readSweepFilePaths(...packages.map(({ packagePath }) => packagePath)).filter(
      (path) => SOURCE_PATH_REGEX.test(path) && !NON_SOURCE_PATH_REGEX.test(path),
    );
    const misplaced = packages.flatMap(({ manifest, packagePath }) => {
      const valueNames = new Set<string>();
      const typeNames = new Set<string>();
      for (const path of sourcePaths.filter((sourcePath) => sourcePath.startsWith(`${packagePath}/`))) {
        const text = readFileSync(join(REPOSITORY_ROOT, path), "utf8");
        const scripts = path.endsWith(".vue")
          ? readVueSegments(text)
              .filter(({ isScript }) => isScript)
              .map(({ text: script }) => script)
          : [text];
        for (const script of scripts) collectScriptUsage(script, valueNames, typeNames);
      }
      return Object.keys(manifest.dependencies ?? {})
        .filter((name) => typeNames.has(name) && !valueNames.has(name))
        .map((name) => `${manifest.name} -> ${name}`);
    });

    expect(misplaced).toStrictEqual([]);
  });
});
