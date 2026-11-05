import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getChildren } from "#src/services/shared/getChildren";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { parseSource } from "#src/services/shared/parseSource";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { runGit } from "#src/services/shared/runGit";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A private package is built into one artifact, so its `dependencies` are the names its code loads and its
 * `devDependencies` are the names only its types, tests and tooling reach. A name its non-test sources import only as
 * types is erased by the build and belongs in `devDependencies`. A published package is the other case: a type in its
 * signature is one its consumers resolve, so it keeps the name in `dependencies`.
 */
describe("typeOnlyDependencies", () => {
  const SOURCE_PATH_REGEX = /\.(?:mts|ts|vue)$/u;
  const NON_SOURCE_PATH_REGEX = /\.(?:bench|test-d|test|typebench)\.ts$|\.d\.ts$|\/(?:fixtures|tests?)\//u;
  const SCRIPT_BLOCK_REGEX = /<script\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/script>/gu;

  const getPackageName = (specifier: string): string | undefined => {
    if (/^(?:\.|#|node:)/u.test(specifier)) return undefined;
    const [scopeOrName = "", name = ""] = specifier.split("/");
    return scopeOrName.startsWith("@") ? `${scopeOrName}/${name}` : scopeOrName;
  };

  // Records, per package name, whether the source loads it as a value (a static import, a re-export or a dynamic
  // `import()`) or only names its types
  const collectUsage = (node: SyntaxNode, valueNames: Set<string>, typeNames: Set<string>): void => {
    const note = (specifier: unknown, isType: boolean) => {
      const name = typeof specifier === "string" ? getPackageName(specifier) : undefined;
      if (name) (isType ? typeNames : valueNames).add(name);
    };
    if (node.type === "ImportDeclaration")
      note(
        node.source.value,
        node.importKind === "type" ||
          (node.specifiers.length > 0 &&
            node.specifiers.every(
              (specifier) => specifier.type === "ImportSpecifier" && specifier.importKind === "type",
            )),
      );
    else if ((node.type === "ExportAllDeclaration" || node.type === "ExportNamedDeclaration") && node.source)
      note(node.source.value, node.exportKind === "type");
    else if (node.type === "ImportExpression" && node.source.type === "Literal") note(node.source.value, false);
    else if (node.type === "TSImportType") note(node.source.value, true);
    for (const child of getChildren(node)) collectUsage(child, valueNames, typeNames);
  };

  test("list a name only its types are imported from in devDependencies", () => {
    expect.hasAssertions();

    const misplaced = readWorkspacePackages(REPOSITORY_ROOT)
      .filter(({ manifest }) => manifest.private && manifest.dependencies)
      .flatMap(({ directory, manifest, workspaceDirectory }) => {
        const packagePath = workspaceDirectory ? `${workspaceDirectory}/${directory}` : directory;
        const valueNames = new Set<string>();
        const typeNames = new Set<string>();
        const sourcePaths = getNonEmptyLines(
          runGit(["ls-files", "--cached", "--others", "--exclude-standard", "--", packagePath]),
        ).filter(
          (path) =>
            SOURCE_PATH_REGEX.test(path) &&
            !NON_SOURCE_PATH_REGEX.test(path) &&
            existsSync(join(REPOSITORY_ROOT, path)),
        );
        for (const path of sourcePaths) {
          const text = readFileSync(join(REPOSITORY_ROOT, path), "utf8");
          const scripts = path.endsWith(".vue")
            ? [...text.matchAll(SCRIPT_BLOCK_REGEX)].map(([, script = ""]) => script)
            : [text];
          for (const script of scripts) collectUsage(parseSource(script), valueNames, typeNames);
        }
        return Object.keys(manifest.dependencies ?? {})
          .filter((name) => typeNames.has(name) && !valueNames.has(name))
          .map((name) => `${manifest.name} -> ${name}`);
      });

    expect(misplaced).toStrictEqual([]);
  });
});
