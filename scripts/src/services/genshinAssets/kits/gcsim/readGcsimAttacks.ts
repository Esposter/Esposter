import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoExpression } from "#src/models/genshinAssets/kits/gcsim/GoExpression";
import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";
import { checkIsFieldSet } from "#src/services/genshinAssets/kits/gcsim/checkIsFieldSet";
import { checkIsGoPunctuation } from "#src/services/genshinAssets/kits/gcsim/checkIsGoPunctuation";
import { createGoScope } from "#src/services/genshinAssets/kits/gcsim/createGoScope";
import { evaluateGoExpression } from "#src/services/genshinAssets/kits/gcsim/evaluateGoExpression";
import { getGoRootName } from "#src/services/genshinAssets/kits/gcsim/getGoRootName";
import { getName } from "#src/services/genshinAssets/kits/gcsim/getName";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { readCopySource } from "#src/services/genshinAssets/kits/gcsim/readCopySource";
import { readGoAliases } from "#src/services/genshinAssets/kits/gcsim/readGoAliases";
import { readGoBranchAt } from "#src/services/genshinAssets/kits/gcsim/readGoBranchAt";
import { readConstantLoops } from "#src/services/genshinAssets/kits/gcsim/readGoConstantLoops";
import { readGoLocalSlice } from "#src/services/genshinAssets/kits/gcsim/readGoLocalSlice";
import { readGoNamedFunctions } from "#src/services/genshinAssets/kits/gcsim/readGoNamedFunctions";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { readGoStringConstants } from "#src/services/genshinAssets/kits/gcsim/readGoStringConstants";
import { readIterationAt } from "#src/services/genshinAssets/kits/gcsim/readIterationAt";
import { readReturnedFunction } from "#src/services/genshinAssets/kits/gcsim/readReturnedFunction";
import { readVariableName } from "#src/services/genshinAssets/kits/gcsim/readVariableName";
import { resolveGoAlias } from "#src/services/genshinAssets/kits/gcsim/resolveGoAlias";
import { resolveStringConstant } from "#src/services/genshinAssets/kits/gcsim/resolveStringConstant";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";

// The field an if on a constant loop's variable may set on a copy, by its gcsim name: the poise its hit deals in that
// Iteration. Other fields an if sets are not read
const ITERATION_POISE_FIELD = "PoiseDMG";

// The `AttackInfo` literals of a gcsim character's action files, each field read from the literal as written: its tags,
// Element by their gcsim names, its durability and poise evaluated through the package's constants, and
// The talent variable its multiplier is rooted in, followed through the locals naming a slice of it. The code reads in
// Source order, so an attack is the literal or copy its variable names as of the line: a `Mult` the code sets after a
// Literal is an attack of its own under the variable it names, and a copy `aiC2 = ai` is the source as of the copy with
// Its later sets, its site the copy's own line, not the literal's. A set or a literal inside an if or else is tagged with
// The branch it sits in, which a call after the branches reads
export const readGcsimAttacks = (
  sources: readonly GoSource[],
  constantMap: ReadonlyMap<string, GoConstant>,
  config: GcsimConfig,
): GcsimAttack[] => {
  const resolveName = (name: string) => constantMap.get(name)?.value;
  // A tag a `c.` field names is the tag the character's package writes it, and any other name is gcsim's own literal
  const resolveCooldownTag = (name: string | undefined) =>
    name === undefined ? undefined : resolveStringConstant(constantMap, name);
  return sources.flatMap(({ path: file, source }) => {
    const tokens = tokenizeGo(source);
    const namedFunctions = readGoNamedFunctions(tokens);
    const aliasMap = readGoAliases(tokens);
    const stringMap = readGoStringConstants(tokens);
    const readBranchAt = readGoBranchAt(tokens);
    const loops = readConstantLoops(tokens, createGoScope(tokens, constantMap), config);
    // An `Element` a constant loop's variable indexes into a local slice, `ele[i]`, is each iteration's own: the slice's
    // Entry at that index, with the line the slice is declared on, so the literal is one attack per iteration
    const readIndexedElements = (position: number, expression: GoExpression | undefined) => {
      if (
        expression?.kind !== GoExpressionKind.Index ||
        expression.target.kind !== GoExpressionKind.Identifier ||
        expression.index.kind !== GoExpressionKind.Identifier
      )
        return undefined;
      const variable = expression.index.name;
      const loop = loops.find(
        ({ bodyEnd, bodyStart, iterations }) =>
          bodyStart < position && position < bodyEnd && iterations[0]?.has(variable),
      );
      const slice = readGoLocalSlice(tokens, namedFunctions, expression.target.name, position);
      if (loop === undefined || slice === undefined) return undefined;
      return {
        values: loop.iterations.flatMap((iteration) => {
          const index = iteration.get(variable);
          if (index === undefined) return [];
          const entry = slice.elements[index];
          const element =
            entry?.kind === GoExpressionKind.Identifier && entry.name.startsWith("attributes.")
              ? entry.name
              : undefined;
          return [{ element, index, line: slice.line }];
        }),
        variable,
      };
    };
    // The attack placed at a position with the branch that position sits in, its key left out when there is none, so a
    // Copy's branch from its source does not carry over
    const withBranch = (attack: GcsimAttack, position: number): GcsimAttack => {
      const branch = readBranchAt(position);
      const placed: GcsimAttack = { ...attack, branch };
      if (branch === undefined) delete placed.branch;
      return placed;
    };
    const attacks: GcsimAttack[] = [];
    // The variable's own attack as of the line, the one no loop iteration holds
    const readOwnAttack = (variableName: string, line: number) =>
      attacks.findLast(
        (attack) => attack.variableName === variableName && attack.line < line && attack.iteration === undefined,
      );
    // A variant is only in its loop iteration, so a copy or set after it takes the variable's own attack instead, and
    // Only a variable with none takes the variants its loop literal left, one attack per iteration
    const readVariableAttacks = (variableName: string, line: number): GcsimAttack[] => {
      const ownAttack = readOwnAttack(variableName, line);
      if (ownAttack !== undefined) return [ownAttack];
      const priorAttacks = attacks.filter((attack) => attack.variableName === variableName && attack.line < line);
      const literalLine = priorAttacks.at(-1)?.line;
      return priorAttacks.filter((attack) => attack.line === literalLine);
    };
    for (const [position, token] of tokens.entries())
      if (token.text === "AttackInfo" && checkIsGoPunctuation(tokens[position + 1], "{")) {
        // A function's result type, `func (c *char) a1AttackInfo() info.AttackInfo {`, opens its body rather than a literal
        const typeStart = checkIsGoPunctuation(tokens[position - 1], ".") ? position - 2 : position;
        if (checkIsGoPunctuation(tokens[typeStart - 1], ")")) continue;
        const fieldMap = new Map<string, { expression: GoExpression; line: number }>();
        let cursor = position + 2;
        while (cursor < tokens.length && !checkIsGoPunctuation(tokens[cursor], "}")) {
          const keyToken = tokens[cursor];
          if (keyToken?.kind === GoTokenKind.Identifier && checkIsGoPunctuation(tokens[cursor + 1], ":")) {
            const { end, expression } = parseGoExpression(tokens, cursor + 2);
            fieldMap.set(keyToken.text, { expression, line: keyToken.line });
            cursor = end;
          } else cursor++;
        }
        const evaluateNumber = (key: string): number | undefined => {
          const field = fieldMap.get(key);
          return readGoNumber(field === undefined ? undefined : evaluateGoExpression(field.expression, resolveName));
        };
        const multiplierField = fieldMap.get("Mult");
        const poiseDamage = evaluateNumber("PoiseDMG");
        const poiseField = fieldMap.get("PoiseDMG");
        const abilExpression = fieldMap.get("Abil")?.expression;
        const variableName = readVariableName(tokens, position);
        const returnedBy =
          tokens[typeStart - 1]?.text === "return"
            ? variableName
            : readReturnedFunction(tokens, namedFunctions, position, variableName);
        const abilName = getName(abilExpression);
        const base: GcsimAttack = {
          abil:
            abilExpression?.kind === GoExpressionKind.String
              ? abilExpression.value
              : abilName === undefined
                ? undefined
                : stringMap.get(abilName),
          attackTag: getName(fieldMap.get("AttackTag")?.expression),
          durability: evaluateNumber("Durability"),
          element: getName(fieldMap.get("Element")?.expression),
          fieldLineMap: Object.fromEntries(Array.from(fieldMap, ([key, { line }]) => [key, line])),
          file,
          internalCooldownTag: resolveCooldownTag(getName(fieldMap.get("ICDTag")?.expression)),
          line: token.line,
          poiseDamage,
          poiseDamageVariable:
            poiseDamage === undefined && poiseField !== undefined ? getGoRootName(poiseField.expression) : undefined,
          ...(returnedBy !== undefined && { returnedBy }),
          siteLine: token.line,
          talentVariable:
            multiplierField === undefined
              ? undefined
              : resolveGoAlias(aliasMap, getGoRootName(multiplierField.expression), position),
          variableName,
        };
        const indexedElements = readIndexedElements(position, fieldMap.get("Element")?.expression);
        if (indexedElements === undefined) attacks.push(withBranch(base, position));
        else
          for (const { element, index, line } of indexedElements.values)
            attacks.push(
              withBranch(
                {
                  ...base,
                  element,
                  fieldLineMap: { ...base.fieldLineMap, Element: line },
                  iteration: { value: index, variable: indexedElements.variable },
                },
                position,
              ),
            );
      } else if (token.text === "Mult" && checkIsFieldSet(tokens, position)) {
        const literalAttacks = readVariableAttacks(tokens[position - 2]?.text ?? "", token.line);
        const talentVariable = resolveGoAlias(
          aliasMap,
          getGoRootName(parseGoExpression(tokens, position + 2).expression),
          position,
        );
        if (literalAttacks.length === 0 || talentVariable === undefined) continue;
        for (const literalAttack of literalAttacks)
          attacks.push(
            withBranch(
              {
                ...literalAttack,
                fieldLineMap: { ...literalAttack.fieldLineMap, Mult: token.line },
                line: token.line,
                talentVariable,
              },
              position,
            ),
          );
      } else if (token.text === ITERATION_POISE_FIELD && checkIsFieldSet(tokens, position)) {
        const iteration = readIterationAt(tokens, position, loops);
        const copyAttack = readOwnAttack(tokens[position - 2]?.text ?? "", token.line);
        const poiseDamage = readGoNumber(
          evaluateGoExpression(parseGoExpression(tokens, position + 2).expression, resolveName),
        );
        if (iteration === undefined || copyAttack === undefined || poiseDamage === undefined) continue;
        attacks.push(
          withBranch(
            {
              ...copyAttack,
              fieldLineMap: { ...copyAttack.fieldLineMap, [ITERATION_POISE_FIELD]: token.line },
              iteration,
              line: token.line,
              poiseDamage,
              poiseDamageVariable: undefined,
            },
            position,
          ),
        );
      } else {
        const copySource = readCopySource(tokens, position);
        const sourceAttacks = copySource === undefined ? [] : readVariableAttacks(copySource, token.line);
        for (const sourceAttack of sourceAttacks) {
          // The copy is returned only where its own name is, not where its source's is
          const copy: GcsimAttack = {
            ...sourceAttack,
            line: token.line,
            siteLine: token.line,
            variableName: token.text,
          };
          delete copy.returnedBy;
          const returnedBy = readReturnedFunction(tokens, namedFunctions, position, token.text);
          attacks.push(withBranch(returnedBy === undefined ? copy : { ...copy, returnedBy }, position));
        }
      }

    return attacks;
  });
};
