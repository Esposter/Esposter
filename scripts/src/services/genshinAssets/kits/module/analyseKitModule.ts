import type { KitModuleAnalysis } from "#src/models/genshinAssets/kits/module/KitModuleAnalysis";
import type { KitModuleRegistration } from "#src/models/genshinAssets/kits/module/KitModuleRegistration";
import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";
import type { KitHit } from "genshin-world";

import { checkIsKitModuleFunction } from "#src/services/genshinAssets/kits/module/checkIsKitModuleFunction";
import { createKitSiteCollector } from "#src/services/genshinAssets/kits/module/createKitSiteCollector";
import { createKitTalentReadResolver } from "#src/services/genshinAssets/kits/module/createKitTalentReadResolver";
import { findKitRuntimeFunctions } from "#src/services/genshinAssets/kits/module/findKitRuntimeFunctions";
import { getEnclosingKitModuleFunction } from "#src/services/genshinAssets/kits/module/getEnclosingKitModuleFunction";
import { getKitModulePropertyName } from "#src/services/genshinAssets/kits/module/getKitModulePropertyName";
import { InvalidOperationError, Operation } from "@esposter/shared";
import ts from "typescript";

const CREATE_KIT_NAME_REGEX = /^create\w+Kit$/u;
const CHARACTER_ID_NAME_SUFFIX = "_CHARACTER_ID";
// The reach helpers, whose areas the builder reads from the hits that hold them
const AREA_CALLEE_REGEX = /^(?:create(?:Box|Circle|Fan)Reach|createTargetedHitArea)$/u;
// A hit's flat damage from its striker's stats, which the builder reads by calling it rather than from its text
const ADDITIVE_BASE_DAMAGE_BONUS_KEY = "additiveBaseDamageBonus" satisfies keyof KitHit;

// What a kit module's text gives its record: the values each behaviour reads from outside itself, its sites, and the
// Spans a probe wraps to read them as the kit is built. A behaviour is a function the kit runs after it is built, read
// Where it is made, and a call made while the kit is built that hands back a function, read where it is called
export const analyseKitModule = (program: ts.Program, file: string): KitModuleAnalysis => {
  const sourceFile = program.getSourceFile(file);
  if (sourceFile === undefined) throw new InvalidOperationError(Operation.Read, file, "is not in the program");
  const declarations = sourceFile.statements
    .filter((statement) => ts.isVariableStatement(statement))
    .flatMap((statement) => statement.declarationList.declarations);
  const createDeclaration = declarations.find(({ name }) => CREATE_KIT_NAME_REGEX.test(name.getText()));
  if (createDeclaration?.initializer === undefined || !checkIsKitModuleFunction(createDeclaration.initializer))
    throw new InvalidOperationError(Operation.Read, file, "has no create function");
  const source: KitModuleSource = {
    checker: program.getTypeChecker(),
    createFunction: createDeclaration.initializer,
    createName: createDeclaration.name.getText(),
    sourceFile,
  };
  const runtimeFunctions = findKitRuntimeFunctions(source);
  const checkIsRuntime = (node: ts.Node) => {
    const enclosingFunction = getEnclosingKitModuleFunction(node);
    return enclosingFunction !== undefined && runtimeFunctions.has(enclosingFunction);
  };
  const talentReadResolver = createKitTalentReadResolver(source);
  const { collectSites, sites } = createKitSiteCollector(source, talentReadResolver);
  const registrations: KitModuleRegistration[] = [];
  const register = (node: ts.Node, roots: readonly ts.Node[]) => {
    const siteIds = collectSites(roots, node);
    if (siteIds.length > 0) registrations.push({ end: node.getEnd(), siteIds, start: node.getStart() });
  };
  const visit = (node: ts.Node) => {
    if (checkIsKitModuleFunction(node) && runtimeFunctions.has(node)) {
      if (!checkIsRuntime(node) && !talentReadResolver.talentWrappers.has(node) && node.body !== undefined)
        register(node, [node.body]);
      return;
    } else if (
      ts.isCallExpression(node) &&
      !checkIsRuntime(node) &&
      !AREA_CALLEE_REGEX.test(node.expression.getText()) &&
      source.checker.getTypeAtLocation(node).getCallSignatures().length > 0 &&
      !(
        ts.isPropertyAssignment(node.parent) &&
        getKitModulePropertyName(node.parent.name) === ADDITIVE_BASE_DAMAGE_BONUS_KEY
      ) &&
      talentReadResolver.resolveTalentRead(node) === undefined
    )
      register(
        node,
        node.arguments.filter((argument) => !checkIsKitModuleFunction(argument)),
      );
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return {
    characterIdName: declarations.find(({ name }) => name.getText().endsWith(CHARACTER_ID_NAME_SUFFIX))?.name.getText(),
    createName: source.createName,
    file,
    registrations,
    sites,
  };
};
