import { parseSourceUnlinked } from "#src/services/shared/parseSourceUnlinked";
import { getDeclarationNames } from "#src/services/workspace/getDeclarationNames";
import { resolveReExportSource } from "#src/services/workspace/resolveReExportSource";
import { readFileSync } from "node:fs";

// Every name a source entry exports, read from the entry and each module it re-exports with `export * from`, so a
// Barrel's names are the names a consumer imports from it. A name that is only re-exported is named where it is
// Declared, and a default export is named `default`, as well as by the identifier or class it is declared with
export const readEntryExportNames = (entryPath: string, sourceDirectory: string): Set<string> => {
  const names = new Set<string>();
  const pending = [entryPath];
  for (let path = pending.pop(); path !== undefined; path = pending.pop())
    for (const statement of parseSourceUnlinked(readFileSync(path, "utf8")).body)
      if (statement.type === "ExportNamedDeclaration") {
        if (statement.declaration) for (const name of getDeclarationNames(statement.declaration)) names.add(name);
        for (const { exported } of statement.specifiers)
          names.add(exported.type === "Literal" ? exported.value : exported.name);
      } else if (statement.type === "ExportDefaultDeclaration") {
        names.add("default");
        const { declaration } = statement;
        if (declaration.type === "Identifier") names.add(declaration.name);
        else if ("id" in declaration && declaration.id?.type === "Identifier") names.add(declaration.id.name);
      } else if (statement.type === "ExportAllDeclaration") {
        const { exported } = statement;
        if (exported) names.add(exported.type === "Literal" ? exported.value : exported.name);
        pending.push(resolveReExportSource(path, statement.source.value, sourceDirectory));
      }
  return names;
};
