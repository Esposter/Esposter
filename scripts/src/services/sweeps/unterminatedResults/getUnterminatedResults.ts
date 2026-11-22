import type { UnterminatedResult } from "#src/models/sweeps/unterminatedResults/UnterminatedResult";

import { parents } from "#src/services/shared/parents";
import { parseSource } from "#src/services/shared/parseSource";
import { getDescendants } from "#src/services/sweeps/getDescendants";
import { checkIsBindingTerminated } from "#src/services/sweeps/unterminatedResults/checkIsBindingTerminated";
import { checkIsResultCall } from "#src/services/sweeps/unterminatedResults/checkIsResultCall";
import { getBindingName } from "#src/services/sweeps/unterminatedResults/getBindingName";
import { getScope } from "#src/services/sweeps/unterminatedResults/getScope";
import { getValueChain } from "#src/services/sweeps/unterminatedResults/getValueChain";

const AFTER_LENGTH = 34;
// A `Result` nothing terminates fails silently. Its value is only this file's to answer when it stands as a statement,
// Or when it is bound to a name no later line terminates; anywhere else the caller owns the terminator.
export const getUnterminatedResults = (text: string): UnterminatedResult[] => {
  const program = parseSource(text);
  return getDescendants(program)
    .filter((node) => checkIsResultCall(node))
    .flatMap((call) => {
      const { isTerminated, top } = getValueChain(call);
      if (isTerminated) return [];

      const parent = parents.get(top);
      const bindingName = getBindingName(top);
      const isKeptHere = parent?.type === "ExpressionStatement" || parent?.type === "VariableDeclarator";
      if (bindingName === undefined && !isKeptHere) return [];

      // An assignment writes a name declared elsewhere, so its later reads are read from the whole file
      const scope = parent?.type === "AssignmentExpression" ? program : getScope(call);
      if (bindingName !== undefined && checkIsBindingTerminated(call, bindingName, scope)) return [];

      const scopeEnd = scope.type === "BlockStatement" ? scope.end - 1 : text.length;
      const after = text.slice(call.end, scopeEnd).replaceAll(/\s+/gu, " ").trim().slice(0, AFTER_LENGTH);
      let line = 1;
      for (let index = 0; index < call.start; index++) if (text.charAt(index) === "\n") line++;
      return [{ after, line }];
    });
};
