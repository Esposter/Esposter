import type { RenameSubstitution } from "#src/coderabbit/models/RenameSubstitution";

import { InvalidOperationError, Operation } from "@esposter/shared";
// One `OldName=NewName` per rename the sweep made, so the replay can reproduce the committed blob. Both halves must
// Be identifiers that are not reserved words: the replay substitutes word-bounded, so `true=false` would reproduce a
// Logic flip byte for byte and let the file out of review as a rename
const RENAME_SUBSTITUTION_REGEX = /^(?<oldName>[A-Za-z_$][\w$]*)=(?<newName>[A-Za-z_$][\w$]*)$/u;
const RESERVED_WORDS = new Set([
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
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
