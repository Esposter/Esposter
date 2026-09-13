import type { RenameSubstitution } from "#src/models/coderabbit/shared/RenameSubstitution";

import { InvalidOperationError, Operation } from "@esposter/shared";
// One `OldName=NewName` per rename the sweep made, so the replay can reproduce the committed blob. Both halves must
// Be identifiers the grammar does not read by spelling: the replay substitutes word-bounded, so `true=false` would
// Reproduce a logic flip byte for byte and let the file out of review as a rename. Reserved words are the obvious
// Half; the rest are the names TypeScript's grammar keys on wherever they appear — `constructor` in a class body,
// The contextual keywords (`get`, `type`, `readonly`, …) and the primitive type names — so `constructor=initialize`
// Would turn a class's constructor into a method and still read as substitution-only. `__proto__` is the one
// Plain property name an object literal reads by spelling: `{ __proto__: null }` sets the prototype where
// `{ safe: null }` adds a property, so either direction of that rename is a semantic change
const RENAME_SUBSTITUTION_REGEX = /^(?<oldName>[A-Za-z_$][\w$]*)=(?<newName>[A-Za-z_$][\w$]*)$/u;
const RESERVED_WORDS = new Set([
  "__proto__",
  "abstract",
  "accessor",
  "any",
  "arguments",
  "as",
  "asserts",
  "async",
  "await",
  "bigint",
  "boolean",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "constructor",
  "continue",
  "debugger",
  "declare",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "global",
  "if",
  "implements",
  "import",
  "in",
  "infer",
  "instanceof",
  "interface",
  "is",
  "keyof",
  "let",
  "module",
  "namespace",
  "never",
  "new",
  "null",
  "number",
  "object",
  "of",
  "out",
  "override",
  "package",
  "private",
  "protected",
  "public",
  "readonly",
  "require",
  "return",
  "satisfies",
  "set",
  "static",
  "string",
  "super",
  "switch",
  "symbol",
  "this",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "unique",
  "unknown",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

export const getRenameSubstitutions = (args: string[]): RenameSubstitution[] =>
  args.map((arg) => {
    const groups = RENAME_SUBSTITUTION_REGEX.exec(arg)?.groups;
    if (!groups) throw new InvalidOperationError(Operation.Read, getRenameSubstitutions.name, arg);
    const newName = String(groups.newName);
    const oldName = String(groups.oldName);
    if (RESERVED_WORDS.has(newName) || RESERVED_WORDS.has(oldName))
      throw new InvalidOperationError(Operation.Read, getRenameSubstitutions.name, arg);
    return { newName, oldName };
  });
