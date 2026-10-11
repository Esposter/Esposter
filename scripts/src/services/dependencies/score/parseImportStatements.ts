import type { ImportStatement } from "#src/models/dependencies/score/ImportStatement";

// An import or an export with a `from` clause: its optional `type` keyword, the clause naming what it takes, and its specifier
const FROM_STATEMENT_REGEX =
  /\b(?:import|export)\s+(?<type>type\s+)?(?<clause>[^'";]*?)\s*from\s*"(?<specifier>[^"\n]+)"/gu;
// A side-effect import, which names nothing and opens its line
const SIDE_EFFECT_REGEX = /^\s*import\s*"(?<specifier>[^"\n]+)"/gmu;
// A dynamic import, which loads the whole module
const DYNAMIC_REGEX = /\bimport\(\s*"(?<specifier>[^"\n]+)"\s*\)/gu;
const NAMED_CLAUSE_REGEX = /\{(?<names>[^}]*)\}/u;

// The names a clause takes: the braced names read as what they import (an `as` alias is the name before it), a `type`
// Name left out, and a leading identifier is the default export
const parseNames = (clause: string): string[] => {
  const names: string[] = /^[\w$]/u.test(clause) ? ["default"] : [];
  const namedText = NAMED_CLAUSE_REGEX.exec(clause)?.groups?.names ?? "";

  for (const entry of namedText.split(",")) {
    const trimmedEntry = entry.trim();
    if (trimmedEntry === "" || trimmedEntry.startsWith("type ")) continue;

    const [name = ""] = trimmedEntry.split(/\s+as\s+/u);
    names.push(name);
  }

  return names;
};

// Every import, export-from and dynamic import in a source file, as the bundle cost of each package reads them
export const parseImportStatements = (source: string): ImportStatement[] => {
  const statements: ImportStatement[] = [];

  for (const { groups } of source.matchAll(FROM_STATEMENT_REGEX)) {
    const clause = groups?.clause ?? "";
    statements.push({
      hasNamespace: clause.includes("*"),
      isSideEffect: false,
      isTypeOnly: groups?.type !== undefined,
      names: parseNames(clause),
      specifier: groups?.specifier ?? "",
    });
  }
  for (const { groups } of source.matchAll(SIDE_EFFECT_REGEX))
    statements.push({
      hasNamespace: false,
      isSideEffect: true,
      isTypeOnly: false,
      names: [],
      specifier: groups?.specifier ?? "",
    });
  for (const { groups } of source.matchAll(DYNAMIC_REGEX))
    statements.push({
      hasNamespace: true,
      isSideEffect: false,
      isTypeOnly: false,
      names: [],
      specifier: groups?.specifier ?? "",
    });

  return statements;
};
