import type { KitModuleSite } from "#src/models/genshinAssets/kits/module/KitModuleSite";
import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";
import type { KitSiteCollector } from "#src/models/genshinAssets/kits/module/KitSiteCollector";
import type { KitTalentReadResolver } from "#src/models/genshinAssets/kits/module/KitTalentReadResolver";
import type { Except } from "type-fest";

import { KitCaptureKind } from "#src/models/genshinAssets/kits/module/KitCaptureKind";
import { KitModuleSiteKind } from "#src/models/genshinAssets/kits/module/KitModuleSiteKind";
import { checkIsKitFramesDivision } from "#src/services/genshinAssets/kits/module/checkIsKitFramesDivision";
import { checkIsKitModuleFunction } from "#src/services/genshinAssets/kits/module/checkIsKitModuleFunction";
import { checkIsKitModuleIndependent } from "#src/services/genshinAssets/kits/module/checkIsKitModuleIndependent";
import { checkIsKitModuleNode } from "#src/services/genshinAssets/kits/module/checkIsKitModuleNode";
import { findKitModuleDeclaration } from "#src/services/genshinAssets/kits/module/findKitModuleDeclaration";
import { getKitCaptureName } from "#src/services/genshinAssets/kits/module/getKitCaptureName";
import { getKitElementName } from "#src/services/genshinAssets/kits/module/getKitElementName";
import { getKitExpressionCapture } from "#src/services/genshinAssets/kits/module/getKitExpressionCapture";
import { getKitLiteralName } from "#src/services/genshinAssets/kits/module/getKitLiteralName";
import { getKitModuleChainName } from "#src/services/genshinAssets/kits/module/getKitModuleChainName";
import { getKitModuleContextName } from "#src/services/genshinAssets/kits/module/getKitModuleContextName";
import { getKitModulePropertyName } from "#src/services/genshinAssets/kits/module/getKitModulePropertyName";
import { toKitModuleName } from "#src/services/genshinAssets/kits/module/toKitModuleName";
import ts from "typescript";

const FIELD_CAPTURE_KINDS: ReadonlySet<KitCaptureKind> = new Set([KitCaptureKind.Action, KitCaptureKind.Hit]);
// Whether an identifier reads a value, rather than naming a property, a callee, a type or a binding
const checkIsValueIdentifier = (node: ts.Identifier) => {
  const { parent } = node;
  return !(
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isCallExpression(parent) && parent.expression === node) ||
    ts.isTypeReferenceNode(parent) ||
    ts.isBindingElement(parent) ||
    ts.isParameter(parent) ||
    ts.isVariableDeclaration(parent)
  );
};

// Reads the sites of a kit module a scope evaluates: each talent read, each hit, action, area or stance read whole from
// Outside the scope, each frame count, each field of a literal the scope builds whose others it reads, and each number
// Read from outside it. A binding derived from a talent or a frame gives the reads it is derived from too, which stand
// In its place where its own value is no parameter
export const createKitSiteCollector = (
  source: KitModuleSource,
  { resolveTalentRead, talentWrappers }: KitTalentReadResolver,
): KitSiteCollector => {
  const { checker, sourceFile } = source;
  const sites: KitModuleSite[] = [];
  const siteMap = new Map<string, KitModuleSite>();
  const addSite = (node: ts.Node, site: Except<KitModuleSite, "expressionText" | "id" | "line">): KitModuleSite => {
    const id = `${node.getStart()}-${node.getEnd()}${site.fieldKey === undefined ? "" : `.${site.fieldKey}`}`;
    const knownSite = siteMap.get(id);
    if (knownSite !== undefined) return knownSite;
    const newSite: KitModuleSite = {
      expressionText: node.getText(),
      id,
      line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      ...site,
    };
    sites.push(newSite);
    siteMap.set(id, newSite);
    return newSite;
  };
  const checkIsInTalentWrapper = (node: ts.Node) => {
    for (let { parent } = node; parent !== undefined; { parent } = parent) if (talentWrappers.has(parent)) return true;
    return false;
  };
  const checkIsNumberType = (node: ts.Expression) => {
    const type = checker.getTypeAtLocation(node);
    if ((type.flags & ts.TypeFlags.NumberLike) !== 0) return true;
    else if (!checker.isArrayType(type)) return false;
    const [elementType] = checker.getTypeArguments(type as ts.TypeReference);
    return elementType !== undefined && (elementType.flags & ts.TypeFlags.NumberLike) !== 0;
  };
  const checkContainsDerivation = (node: ts.Node): boolean =>
    checkIsKitFramesDivision(node) ||
    (ts.isCallExpression(node) && resolveTalentRead(node) !== undefined) ||
    (ts.forEachChild(node, (child) => checkContainsDerivation(child) || undefined) ?? false);
  // The longest property or element read over an identifier whose every index the scope does not set, stopping short
  // Of a method's name
  const getValueChain = (identifier: ts.Identifier, scope: ts.Node): ts.Expression => {
    let chain: ts.Expression = identifier;
    for (;;) {
      const { parent } = chain;
      if (ts.isPropertyAccessExpression(parent) && parent.expression === chain) {
        if (ts.isCallExpression(parent.parent) && parent.parent.expression === parent) return chain;
        chain = parent;
      } else if (
        (ts.isElementAccessExpression(parent) &&
          parent.expression === chain &&
          checkIsKitModuleIndependent(source, parent.argumentExpression, scope)) ||
        ts.isNonNullExpression(parent)
      )
        chain = parent;
      else return chain;
    }
  };
  const collectSites = (roots: readonly ts.Node[], scope: ts.Node): string[] => {
    const siteIds: string[] = [];
    const register = (site: KitModuleSite) => {
      if (!siteIds.includes(site.id)) siteIds.push(site.id);
    };
    const derivedDeclarations = new Set<ts.Node>();
    const collectCapture = (node: ts.Expression): boolean => {
      const capture = getKitExpressionCapture(checker, node);
      if (capture === undefined || ts.isObjectLiteralExpression(node.parent)) return false;
      const elements = capture.isListed && ts.isArrayLiteralExpression(node) ? node.elements : [];
      const elementCaptures = elements.map((element) =>
        ts.isSpreadElement(element) ? undefined : getKitExpressionCapture(checker, element),
      );
      // A list literal is read element by element, each by its own name, where each element is one of what it lists
      if (
        elements.length > 0 &&
        elementCaptures.every((elementCapture) => elementCapture !== undefined && !elementCapture.isListed)
      )
        for (const [index, element] of elements.entries())
          register(
            addSite(element, {
              captureKind: elementCaptures[index]?.captureKind,
              kind: KitModuleSiteKind.Capture,
              name: getKitElementName(source, element),
            }),
          );
      else
        register(addSite(node, { ...capture, kind: KitModuleSiteKind.Capture, name: getKitCaptureName(source, node) }));
      return true;
    };
    const collectFrames = (node: ts.BinaryExpression) => {
      if (checkIsKitModuleIndependent(source, node.left, scope)) {
        const numerator = ts.isParenthesizedExpression(node.left) ? node.left.expression : node.left;
        register(
          addSite(numerator, {
            kind: KitModuleSiteKind.Frames,
            name: ts.isIdentifier(numerator)
              ? toKitModuleName([numerator.text])
              : getKitModuleContextName(source, node),
          }),
        );
        return;
      }
      const visitTerm = (term: ts.Node) => {
        if (ts.isNumericLiteral(term))
          register(addSite(term, { kind: KitModuleSiteKind.Frames, name: getKitModuleContextName(source, node) }));
        else if (
          ts.isIdentifier(term) &&
          checkIsValueIdentifier(term) &&
          checkIsKitModuleIndependent(source, term, scope)
        ) {
          const declaration = findKitModuleDeclaration(source, term);
          const chain = getValueChain(term, scope);
          if (declaration !== undefined && checkIsKitModuleNode(source, declaration) && checkIsNumberType(chain))
            register(addSite(chain, { kind: KitModuleSiteKind.Frames, name: getKitModuleChainName(source, chain) }));
          else ts.forEachChild(term, visitTerm);
        } else ts.forEachChild(term, visitTerm);
      };
      visitTerm(node.left);
    };
    const collectFields = (node: ts.ObjectLiteralExpression): boolean => {
      const capture = getKitExpressionCapture(checker, node);
      if (capture === undefined || !FIELD_CAPTURE_KINDS.has(capture.captureKind) || capture.isListed) return false;
      const literalName = getKitLiteralName(source, node);
      for (const property of node.properties) {
        const fieldKey =
          ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)
            ? getKitModulePropertyName(property.name)
            : undefined;
        const value = ts.isPropertyAssignment(property)
          ? property.initializer
          : ts.isShorthandPropertyAssignment(property)
            ? property.name
            : property;
        if (
          fieldKey === undefined ||
          checkIsKitModuleFunction(value) ||
          !checkIsKitModuleIndependent(source, value, scope)
        )
          visit(value);
        else if (checker.getTypeAtLocation(value).getCallSignatures().length === 0)
          register(
            addSite(value, {
              captureKind: capture.captureKind,
              fieldKey,
              kind: KitModuleSiteKind.Field,
              literalId: `${node.getStart()}`,
              name: literalName,
            }),
          );
      }
      return true;
    };
    const collectValue = (node: ts.Identifier) => {
      const declaration = findKitModuleDeclaration(source, node);
      if (
        declaration === undefined ||
        !checkIsKitModuleNode(source, declaration) ||
        ts.isFunctionDeclaration(declaration) ||
        (ts.isVariableDeclaration(declaration) &&
          declaration.initializer !== undefined &&
          checkIsKitModuleFunction(declaration.initializer))
      )
        return;
      const chain = getValueChain(node, scope);
      const capture = getKitExpressionCapture(checker, chain);
      if (capture === undefined && !checkIsNumberType(chain)) return;
      const initializer = ts.isVariableDeclaration(declaration) ? declaration.initializer : undefined;
      const isFramesAsSeconds = initializer !== undefined && checkIsKitFramesDivision(initializer);
      const site = addSite(chain, {
        ...capture,
        kind: capture === undefined ? KitModuleSiteKind.Value : KitModuleSiteKind.Capture,
        name: getKitModuleChainName(source, chain),
        ...(isFramesAsSeconds && { isFramesAsSeconds: true }),
      });
      register(site);
      if (
        capture !== undefined ||
        chain !== node ||
        isFramesAsSeconds ||
        initializer === undefined ||
        derivedDeclarations.has(declaration) ||
        !checkContainsDerivation(initializer)
      )
        return;
      derivedDeclarations.add(declaration);
      const siteCount = sites.length;
      visit(initializer);
      for (const derivedSite of sites.slice(siteCount)) derivedSite.derivedSiteId ??= site.id;
    };
    const visit = (node: ts.Node): void => {
      const talentRead =
        ts.isCallExpression(node) && !checkIsInTalentWrapper(node) ? resolveTalentRead(node) : undefined;
      if (talentRead !== undefined)
        addSite(node, { ...talentRead, kind: KitModuleSiteKind.Talent, name: getKitModuleContextName(source, node) });
      else if (
        ts.isExpression(node) &&
        !ts.isIdentifier(node) &&
        checkIsKitModuleIndependent(source, node, scope) &&
        collectCapture(node)
      )
        return;
      else if (checkIsKitFramesDivision(node)) collectFrames(node);
      else if (ts.isObjectLiteralExpression(node) && collectFields(node)) return;
      else if (
        ts.isIdentifier(node) &&
        checkIsValueIdentifier(node) &&
        checkIsKitModuleIndependent(source, node, scope)
      )
        collectValue(node);
      else ts.forEachChild(node, visit);
    };
    for (const root of roots) visit(root);
    return siteIds;
  };
  return { collectSites, sites };
};
