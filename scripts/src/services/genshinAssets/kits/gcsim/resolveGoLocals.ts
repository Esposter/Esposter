import { checkIsWholeArgument } from "#src/services/genshinAssets/kits/gcsim/checkIsWholeArgument";
import { MAX_ALTERNATIVES } from "#src/services/genshinAssets/kits/gcsim/constants";
import { readFunctionLines } from "#src/services/genshinAssets/kits/gcsim/readFunctionLines";
import { readGetterCenter } from "#src/services/genshinAssets/kits/gcsim/readGetterCenter";
import { readLocalValues } from "#src/services/genshinAssets/kits/gcsim/readLocalValues";

// A local name in a constructor's arguments, bound in the function it is used in. The name is the identifier that is not
// The field or call of another name, and not the left side of an assignment
const LOCAL_NAME_REGEX = /(?<!\.)\b(?<name>[A-Za-z_]\w*)\b(?!\s*\()/gu;
// An operator of any precedence in Go's binary set, so a bound expression holding one is wrapped to stay one operand
const OPERATOR_REGEX = /[-!%&*+/<=>^|]/u;
// A call expression, a function or method named by a dotted path and its arguments
const CALL_REGEX = /^[A-Za-z_][\w.]*\(.*\)$/u;

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
