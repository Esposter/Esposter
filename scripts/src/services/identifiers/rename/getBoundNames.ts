import type { BoundNames } from "#src/models/identifiers/rename/BoundNames";
import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";

// Which of the map's names a source binds: imported by name from a module the map names, or declared by the source
// Itself when it is one of the map's sources. A name imported under an alias is bound to the alias, so only its
// Import renames it
export const getBoundNames = ({ modules, renames }: RenameMap, text: string, isSource: boolean): BoundNames => {
  const importRegex = new RegExp(
    `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*["'](?:${modules.map((module) => `${RegExp.escape(module)}[^"']*`).join("|")})["']`,
    "gu",
  );
  const boundNames = new Set<string>();
  const aliasedNames = new Set<string>();

  for (const [, specifierList = ""] of text.matchAll(importRegex))
    for (const specifier of specifierList.split(",")) {
      const [importedName = "", alias] = specifier
        .trim()
        .replace(/^type\s+/u, "")
        .split(/\s+as\s+/u);
      if (!(importedName in renames)) continue;
      else if (alias) aliasedNames.add(importedName);
      else boundNames.add(importedName);
    }

  if (isSource)
    for (const [, declaredName = ""] of text.matchAll(
      /^export (?:abstract class|class|const|enum|function|interface|type) (?<declaredName>\w+)/gmu,
    ))
      if (declaredName in renames) boundNames.add(declaredName);

  return { aliasedNames, boundNames, importRegex };
};
