import type { RenameSubstitution } from "#src/coderabbit/models/RenameSubstitution";

import { InvalidOperationError, Operation } from "@esposter/shared";
// One `OldName=NewName` per rename the sweep made, so the replay can reproduce the committed blob
const RENAME_SUBSTITUTION_REGEX = /^(?<oldName>[^=]+)=(?<newName>[^=]+)$/u;

export const getRenameSubstitutions = (args: string[]): RenameSubstitution[] =>
  args.map((arg) => {
    const groups = RENAME_SUBSTITUTION_REGEX.exec(arg)?.groups;
    if (!groups) throw new InvalidOperationError(Operation.Read, getRenameSubstitutions.name, arg);
    return { newName: String(groups.newName), oldName: String(groups.oldName) };
  });
