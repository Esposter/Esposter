import { checkIsInScope } from "#src/services/genshinAssets/kits/gcsim/checkIsInScope";
import { readBindings } from "#src/services/genshinAssets/kits/gcsim/readBindings";

// A `for` header, whose variable is the loop's and takes the value of each of its turns
const LOOP_HEADER_REGEX = /^\s*for\s/u;

// The values a local name may hold where it is used: the expression it is declared with, by `:=` or `var` in a block
// That is still open at the use, and each expression a plain `=` before the use writes to it. None where the name is
// Bound any other way, as its value is then not known from the text, and none to replace where no function binds it or a
// `for` loop declares it, which the loop's turns give a value. A bare declaration, `var name float64`, is no value of its
// Own: the zero it holds before a write is not an expression any path writes, so the alternatives are the writes alone
export const readLocalValues = (
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
