import { checkIsInScope } from "#src/services/genshinAssets/kits/gcsim/checkIsInScope";
import { checkIsWholeArgument } from "#src/services/genshinAssets/kits/gcsim/checkIsWholeArgument";
import { MAX_ALTERNATIVES } from "#src/services/genshinAssets/kits/gcsim/constants";
import { readBindings } from "#src/services/genshinAssets/kits/gcsim/readBindings";
import { readFunctionLines } from "#src/services/genshinAssets/kits/gcsim/readFunctionLines";
import { readGetterCenter } from "#src/services/genshinAssets/kits/gcsim/readGetterCenter";

// A local name in a constructor's arguments, bound in the function it is used in. The name is the identifier that is not
// The field or call of another name, and not the left side of an assignment
const LOCAL_NAME_REGEX = /(?<!\.)\b(?<name>[A-Za-z_]\w*)\b(?!\s*\()/gu;
// An operator of any precedence in Go's binary set, so a bound expression holding one is wrapped to stay one operand
const OPERATOR_REGEX = /[-!%&*+/<=>^|]/u;
// A call expression, a function or method named by a dotted path and its arguments
const CALL_REGEX = /^[A-Za-z_][\w.]*\(.*\)$/u;
// A `for` header, whose variable is the loop's and takes the value of each of its turns
const LOOP_HEADER_REGEX = /^\s*for\s/u;

// The values a local name may hold where it is used: the expression it is declared with, by `:=` or `var` in a block
// That is still open at the use, and each expression a plain `=` before the use writes to it. None where the name is
// Bound any other way, as its value is then not known from the text, and none to replace where no function binds it or a
// `for` loop declares it, which the loop's turns give a value
const readLocalValues = (
  name: string,
  lines: readonly string[],
  functionLines: [number, number],
  lineIndex: number,
): string[] | undefined => {
  const bindings = readBindings(lines, functionLines, name);
  if (bindings.length === 0) return [];
  const definitions = bindings.filter(({ isDefinition }) => isDefinition);
  const [definition] = definitions;
  if (definitions.length !== 1 || definition === undefined) return undefined;
  if (LOOP_HEADER_REGEX.test(lines[definition.line] ?? "")) return [];
  if (definition.line >= lineIndex || !checkIsInScope(lines, definition.line, lineIndex)) return undefined;
  const reassignments = bindings.filter(({ isDefinition }) => !isDefinition);
  const selfRegex = new RegExp(`\\b${name}\\b`, "u");
  if (
    reassignments.some(
      ({ expression, isCompound, line }) =>
        isCompound || line <= definition.line || line >= lineIndex || selfRegex.test(expression),
    )
  )
    return undefined;
  const values = [...new Set([definition.expression, ...reassignments.map(({ expression }) => expression)])].filter(
    (value) => value !== "",
  );
  return values.length === 0 ? undefined : values;
};

// The texts a constructor's arguments are with each local name in them replaced by an expression it may hold, one text for
// Each combination of the names bound more than once, in the order the values are written. A name no function binds is
// Left in the text as it is, and so is a whole argument bound to a call that is no getter, a place the code computes,
// Which the hitbox reads as the mechanical path reads a place: centred on the body. Undefined where a name's value is
// Not known from the text, or the combinations are more than a handful
export const resolveGoLocals = (text: string, lines: readonly string[], lineIndex: number): string[] | undefined => {
  const functionLines = readFunctionLines(lines, lineIndex);
  if (functionLines === undefined) return [text];
  const valuesMap = new Map<string, string[]>();
  for (const [, name] of text.matchAll(LOCAL_NAME_REGEX)) {
    if (name === undefined || valuesMap.has(name)) continue;
    const values = readLocalValues(name, lines, functionLines, lineIndex);
    if (values === undefined) return undefined;
    if (values.length > 0) valuesMap.set(name, values);
  }
  let combinations: Map<string, string>[] = [new Map()];
  for (const [name, values] of valuesMap) {
    combinations = combinations.flatMap((combination) => values.map((value) => new Map(combination).set(name, value)));
    if (combinations.length > MAX_ALTERNATIVES) return undefined;
  }
  return [
    ...new Set(
      combinations.map((combination) =>
        text.replaceAll(LOCAL_NAME_REGEX, (match, name: string, offset: number, whole: string) => {
          const value = combination.get(name);
          if (value === undefined) return match;
          if (
            CALL_REGEX.test(value) &&
            readGetterCenter(value) === undefined &&
            checkIsWholeArgument(whole, offset, match.length)
          )
            return match;
          return OPERATOR_REGEX.test(value) ? `(${value})` : value;
        }),
      ),
    ),
  ];
};
