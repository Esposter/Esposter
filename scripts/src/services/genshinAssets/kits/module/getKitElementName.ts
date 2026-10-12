import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import { getKitCalleeName } from "#src/services/genshinAssets/kits/module/getKitCalleeName";
import { getKitLiteralName } from "#src/services/genshinAssets/kits/module/getKitLiteralName";
import { getKitModuleChainName } from "#src/services/genshinAssets/kits/module/getKitModuleChainName";
import ts from "typescript";

// The name one element of a list literal of a kit module goes by: its literal's name, the function that makes it, or
// The binding it reads
export const getKitElementName = (source: KitModuleSource, element: ts.Expression): string =>
  ts.isObjectLiteralExpression(element)
    ? getKitLiteralName(source, element)
    : ((ts.isCallExpression(element) ? getKitCalleeName(element) : undefined) ??
      getKitModuleChainName(source, element));
