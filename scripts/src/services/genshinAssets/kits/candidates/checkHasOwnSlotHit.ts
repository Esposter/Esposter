import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";
import { kitParameterSchema } from "genshin-world";

// Whether a slot keeps a hit of its own beside its named lists: one of its hits joins a proud skill group at an index no
// Named list's hit joins at, as gcsim's Moonjade Descent hits beside its White Jade Radishes of the same group
export const checkHasOwnSlotHit = (
  valueMap: ReadonlyMap<string, unknown>,
  slot: string,
  namedParameters: ReadonlySet<string>,
): boolean => {
  for (const [path, value] of valueMap) {
    const hitPath = KIT_HIT_MULTIPLIER_REGEX.exec(path)?.groups?.hitPath;
    if (hitPath === undefined || !hitPath.startsWith(`${slot}.hits.`)) continue;
    const parameter = kitParameterSchema.safeParse(value).data;
    if (typeof parameter !== "object" || !namedParameters.has(`${parameter.proudSkillGroupId}.${parameter.index}`))
      return true;
  }
  return false;
};
