import type { KitModuleSource } from "#src/models/genshinAssets/kits/module/KitModuleSource";

import { GENERIC_KIT_CONTEXT_NAME_REGEX } from "#src/services/genshinAssets/kits/constants";
import { getKitModuleContextName } from "#src/services/genshinAssets/kits/module/getKitModuleContextName";
import { toKitModuleName } from "#src/services/genshinAssets/kits/module/toKitModuleName";
import ts from "typescript";

// A constant naming one field of a hit, whose words before the field's name what the hit is
const HIT_FIELD_CONSTANT_REGEX =
  /^(?<prefix>[A-Z][A-Z0-9_]*?)_(?:HIT_AREA|HITMARK_FRAMES|INDEX|POISE_DAMAGE|TALENT_MULTIPLIER)$/u;

// The name a hit or action literal of a kit module goes by: where it sits, unless that names only where it is played,
// When it goes by the hit its constants name, the one most of them name
export const getKitLiteralName = (source: KitModuleSource, node: ts.ObjectLiteralExpression): string => {
  const contextName = getKitModuleContextName(source, node);
  if (!GENERIC_KIT_CONTEXT_NAME_REGEX.test(contextName)) return contextName;
  const prefixCountMap = new Map<string, number>();
  const visit = (child: ts.Node) => {
    const prefix = ts.isIdentifier(child) ? HIT_FIELD_CONSTANT_REGEX.exec(child.text)?.groups?.prefix : undefined;
    if (prefix !== undefined) prefixCountMap.set(prefix, (prefixCountMap.get(prefix) ?? 0) + 1);
    ts.forEachChild(child, visit);
  };
  visit(node);
  const [prefix] =
    [...prefixCountMap].toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount).at(0) ?? [];
  return prefix === undefined ? contextName : toKitModuleName([prefix]);
};
