import type { KitCapture } from "#src/models/genshinAssets/kits/module/KitCapture";

import { KitCaptureKind } from "#src/models/genshinAssets/kits/module/KitCaptureKind";
import ts from "typescript";

const TypeNameKitCaptureKindMap: Partial<Record<string, KitCaptureKind>> = {
  AttackArea: KitCaptureKind.Area,
  KitAction: KitCaptureKind.Action,
  KitHit: KitCaptureKind.Hit,
  KitStanceActions: KitCaptureKind.Stance,
};

const getTypeName = (type: ts.Type): string | undefined => type.aliasSymbol?.name ?? type.getSymbol()?.name;

// What a value of a type is to a kit's record, a hit, an action, an area or a stance's actions or a list of them, if it
// Is any, an optional one taken as its value
export const getKitCaptureKind = (checker: ts.TypeChecker, type: ts.Type): KitCapture | undefined => {
  const types = type.isUnion() ? type.types.filter((member) => (member.flags & ts.TypeFlags.Undefined) === 0) : [type];
  const [single] = types;
  if (single === undefined || types.length > 1) return undefined;
  const captureKind = TypeNameKitCaptureKindMap[getTypeName(single) ?? ""];
  if (captureKind !== undefined) return { captureKind };
  else if (!checker.isArrayType(single)) return undefined;
  const [elementType] = checker.getTypeArguments(single as ts.TypeReference);
  const elementCaptureKind =
    elementType === undefined ? undefined : TypeNameKitCaptureKindMap[getTypeName(elementType) ?? ""];
  return elementCaptureKind === undefined ? undefined : { captureKind: elementCaptureKind, isListed: true };
};
