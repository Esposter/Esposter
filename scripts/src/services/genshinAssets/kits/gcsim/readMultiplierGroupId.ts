import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { kitParameterSchema } from "genshin-world";

// The proud skill group an overlay's multiplier names, the one a named hit joins its talent by
export const readMultiplierGroupId = (overlay: KitOverlay, key: string): number | undefined => {
  const parameter = kitParameterSchema.safeParse(overlay[key]?.value).data;
  return typeof parameter === "object" ? parameter.proudSkillGroupId : undefined;
};
