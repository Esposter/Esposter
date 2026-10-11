import type { ImportStatement } from "#src/models/dependencies/score/ImportStatement";

// The module a package is bundled from, so the bundle keeps exactly what the app imports from it. A name is re-exported
// Under an alias of its own, since two specifiers of one package may export the same name; a namespace is re-exported
// Whole, and a side-effect import is kept as written. A type-only import takes no code, so it is left out.
export const createBundleEntry = (statements: ImportStatement[]): string => {
  const lines: string[] = [];
  const seenKeys = new Set<string>();
  let aliasIndex = 0;

  for (const { hasNamespace, isTypeOnly, names, specifier } of statements) {
    if (isTypeOnly) continue;

    const namespaceKey = `* ${specifier}`;
    if (hasNamespace && !seenKeys.has(namespaceKey)) {
      seenKeys.add(namespaceKey);
      lines.push(`export * as namespace_${aliasIndex} from "${specifier}";`);
      aliasIndex += 1;
    }

    const exportClauses: string[] = [];
    for (const name of names) {
      const nameKey = `${name} ${specifier}`;
      if (seenKeys.has(nameKey)) continue;

      seenKeys.add(nameKey);
      exportClauses.push(`${name} as ${name}_${aliasIndex}`);
      aliasIndex += 1;
    }

    const sideEffectKey = `import ${specifier}`;
    if (exportClauses.length > 0) lines.push(`export { ${exportClauses.join(", ")} } from "${specifier}";`);
    else if (names.length === 0 && !hasNamespace && !seenKeys.has(sideEffectKey)) {
      seenKeys.add(sideEffectKey);
      lines.push(`import "${specifier}";`);
    }
  }

  return lines.join("\n");
};
