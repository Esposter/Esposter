import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import { GENERIC_KIT_CONTEXT_NAME_REGEX } from "#src/services/genshinAssets/kits/constants";
import { getKitCalleeName } from "#src/services/genshinAssets/kits/module/getKitCalleeName";
import { getKitLiteralName } from "#src/services/genshinAssets/kits/module/getKitLiteralName";
import { getKitModuleContextName } from "#src/services/genshinAssets/kits/module/getKitModuleContextName";
import ts from "typescript";

// The name a value a kit module captures whole goes by: its literal's name, or where it sits, unless that names only
// Where it is played and a call makes it, when it goes by the function that makes it
export const getKitCaptureName = (source: KitModuleSource, node: ts.Expression): string => {
  if (ts.isObjectLiteralExpression(node)) return getKitLiteralName(source, node);
  const contextName = getKitModuleContextName(source, node);
  return (
    (GENERIC_KIT_CONTEXT_NAME_REGEX.test(contextName) && ts.isCallExpression(node)
      ? getKitCalleeName(node)
      : undefined) ?? contextName
  );
};
