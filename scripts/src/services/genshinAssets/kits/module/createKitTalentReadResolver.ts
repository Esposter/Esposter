import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";
import type { KitTalentRead } from "#src/models/genshinAssets/kits/module/KitTalentRead";
import type { KitTalentReadResolver } from "#src/models/genshinAssets/kits/module/KitTalentReadResolver";

import { checkIsKitModuleNode } from "#src/services/genshinAssets/kits/module/checkIsKitModuleNode";
import { findKitModuleDeclaration } from "#src/services/genshinAssets/kits/module/findKitModuleDeclaration";
import { resolveKitModuleNumber } from "#src/services/genshinAssets/kits/module/resolveKitModuleNumber";
import { getTalentMultiplier } from "genshin-world";
import ts from "typescript";

// Wrappers deep enough for a kit's talent read through a helper over a helper, the deepest in the kits
const MAXIMUM_WRAPPER_DEPTH = 3;

// The body of an arrow function that is one expression, or one return of one
const getArrowBody = (arrowFunction: ts.ArrowFunction): ts.Expression | undefined => {
  if (!ts.isBlock(arrowFunction.body)) return arrowFunction.body;
  const [statement] = arrowFunction.body.statements;
  return arrowFunction.body.statements.length === 1 && statement !== undefined && ts.isReturnStatement(statement)
    ? statement.expression
    : undefined;
};

// Reads a kit module's talent reads: a call of getTalentMultiplier, or of a function whose body is one, its group and
// Index read from the text where they are constants or a choice of them. Every wrapper is found before any read is
// Taken, so none of their bodies is read as a read of its own
export const createKitTalentReadResolver = (source: KitModuleSource): KitTalentReadResolver => {
  const talentWrappers = new Set<ts.Node>();
  const resolveTalentRead = (
    call: ts.CallExpression,
    parameterArgumentMap: ReadonlyMap<ts.Symbol, ts.Expression> = new Map(),
    depth = 0,
  ): KitTalentRead | undefined => {
    const callee = call.expression;
    if (!ts.isIdentifier(callee) || depth > MAXIMUM_WRAPPER_DEPTH) return undefined;
    else if (callee.text === getTalentMultiplier.name) {
      const [, groupArgument, , indexArgument] = call.arguments;
      const groups =
        groupArgument === undefined ? undefined : resolveKitModuleNumber(source, groupArgument, parameterArgumentMap);
      const indexes =
        indexArgument === undefined ? undefined : resolveKitModuleNumber(source, indexArgument, parameterArgumentMap);
      const [proudSkillGroupId] = groups ?? [];
      return groups?.length === 1 && proudSkillGroupId !== undefined && indexes !== undefined
        ? { parameters: indexes.map((index) => ({ index, proudSkillGroupId })) }
        : {};
    }
    const declaration = findKitModuleDeclaration(source, callee);
    if (
      declaration === undefined ||
      !ts.isVariableDeclaration(declaration) ||
      declaration.initializer === undefined ||
      !ts.isArrowFunction(declaration.initializer)
    )
      return undefined;
    const wrapper = declaration.initializer;
    const body = getArrowBody(wrapper);
    if (body === undefined || !ts.isCallExpression(body)) return undefined;
    const wrapperParameterArgumentMap = new Map(parameterArgumentMap);
    for (const [position, parameter] of wrapper.parameters.entries()) {
      const symbol = source.checker.getSymbolAtLocation(parameter.name);
      const argument = call.arguments[position];
      if (symbol !== undefined && argument !== undefined) wrapperParameterArgumentMap.set(symbol, argument);
    }
    const talentRead = resolveTalentRead(body, wrapperParameterArgumentMap, depth + 1);
    if (talentRead !== undefined && checkIsKitModuleNode(source, wrapper)) talentWrappers.add(wrapper);
    return talentRead;
  };
  const findWrappers = (node: ts.Node) => {
    if (ts.isCallExpression(node)) resolveTalentRead(node);
    ts.forEachChild(node, findWrappers);
  };
  findWrappers(source.sourceFile);
  return { resolveTalentRead: (call) => resolveTalentRead(call), talentWrappers };
};
