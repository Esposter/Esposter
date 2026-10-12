import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// A name assigned on a line of a gcsim file, `name = expr` or `const name = expr` for a constant or `name := expr` for a
// Local, with any comment
const ASSIGNMENT_REGEX = /^\s*(?:(?:const|var)\s+)?(?<name>\w+)\s*:?=\s*(?<expression>[^/]+?)\s*(?:\/\/.*)?$/u;
const MAX_DEPTH = 8;

// The resolver of a gcsim file's names: a name takes the value of its first assignment whose expression evaluates, with
// The names that expression refers to resolved the same way, to a depth no deeper than the file's own chain of constants
export const createGcsimFileResolver = (lines: readonly string[]): ((name: string) => GoValue | undefined) => {
  const resolve = (name: string, depth: number): GoValue | undefined => {
    if (depth > MAX_DEPTH) return undefined;
    for (const line of lines) {
      const match = ASSIGNMENT_REGEX.exec(line);
      if (match?.groups?.name !== name) continue;
      const { expression } = parseGoExpression(tokenizeGo(match.groups.expression ?? ""), 0);
      const value = evaluateGoExpression(expression, (inner) => resolve(inner, depth + 1));
      if (value !== undefined) return value;
    }
    return undefined;
  };
  return (name) => resolve(name, 0);
};
