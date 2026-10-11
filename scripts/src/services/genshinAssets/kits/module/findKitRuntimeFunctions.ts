import type { KitModuleFunction } from "#src/models/genshinAssets/kits/module/KitModuleFunction";
import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import { checkIsKitModuleFunction } from "#src/services/genshinAssets/kits/module/checkIsKitModuleFunction";
import { getEnclosingKitModuleFunction } from "#src/services/genshinAssets/kits/module/getEnclosingKitModuleFunction";
import { getOrCreate } from "@esposter/shared";
import ts from "typescript";

// A callee that runs the function it is handed as it is called: an array's iteration, or `Array.from`'s map
const ITERATION_CALLEE_REGEX =
  /^(?:Array\.from|.*\.(?:every|filter|find|findIndex|findLast|flatMap|map|reduce|some|toSorted))$/u;

// The functions of a kit module a behaviour runs after the kit is built, rather than while it is built: every function
// But the create function, one it calls or iterates with at once, and a helper only ever called while the kit is built
export const findKitRuntimeFunctions = (source: KitModuleSource): Set<KitModuleFunction> => {
  const { checker, createFunction, sourceFile } = source;
  const functions: KitModuleFunction[] = [];
  const collectFunctions = (node: ts.Node) => {
    if (checkIsKitModuleFunction(node)) functions.push(node);
    ts.forEachChild(node, collectFunctions);
  };
  collectFunctions(sourceFile);
  const symbolIdentifiersMap = new Map<ts.Symbol, ts.Identifier[]>();
  const collectIdentifiers = (node: ts.Node) => {
    if (ts.isIdentifier(node)) {
      const symbol = checker.getSymbolAtLocation(node);
      if (symbol !== undefined) getOrCreate(symbolIdentifiersMap, symbol, () => []).push(node);
    }

    ts.forEachChild(node, collectIdentifiers);
  };
  collectIdentifiers(sourceFile);
  const findReferences = (name: ts.Identifier): ts.Identifier[] => {
    const symbol = checker.getSymbolAtLocation(name);
    return symbol === undefined
      ? []
      : (symbolIdentifiersMap.get(symbol) ?? []).filter((identifier) => identifier !== name);
  };
  const helperReferenceMap = new Map<KitModuleFunction, ts.Identifier[]>();
  for (const moduleFunction of functions)
    if (
      ts.isVariableDeclaration(moduleFunction.parent) &&
      ts.isIdentifier(moduleFunction.parent.name) &&
      moduleFunction.parent.initializer === moduleFunction
    )
      helperReferenceMap.set(moduleFunction, findReferences(moduleFunction.parent.name));
  // Whether each function runs after the kit is built, absent while it hangs on a function not yet settled
  const isRuntimeMap = new Map<KitModuleFunction, boolean>([[createFunction, false]]);
  const classify = (moduleFunction: KitModuleFunction): boolean | undefined => {
    const enclosingFunction = getEnclosingKitModuleFunction(moduleFunction);
    const isEnclosingRuntime = enclosingFunction === undefined ? false : isRuntimeMap.get(enclosingFunction);
    const { parent } = moduleFunction;
    const call = ts.isParenthesizedExpression(parent) ? parent.parent : parent;
    if (
      ts.isCallExpression(call) &&
      (call.expression === moduleFunction ||
        call.expression === parent ||
        (call.arguments.includes(moduleFunction as ts.Expression) &&
          ITERATION_CALLEE_REGEX.test(call.expression.getText())))
    )
      return isEnclosingRuntime;
    const references = helperReferenceMap.get(moduleFunction);
    if (references === undefined) return true;
    const referenceRuntimes = new Set(
      references.map((reference) => {
        if (!(ts.isCallExpression(reference.parent) && reference.parent.expression === reference)) return true;
        const callerFunction = getEnclosingKitModuleFunction(reference);
        if (callerFunction === undefined || callerFunction === moduleFunction) return false;
        return isRuntimeMap.get(callerFunction);
      }),
    );
    if (referenceRuntimes.has(true)) return true;
    else if (referenceRuntimes.has(undefined)) return undefined;
    return false;
  };
  // Passes until one settles nothing, as a helper called only from helpers settles after its callers
  for (let isSettling = true; isSettling;) {
    isSettling = false;
    for (const moduleFunction of functions) {
      if (isRuntimeMap.has(moduleFunction)) continue;
      const isRuntime = classify(moduleFunction);
      if (isRuntime === undefined) continue;
      isRuntimeMap.set(moduleFunction, isRuntime);
      isSettling = true;
    }
  }
  // A function still unsettled hangs on a cycle of helpers no build reaches, so it runs only after the kit is built
  return new Set(functions.filter((moduleFunction) => isRuntimeMap.get(moduleFunction) !== false));
};
