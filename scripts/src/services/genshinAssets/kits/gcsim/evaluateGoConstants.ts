import type { FieldWrite } from "#src/models/genshinAssets/kits/gcsim/FieldWrite";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoDeclaration } from "#src/models/genshinAssets/kits/gcsim/GoDeclaration";
import type { GoElementAssignment } from "#src/models/genshinAssets/kits/gcsim/GoElementAssignment";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { GCSIM_COOLDOWN_TAG_PREFIX } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { checkIsSameGoValue } from "#src/services/genshinAssets/kits/gcsim/checkIsSameGoValue";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { evaluateGoNumber } from "#src/services/genshinAssets/kits/gcsim/evaluateGoNumber";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readCharFields } from "#src/services/genshinAssets/kits/gcsim/readCharFields";
import { readFieldWrites } from "#src/services/genshinAssets/kits/gcsim/readFieldWrites";
import { skipGoBrackets } from "#src/services/genshinAssets/kits/gcsim/skipGoBrackets";
import { skipToNewline } from "#src/services/genshinAssets/kits/gcsim/skipToNewline";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

const DECLARATION_KEYWORDS = new Set(["const", "var"]);

// The constants and variables of a gcsim character's package, read from every file of it by a constant evaluator rather
// Than a Go parser: each `const` and `var` holding a literal, an integer sum or a slice of them, and what the package's
// `init` assigns them, a whole slice or one element at a time, as the frame helpers are. A name whose value is a call
// Into the simulation or any form past those is left out
export const evaluateGoConstants = (sources: readonly GoSource[]): Map<string, GoConstant> => {
  const declarationMap = new Map<string, GoDeclaration>();
  const elementAssignments: GoElementAssignment[] = [];
  const fieldWriteMap = new Map<string, FieldWrite[]>();
  const charFieldSet = new Set<string>();
  // A const group's spec with no expression of its own repeats the last one the group gave, as Go does
  const readDeclarationSpec = (
    tokens: readonly GoToken[],
    start: number,
    file: string,
    iota: number,
    group?: { expression?: GoExpression },
  ): number => {
    const names: string[] = [];
    let position = start;
    while (tokens[position]?.kind === GoTokenKind.Identifier) {
      names.push(tokens[position]?.text ?? "");
      position++;
      if (!checkIsGoPunctuation(tokens[position], ",")) break;
      position++;
    }
    while (
      position < tokens.length &&
      tokens[position]?.kind !== GoTokenKind.Newline &&
      !checkIsGoPunctuation(tokens[position], "=")
    )
      position = checkIsGoPunctuation(tokens[position], "[") ? skipGoBrackets(tokens, position) : position + 1;
    if (!checkIsGoPunctuation(tokens[position], "=")) {
      const repeated = group?.expression;
      if (repeated !== undefined)
        for (const name of names)
          declarationMap.set(name, { expression: repeated, file, iota, line: tokens[start]?.line ?? 0 });
      return position + 1;
    }
    position++;
    for (const name of names) {
      const line = tokens[position]?.line ?? 0;
      const { end, expression } = parseGoExpression(tokens, position);
      declarationMap.set(name, { expression, file, iota, line });
      if (group !== undefined) group.expression = expression;
      position = checkIsGoPunctuation(tokens[end], ",") ? end + 1 : end;
    }
    return skipToNewline(tokens, position);
  };
  const readInitBody = (tokens: readonly GoToken[], start: number, file: string): number => {
    const end = skipGoBrackets(tokens, start);
    let position = start + 1;
    while (position < end) {
      const token = tokens[position];
      if (token?.kind !== GoTokenKind.Identifier) {
        position++;
        continue;
      }
      const name = token.text;
      let cursor = position + 1;
      const indexes: GoExpression[] = [];
      while (checkIsGoPunctuation(tokens[cursor], "[")) {
        const index = parseGoExpression(tokens, cursor + 1);
        indexes.push(index.expression);
        cursor = index.end + 1;
      }
      if (checkIsGoPunctuation(tokens[cursor], "=")) {
        const { end: expressionEnd, expression } = parseGoExpression(tokens, cursor + 1);
        if (indexes.length === 0) declarationMap.set(name, { expression, file, line: token.line });
        else elementAssignments.push({ expression, file, indexes, line: token.line, name });
        position = expressionEnd;
      } else position = skipToNewline(tokens, position);
    }
    return end;
  };
  for (const { path: file, source } of sources) {
    const tokens = tokenizeGo(source);
    readFieldWrites(tokens, file, fieldWriteMap);
    readCharFields(tokens, charFieldSet);
    let position = 0;
    while (position < tokens.length) {
      const token = tokens[position];
      if (token?.kind !== GoTokenKind.Identifier) position++;
      else if (DECLARATION_KEYWORDS.has(token.text) && checkIsGoPunctuation(tokens[position + 1], "(")) {
        const end = skipGoBrackets(tokens, position + 1);
        position += 2;
        // Each spec of a group is one index, which the spec's `iota` counts
        let iota = 0;
        // Only a const group repeats its expressions, a var group's specs with none having no value
        const group: undefined | { expression?: GoExpression } = token.text === "const" ? {} : undefined;
        while (position < end - 1)
          if (tokens[position]?.kind === GoTokenKind.Identifier) {
            position = readDeclarationSpec(tokens, position, file, iota, group);
            iota++;
          } else position++;
        position = end;
      } else if (DECLARATION_KEYWORDS.has(token.text)) position = readDeclarationSpec(tokens, position + 1, file, 0);
      else if (token.text === "func") {
        const isInit = tokens[position + 1]?.text === "init" && checkIsGoPunctuation(tokens[position + 2], "(");
        while (position < tokens.length && !checkIsGoPunctuation(tokens[position], "{")) position++;
        position = isInit ? readInitBody(tokens, position, file) : skipGoBrackets(tokens, position);
      } else if (token.text === "import" && checkIsGoPunctuation(tokens[position + 1], "("))
        position = skipGoBrackets(tokens, position + 1);
      else position = skipToNewline(tokens, position);
    }
  }
  const valueMap = new Map<string, GoValue | undefined>();
  const resolveName = (name: string): GoValue | undefined => {
    if (valueMap.has(name)) return valueMap.get(name);
    const declaration = declarationMap.get(name);
    // A qualified cooldown tag is its own value, as a `c.` field's write of one is, so a local bound to it is that tag
    if (declaration === undefined) return name.startsWith(GCSIM_COOLDOWN_TAG_PREFIX) ? name : undefined;
    // Marked first, so a name its own value reaches reads as having none
    valueMap.set(name, undefined);
    const { iota } = declaration;
    const value = evaluateGoExpression(declaration.expression, (operand) =>
      operand === "iota" && iota !== undefined ? iota : resolveName(operand),
    );
    valueMap.set(name, value);
    return value;
  };
  const constantMap = new Map<string, GoConstant>();
  for (const [name, { file, line }] of declarationMap) {
    const value = resolveName(name);
    if (value !== undefined) constantMap.set(name, { elementLines: {}, file, line, value });
  }
  for (const { expression, file, indexes, line, name } of elementAssignments) {
    const constant = constantMap.get(name);
    const value = evaluateGoExpression(expression, resolveName);
    const indexValues = indexes.map((index) => evaluateGoNumber(index, resolveName));
    if (constant === undefined || value === undefined || !Array.isArray(constant.value)) continue;
    if (!indexValues.every((index) => index !== undefined)) continue;
    // An intermediate level the package never made leaves no slice to assign into, so the assignment is skipped
    let target: GoValue[] | undefined = constant.value;
    for (const index of indexValues.slice(0, -1)) {
      const element: GoValue | undefined = target?.[index];
      target = Array.isArray(element) ? element : undefined;
    }
    const lastIndex = indexValues.at(-1);
    if (target === undefined || lastIndex === undefined) continue;
    target[lastIndex] = value;
    if (indexValues.length === 1 && constant.file === file) constant.elementLines[lastIndex] = line;
  }
  // A field of the package's own `char` struct whose writes are all one literal `=` is that constant, cited at its first
  // Write. Any other write, an increment, an `op=`, a non-literal one, or two writes that differ, gives it none
  // A field the struct does not declare, the embedded template's, is never resolved
  for (const [field, writes] of fieldWriteMap) {
    const [only] = writes;
    if (
      !charFieldSet.has(field) ||
      only?.value === undefined ||
      writes.some(({ value }) => !checkIsSameGoValue(value, only.value))
    )
      continue;
    constantMap.set(`c.${field}`, { elementLines: {}, file: only.file, line: only.line, value: only.value });
  }
  return constantMap;
};
