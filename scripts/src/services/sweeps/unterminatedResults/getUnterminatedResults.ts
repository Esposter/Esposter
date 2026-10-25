import type { UnterminatedResult } from "#src/models/sweeps/unterminatedResults/UnterminatedResult";

import { getDescendants } from "#src/services/sweeps/getDescendants";
import { checkIsBindingTerminated } from "#src/services/sweeps/unterminatedResults/checkIsBindingTerminated";
import { checkIsResultCall } from "#src/services/sweeps/unterminatedResults/checkIsResultCall";
import { getScope } from "#src/services/sweeps/unterminatedResults/getScope";
import { getValueChain } from "#src/services/sweeps/unterminatedResults/getValueChain";
import ts from "typescript";

const AFTER_LENGTH = 34;

// A `Result` nothing terminates fails silently. Its value is only this file's to answer when it stands as a statement,
// Or when it is bound to a name no later line terminates; anywhere else the caller owns the terminator.
export const getUnterminatedResults = (text: string): UnterminatedResult[] => {
  const sourceFile = ts.createSourceFile("", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return getDescendants(sourceFile)
    .filter((node) => checkIsResultCall(node))
    .flatMap((call) => {
      const { isTerminated, top } = getValueChain(call);
      if (isTerminated) return [];

      const { parent } = top;
      const bindingName =
        ts.isVariableDeclaration(parent) && parent.initializer === top && ts.isIdentifier(parent.name)
          ? parent.name.text
          : undefined;
      if (bindingName === undefined && !ts.isExpressionStatement(parent)) return [];

      const scope = getScope(call);
      if (bindingName !== undefined && checkIsBindingTerminated(call, bindingName, scope)) return [];

      const scopeEnd = ts.isBlock(scope) ? scope.end - 1 : text.length;
      const after = text.slice(call.end, scopeEnd).replaceAll(/\s+/gu, " ").trim().slice(0, AFTER_LENGTH);
      const line = sourceFile.getLineAndCharacterOfPosition(call.getStart(sourceFile)).line + 1;
      return [{ after, line }];
    });
};
