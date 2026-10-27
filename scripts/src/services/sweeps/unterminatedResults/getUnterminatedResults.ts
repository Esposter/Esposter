import type { UnterminatedResult } from "#src/models/sweeps/unterminatedResults/UnterminatedResult";

import { parents } from "#src/services/shared/getParent";
import { parseSource } from "#src/services/shared/parseSource";
import { getDescendants } from "#src/services/sweeps/getDescendants";
import { checkIsBindingTerminated } from "#src/services/sweeps/unterminatedResults/checkIsBindingTerminated";
import { checkIsResultCall } from "#src/services/sweeps/unterminatedResults/checkIsResultCall";
import { getScope } from "#src/services/sweeps/unterminatedResults/getScope";
import { getValueChain } from "#src/services/sweeps/unterminatedResults/getValueChain";

const AFTER_LENGTH = 34;

// A `Result` nothing terminates fails silently. Its value is only this file's to answer when it stands as a statement,
// Or when it is bound to a name no later line terminates; anywhere else the caller owns the terminator.
export const getUnterminatedResults = (text: string): UnterminatedResult[] =>
  getDescendants(parseSource(text))
    .filter((node) => checkIsResultCall(node))
    .flatMap((call) => {
      const { isTerminated, top } = getValueChain(call);
      if (isTerminated) return [];

      const parent = parents.get(top);
      const bindingName =
        parent?.type === "VariableDeclarator" && parent.init === top && parent.id.type === "Identifier"
          ? parent.id.name
          : undefined;
      if (bindingName === undefined && parent?.type !== "ExpressionStatement") return [];

      const scope = getScope(call);
      if (bindingName !== undefined && checkIsBindingTerminated(call, bindingName, scope)) return [];

      const scopeEnd = scope.type === "BlockStatement" ? scope.end - 1 : text.length;
      const after = text.slice(call.end, scopeEnd).replaceAll(/\s+/gu, " ").trim().slice(0, AFTER_LENGTH);
      const line = text.slice(0, call.start).split("\n").length;
      return [{ after, line }];
    });
