import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import { findKitModuleDeclaration } from "#src/services/genshinAssets/kits/module/findKitModuleDeclaration";
import ts from "typescript";

const BinaryOperatorMap: Partial<Record<ts.SyntaxKind, (left: number, right: number) => number>> = {
  [ts.SyntaxKind.AsteriskToken]: (left, right) => left * right,
  [ts.SyntaxKind.MinusToken]: (left, right) => left - right,
  [ts.SyntaxKind.PlusToken]: (left, right) => left + right,
};

// The numbers an expression of a kit module can be, read from its text alone: a literal, a constant, a sum, difference
// Or product of them, either branch of a conditional, or an argument a wrapper's parameter is bound to. None where any
// Part of it is read only as the kit plays
export const resolveKitModuleNumber = (
  source: KitModuleSource,
  node: ts.Expression,
  parameterArgumentMap: ReadonlyMap<ts.Symbol, ts.Expression> = new Map(),
): number[] | undefined => {
  if (ts.isNumericLiteral(node)) return [Number(node.text)];
  else if (ts.isParenthesizedExpression(node))
    return resolveKitModuleNumber(source, node.expression, parameterArgumentMap);
  else if (ts.isConditionalExpression(node)) {
    const whenTrue = resolveKitModuleNumber(source, node.whenTrue, parameterArgumentMap);
    const whenFalse = resolveKitModuleNumber(source, node.whenFalse, parameterArgumentMap);
    return whenTrue === undefined || whenFalse === undefined ? undefined : [...whenTrue, ...whenFalse];
  } else if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken)
    return resolveKitModuleNumber(source, node.operand, parameterArgumentMap)?.map((value) => -value);
  else if (ts.isBinaryExpression(node)) {
    const operate = BinaryOperatorMap[node.operatorToken.kind];
    const left = resolveKitModuleNumber(source, node.left, parameterArgumentMap);
    const right = resolveKitModuleNumber(source, node.right, parameterArgumentMap);
    if (operate === undefined || left?.length !== 1 || right?.length !== 1) return undefined;
    const [leftValue = 0] = left;
    const [rightValue = 0] = right;
    return [operate(leftValue, rightValue)];
  } else if (!ts.isIdentifier(node)) return undefined;
  const symbol = source.checker.getSymbolAtLocation(node);
  const argument = symbol === undefined ? undefined : parameterArgumentMap.get(symbol);
  if (argument !== undefined) return resolveKitModuleNumber(source, argument);
  const declaration = findKitModuleDeclaration(source, node);
  if (
    declaration !== undefined &&
    ts.isVariableDeclaration(declaration) &&
    declaration.initializer !== undefined &&
    (declaration.parent.flags & ts.NodeFlags.Const) !== 0
  )
    return resolveKitModuleNumber(source, declaration.initializer);
  const type = source.checker.getTypeAtLocation(node);
  return type.isNumberLiteral() ? [type.value] : undefined;
};
