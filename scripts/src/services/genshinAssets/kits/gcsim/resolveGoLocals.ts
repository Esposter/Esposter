import { GO_COMPOUND_ASSIGNMENT_OPERATORS } from "#src/services/genshinAssets/kits/constants";

// A local name in a constructor's arguments, bound in the function it is used in. The name is the identifier that is not
// The field or call of another name, and not the left side of an assignment
const LOCAL_NAME_REGEX = /(?<!\.)\b(?<name>[A-Za-z_]\w*)\b(?!\s*\()/gu;
// An operator of any precedence in Go's binary set, so a bound expression holding one is wrapped to stay one operand
const OPERATOR_REGEX = /[-!%&*+/<=>^|]/u;
// The compound assignment operators a rebinding's `=` follows, as an alternation of their escaped text
const COMPOUND_OPERATOR_PATTERN = GO_COMPOUND_ASSIGNMENT_OPERATORS.map((operator) => RegExp.escape(operator)).join("|");

// The first and last line of the top-level function a line is in, or undefined where it is in none
const readFunctionLines = (lines: readonly string[], lineIndex: number): [number, number] | undefined => {
  let start = lineIndex;
  while (start >= 0 && !(lines[start] ?? "").startsWith("func ")) start--;
  if (start < 0) return undefined;
  let end = lineIndex;
  while (end < lines.length && !(lines[end] ?? "").startsWith("}")) end++;
  return [start, end];
};

interface GoBinding {
  expression: string;
  isDefinition: boolean;
  isTopLevel: boolean;
  line: number;
}

// The bindings and assignments of a name in a function's lines: each `name := expr`, `var name = expr` or `name = expr`,
// And each other place a name is bound, such as a range or a second declaration, which gives no expression
const readBindings = (lines: readonly string[], [start, end]: [number, number], name: string): GoBinding[] => {
  const bindings: GoBinding[] = [];
  const assignmentRegex = new RegExp(
    `(?<![.\\w])${name}\\s*(?<operator>:=|(?:${COMPOUND_OPERATOR_PATTERN})?=(?!=))\\s*(?<expression>[^\\n]*)`,
    "u",
  );
  const declarationRegex = new RegExp(`\\bvar\\s+${name}\\b[^=\\n]*=\\s*(?<expression>[^\\n]*)`, "u");
  for (let line = start; line <= end; line++) {
    const text = lines[line] ?? "";
    const isTopLevel = /^\t[^\t]/u.test(text);
    const declaration = declarationRegex.exec(text);
    if (declaration?.groups?.expression !== undefined)
      bindings.push({ expression: declaration.groups.expression.trim(), isDefinition: true, isTopLevel, line });
    const assignment = assignmentRegex.exec(text);
    if (assignment?.groups !== undefined && declaration === null)
      bindings.push({
        expression: (assignment.groups.expression ?? "").trim(),
        isDefinition: assignment.groups.operator === ":=",
        isTopLevel,
        line,
      });
  }
  return bindings;
};

// The text with each local name in it replaced by the expression it is bound to, where a name is bound once, by `:=` or
// `var` at the function's top level, on a line before the use. Undefined where a local name is bound any other way, as
// Its value is then not known from the text. A name no function binds is left in the text as it is
export const resolveGoLocals = (text: string, lines: readonly string[], lineIndex: number): string | undefined => {
  const functionLines = readFunctionLines(lines, lineIndex);
  if (functionLines === undefined) return text;
  let isResolved = true;
  const resolved = text.replaceAll(LOCAL_NAME_REGEX, (match, name: string) => {
    if (!isResolved) return match;
    const bindings = readBindings(lines, functionLines, name);
    if (bindings.length === 0) return match;
    const [binding] = bindings;
    if (
      bindings.length !== 1 ||
      binding === undefined ||
      !binding.isDefinition ||
      !binding.isTopLevel ||
      binding.line >= lineIndex
    ) {
      isResolved = false;
      return match;
    }
    return OPERATOR_REGEX.test(binding.expression) ? `(${binding.expression})` : binding.expression;
  });
  return isResolved ? resolved : undefined;
};
