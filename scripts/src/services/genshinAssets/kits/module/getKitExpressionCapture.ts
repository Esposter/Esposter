import type { KitCapture } from "#src/models/genshinAssets/kits/module/KitCapture";
import type { KitAction, KitHit } from "genshin-world";

import { KitCaptureKind } from "#src/models/genshinAssets/kits/module/KitCaptureKind";
import { getKitCaptureKind } from "#src/services/genshinAssets/kits/module/getKitCaptureKind";
import { getKitModulePropertyName } from "#src/services/genshinAssets/kits/module/getKitModulePropertyName";
import ts from "typescript";

// The property a literal must write to be the hit or action its context types it as, rather than a part of one spread
// Into it
const KitCaptureKindRequiredKeyMap: Partial<Record<KitCaptureKind, string>> = {
  [KitCaptureKind.Action]: "hits" satisfies keyof KitAction,
  [KitCaptureKind.Hit]: "hitArea" satisfies keyof KitHit,
};

// What an expression of a kit module is to its record, if anything: an object literal by the type its context gives it,
// Where it writes the property that makes it one, and any other expression by its own type
export const getKitExpressionCapture = (checker: ts.TypeChecker, node: ts.Expression): KitCapture | undefined => {
  if (!ts.isObjectLiteralExpression(node)) return getKitCaptureKind(checker, checker.getTypeAtLocation(node));
  const contextualType = checker.getContextualType(node);
  const capture = contextualType === undefined ? undefined : getKitCaptureKind(checker, contextualType);
  const requiredKey = capture === undefined ? undefined : KitCaptureKindRequiredKeyMap[capture.captureKind];
  return requiredKey === undefined ||
    node.properties.some(
      (property) => property.name !== undefined && getKitModulePropertyName(property.name) === requiredKey,
    )
    ? capture
    : undefined;
};
