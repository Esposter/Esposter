import type { GoBinding } from "#src/models/genshinAssets/kits/gcsim/GoBinding";

import { GO_COMPOUND_ASSIGNMENT_OPERATORS } from "#src/services/genshinAssets/kits/constants";

// The compound assignment operators a rebinding's `=` follows, as an alternation of their escaped text
const COMPOUND_OPERATOR_PATTERN = GO_COMPOUND_ASSIGNMENT_OPERATORS.map((operator) => RegExp.escape(operator)).join("|");

// The bindings and assignments of a name in a function's lines: each `name := expr`, `var name = expr` or `name = expr`,
// A `var name type` that gives it no expression, and each other place a name is bound, such as a range or a second
// Declaration, which gives no expression
export const readBindings = (lines: readonly string[], [start, end]: [number, number], name: string): GoBinding[] => {
  const bindings: GoBinding[] = [];
  const assignmentRegex = new RegExp(
    `(?<![.\\w])${name}\\s*(?<operator>:=|(?:${COMPOUND_OPERATOR_PATTERN})?=(?!=))\\s*(?<expression>[^\\n]*)`,
    "u",
  );
  const declarationRegex = new RegExp(`\\bvar\\s+${name}\\b[^=\\n]*=\\s*(?<expression>[^\\n]*)`, "u");
  // A declaration with no value, `var name float64`, which the writes under it give the name its values
  const bareDeclarationRegex = new RegExp(`\\bvar\\s+${name}\\b[^=\\n]*$`, "u");
  for (let line = start; line <= end; line++) {
    const text = lines[line] ?? "";
    const declaration = declarationRegex.exec(text);
    if (declaration?.groups?.expression !== undefined)
      bindings.push({ expression: declaration.groups.expression.trim(), isCompound: false, isDefinition: true, line });
    if (declaration === null && bareDeclarationRegex.test(text))
      bindings.push({ expression: "", isCompound: false, isDefinition: true, line });
    const assignment = assignmentRegex.exec(text);
    if (assignment?.groups !== undefined && declaration === null)
      bindings.push({
        expression: (assignment.groups.expression ?? "").trim(),
        isCompound: assignment.groups.operator !== ":=" && assignment.groups.operator !== "=",
        isDefinition: assignment.groups.operator === ":=",
        line,
      });
  }
  return bindings;
};
