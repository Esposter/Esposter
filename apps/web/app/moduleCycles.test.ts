import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { babelParse, parse, walkIdentifiers } from "vue/compiler-sfc";

// `import/no-cycle` reads the imports a file writes, and a Nuxt auto-import is one it never writes: the build injects
// It. A cycle closed by one is invisible to the linter and still a cycle at runtime, where a binding read before its
// Module finished evaluating throws "Cannot access … before initialization". So this suite rebuilds the graph as the
// Bundle has it — the written imports plus the auto-imported names each file references as values — and fails on any
// Cycle an auto-import takes part in; one the written imports close alone is the linter's
describe("moduleCycles", () => {
  const ROOT = join(import.meta.dirname, "..");

  test("closes no module cycle through an auto-import", async () => {
    expect.hasAssertions();

    const ALIAS_DIRECTORY_MAP = new Map([
      ["#shared/", "shared/"],
      ["@/", "app/"],
      ["@@/", ""],
      ["~/", "app/"],
      ["~~/", ""],
    ]);
    const sourcePaths = (await Array.fromAsync(glob(["app/**/*.{ts,vue}", "shared/**/*.ts"], { cwd: ROOT })))
      .map((sourcePath) => sourcePath.replaceAll("\\", "/"))
      .filter((sourcePath) => !/\.(?:bench|d|test|test-d)\.ts$/u.test(sourcePath));
    const sourcePathSet = new Set(sourcePaths);
    // Nuxt's own record of what it injects, written by `nuxt prepare`. It also lists a composable's type parameters as
    // Exports, which is harmless here: a type parameter is never referenced as a value
    const autoImportPathMap = new Map<string, string>();
    for (const { groups } of (await readFile(join(ROOT, ".nuxt/imports.d.ts"), "utf8")).matchAll(
      /export \{(?<names>[^}]+)\} from '\.\.\/(?<path>app\/[^']+)'/gu,
    ))
      if (groups?.names && groups.path)
        for (const name of groups.names.split(",")) autoImportPathMap.set(name.trim(), `${groups.path}.ts`);

    const resolveSpecifier = (specifier: string) => {
      const alias = [...ALIAS_DIRECTORY_MAP.keys()].find((prefix) => specifier.startsWith(prefix));
      if (alias === undefined) return undefined;
      const path = `${ALIAS_DIRECTORY_MAP.get(alias)}${specifier.slice(alias.length)}`;
      return [path, `${path}.ts`, `${path}/index.ts`].find((candidate) => sourcePathSet.has(candidate));
    };
    const readProgram = async (sourcePath: string) => {
      const text = await readFile(join(ROOT, sourcePath), "utf8");
      if (!sourcePath.endsWith(".vue"))
        return babelParse(text, { plugins: ["typescript"], sourceType: "module" }).program;
      const { script, scriptSetup } = parse(text, { sourceMap: false }).descriptor;
      const content = [script?.content, scriptSetup?.content].filter(Boolean).join("\n");
      return content ? babelParse(content, { plugins: ["typescript"], sourceType: "module" }).program : undefined;
    };
    // Written edges and auto-import edges apart, since which kind closes a cycle decides whose finding it is
    const writtenEdgeMap = new Map<string, Set<string>>();
    const autoImportEdgeMap = new Map<string, Set<string>>();
    await Promise.all(
      sourcePaths.map(async (sourcePath) => {
        const writtenEdges = new Set<string>();
        const autoImportEdges = new Set<string>();
        writtenEdgeMap.set(sourcePath, writtenEdges);
        autoImportEdgeMap.set(sourcePath, autoImportEdges);
        const program = await readProgram(sourcePath);
        if (!program) return;

        const declaredNames = new Set<string>();
        for (const statement of program.body) {
          if (
            (statement.type === "ExportAllDeclaration" || statement.type === "ExportNamedDeclaration") &&
            statement.source &&
            statement.exportKind !== "type"
          ) {
            const target = resolveSpecifier(statement.source.value);
            if (target) writtenEdges.add(target);
          } else if (
            statement.type === "ImportDeclaration" &&
            statement.importKind !== "type" &&
            (statement.specifiers.length === 0 ||
              statement.specifiers.some(
                (specifier) => specifier.type !== "ImportSpecifier" || specifier.importKind !== "type",
              ))
          ) {
            const target = resolveSpecifier(statement.source.value);
            if (target) writtenEdges.add(target);
          }

          const declaration = statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;
          const declaredIds =
            declaration?.type === "VariableDeclaration"
              ? declaration.declarations.map(({ id }) => id)
              : [
                  declaration?.type === "FunctionDeclaration" || declaration?.type === "ClassDeclaration"
                    ? declaration.id
                    : null,
                ];
          for (const id of declaredIds) if (id?.type === "Identifier") declaredNames.add(id.name);
        }

        walkIdentifiers(program, ({ name }, _parent, _parentStack, isReference, isLocal) => {
          const target = autoImportPathMap.get(name);
          if (!isReference || isLocal || declaredNames.has(name) || !target || target === sourcePath) return;
          autoImportEdges.add(target);
        });
      }),
    );

    const getEdges = (sourcePath: string) => [
      ...(writtenEdgeMap.get(sourcePath) ?? []),
      ...(autoImportEdgeMap.get(sourcePath) ?? []),
    ];
    // Tarjan's strongly connected components: every component of more than one module is a cycle
    const readCycles = () => {
      const indexMap = new Map<string, number>();
      const lowLinkMap = new Map<string, number>();
      const stack: string[] = [];
      const onStack = new Set<string>();
      const cycles: string[][] = [];
      const visit = (sourcePath: string) => {
        indexMap.set(sourcePath, indexMap.size);
        lowLinkMap.set(sourcePath, indexMap.size - 1);
        stack.push(sourcePath);
        onStack.add(sourcePath);
        for (const target of getEdges(sourcePath))
          if (!indexMap.has(target)) {
            visit(target);
            lowLinkMap.set(sourcePath, Math.min(lowLinkMap.get(sourcePath) ?? 0, lowLinkMap.get(target) ?? 0));
          } else if (onStack.has(target))
            lowLinkMap.set(sourcePath, Math.min(lowLinkMap.get(sourcePath) ?? 0, indexMap.get(target) ?? 0));

        if (lowLinkMap.get(sourcePath) !== indexMap.get(sourcePath)) return;
        const cycle: string[] = [];
        let member: string | undefined;
        do {
          member = stack.pop();
          if (member === undefined) break;
          onStack.delete(member);
          cycle.push(member);
        } while (member !== sourcePath);
        if (cycle.length > 1) cycles.push(cycle.toSorted());
      };
      for (const sourcePath of sourcePaths) if (!indexMap.has(sourcePath)) visit(sourcePath);
      return cycles;
    };

    const autoImportCycles = readCycles().filter((cycle) => {
      const members = new Set(cycle);
      return cycle.some((sourcePath) =>
        [...(autoImportEdgeMap.get(sourcePath) ?? [])].some((target) => members.has(target)),
      );
    });

    expect(autoImportCycles).toStrictEqual([]);
  });
});
