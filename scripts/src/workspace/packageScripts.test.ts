import { PACKAGE_JSON_FILENAME, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { readJsonFile } from "#src/workspace/readJsonFile.test";
import { getResult } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join, relative } from "node:path";
import { parseSync } from "oxc-parser";
import { describe, expect, test } from "vitest";

describe("packageScripts", () => {
  // The commands pnpm owns: a script sharing one of these names is the one place `run` changes what executes, since
  // Bare it would run pnpm's command instead. The list is pnpm's vocabulary rather than the repo's
  const PNPM_COMMANDS = new Set([
    "add",
    "audit",
    "bin",
    "config",
    "dedupe",
    "deploy",
    "dlx",
    "exec",
    "fetch",
    "import",
    "init",
    "install",
    "link",
    "list",
    "outdated",
    "pack",
    "patch",
    "prune",
    "publish",
    "rebuild",
    "remove",
    "root",
    "setup",
    "store",
    "unlink",
    "update",
    "why",
  ]);
  // A `pnpm` call reaching `run` through any flags (`-C dir`, `--filter pkg`, `-r`), and the script it names
  const PNPM_RUN_REGEX =
    /\bpnpm(?:\s+(?:-C|--dir|--filter|-F)\s+[^\s-]\S*|\s+-[-\w=]+)*\s+run\s+(?<script>[^\s&;|]+)/gu;
  const RECURSIVE_FLAG_REGEX = /\s(?:-r|--recursive)\s/u;
  // Every manifest's scripts, the root's included, each named by its manifest so a failure says where it is
  const scripts = ["", ...readWorkspacePackageDirectories(REPOSITORY_ROOT)].flatMap((packagePath) => {
    const manifestPath = join(packagePath, PACKAGE_JSON_FILENAME).replaceAll("\\", "/");
    const { scripts: manifestScripts = {} } = readJsonFile(join(REPOSITORY_ROOT, manifestPath)) as {
      scripts?: Record<string, string>;
    };
    const scriptNames = new Set(Object.keys(manifestScripts));
    return Object.entries(manifestScripts).map(([name, body]) => ({ body, manifestPath, name, scriptNames }));
  });

  // A recursive call naming a script its own manifest lacks keeps `run` too: knip reads the bare form as an unlisted binary
  test("invoke a script bare, never through `run`", () => {
    expect.hasAssertions();

    const runInvocations = scripts.flatMap(({ body, manifestPath, name, scriptNames }) =>
      [...body.matchAll(PNPM_RUN_REGEX)]
        .filter(
          ([invocation, script = ""]) =>
            !PNPM_COMMANDS.has(script) && (!RECURSIVE_FLAG_REGEX.test(invocation) || scriptNames.has(script)),
        )
        .map(([, script = ""]) => `${manifestPath} ${name}: pnpm run ${script}`),
    );

    expect(runInvocations).toStrictEqual([]);
  });

  // Node strips types and resolves only what a package's `imports` map and a relative path with its extension name, so a
  // Script run as `node <entry>.ts` dies at startup on the first module it cannot strip or find — a failure no typecheck
  // Or lint reports, found only by running the command. Node's own stripper is the judge, over every module the entry
  // Reaches through its package's `imports` or a relative path, and a specifier that resolves to no file fails too
  test("run under `node` only an entry whose whole import graph node can resolve and strip", () => {
    expect.hasAssertions();

    const NODE_ENTRY_REGEX = /\bnode\s+(?<entry>\S+\.ts)\b/gu;
    const STRING_LITERAL_REGEX = /^["'](?<value>[^"']*)["']$/u;
    // The module requests a source makes, read from its parse so an import written inside a generated source's template
    // Is not one; a dynamic import of a computed name has no literal to follow
    const readModuleRequests = (path: string, text: string) => {
      const { module } = parseSync(path, text);
      return [
        ...module.staticImports.map(({ moduleRequest }) => moduleRequest.value),
        ...module.staticExports.flatMap(({ entries }) =>
          entries.flatMap(({ moduleRequest }) => moduleRequest?.value ?? []),
        ),
        ...module.dynamicImports.flatMap(
          ({ moduleRequest }) =>
            STRING_LITERAL_REGEX.exec(text.slice(moduleRequest.start, moduleRequest.end))?.groups?.value ?? [],
        ),
      ].filter((specifier) => specifier.startsWith("#") || specifier.startsWith("."));
    };
    // Node resolves a `#` name through the `imports` of the manifest nearest the importing file, in its own order: the
    // Key with the longest text before its `*`, then the longest key
    const importsPatternsMap = new Map<string, [string, string][]>();
    const readImportsPatterns = (manifestDirectory: string) => {
      const cachedPatterns = importsPatternsMap.get(manifestDirectory);
      if (cachedPatterns) return cachedPatterns;
      const { imports = {} } = readJsonFile(join(manifestDirectory, PACKAGE_JSON_FILENAME)) as {
        imports?: Record<string, string>;
      };
      const patterns = Object.entries(imports).toSorted(
        ([firstKey], [secondKey]) =>
          secondKey.indexOf("*") - firstKey.indexOf("*") || secondKey.length - firstKey.length,
      );
      importsPatternsMap.set(manifestDirectory, patterns);
      return patterns;
    };
    const findManifestDirectory = (path: string): string => {
      const directory = dirname(path);
      return existsSync(join(directory, PACKAGE_JSON_FILENAME)) || directory === REPOSITORY_ROOT
        ? directory
        : findManifestDirectory(directory);
    };
    const resolveSpecifier = (specifier: string, importerPath: string) => {
      if (specifier.startsWith(".")) return join(dirname(importerPath), specifier);
      const manifestDirectory = findManifestDirectory(importerPath);
      for (const [key, target] of readImportsPatterns(manifestDirectory)) {
        const starIndex = key.indexOf("*");
        if (starIndex === -1) {
          if (key === specifier) return join(manifestDirectory, target);
          continue;
        }
        const prefix = key.slice(0, starIndex);
        const suffix = key.slice(starIndex + 1);
        if (specifier.startsWith(prefix) && specifier.endsWith(suffix) && specifier.length >= key.length - 1)
          return join(
            manifestDirectory,
            target.replaceAll("*", specifier.slice(prefix.length, specifier.length - suffix.length)),
          );
      }
      return undefined;
    };
    const failures = scripts.flatMap(({ body, manifestPath, name }) => {
      const packageDirectory = join(REPOSITORY_ROOT, dirname(manifestPath));
      const pending = Array.from(body.matchAll(NODE_ENTRY_REGEX), (match) =>
        join(packageDirectory, match.groups?.entry ?? ""),
      );
      const visited = new Set<string>();
      const toFailure = (detail: string) => `${manifestPath} ${name}: ${detail}`;
      for (const path of pending) {
        if (visited.has(path)) continue;
        visited.add(path);
        if (!existsSync(path))
          return [toFailure(`${relative(REPOSITORY_ROOT, path).replaceAll("\\", "/")} is missing`)];
        if (!path.endsWith(".ts")) continue;
        const text = readFileSync(path, "utf8");
        const isStrippable = getResult(() => stripTypeScriptTypes(text)).match(
          () => true,
          () => false,
        );
        if (!isStrippable) return [toFailure(relative(REPOSITORY_ROOT, path).replaceAll("\\", "/"))];
        for (const specifier of readModuleRequests(path, text)) {
          const resolvedPath = resolveSpecifier(specifier, path);
          if (resolvedPath === undefined)
            return [toFailure(`${relative(REPOSITORY_ROOT, path).replaceAll("\\", "/")} imports ${specifier}`)];
          pending.push(resolvedPath);
        }
      }
      return [];
    });

    expect(failures).toStrictEqual([]);
  });

  // `node` runs every TypeScript script, so another loader in front of one is a second runner kept for nothing
  test("run every TypeScript entry under `node`", () => {
    expect.hasAssertions();

    const VPX_ENTRY_REGEX = /\bvpx\b[^&;|]*\.ts\b/u;
    const vpxEntries = scripts
      .filter(({ body }) => VPX_ENTRY_REGEX.test(body))
      .map(({ manifestPath, name }) => `${manifestPath} ${name}`);

    expect(vpxEntries).toStrictEqual([]);
  });

  test("hold no comment key, which pnpm lists as runnable", () => {
    expect.hasAssertions();

    const commentKeys = scripts
      .filter(({ name }) => name.startsWith("//"))
      .map(({ manifestPath, name }) => `${manifestPath} ${name}`);

    expect(commentKeys).toStrictEqual([]);
  });
});
