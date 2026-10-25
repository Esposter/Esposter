import { readBindings } from "#src/services/genshinAssets/kits/gcsim/readBindings";
import { readFunctionLines } from "#src/services/genshinAssets/kits/gcsim/readFunctionLines";

// A local name in a constructor's arguments, bound in the function it is used in. The name is the identifier that is not
// The field or call of another name, and not the left side of an assignment
const LOCAL_NAME_REGEX = /(?<!\.)\b(?<name>[A-Za-z_]\w*)\b(?!\s*\()/gu;
// An operator of any precedence in Go's binary set, so a bound expression holding one is wrapped to stay one operand
const OPERATOR_REGEX = /[-!%&*+/<=>^|]/u;

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
