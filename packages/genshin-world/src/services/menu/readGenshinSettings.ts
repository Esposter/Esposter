import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { genshinSettingsSchema } from "#src/services/menu/genshinSettingsSchema";
import { getResult } from "@esposter/shared";

// The settings a device kept, read over its defaults. Text that does not parse is logged, and a stored value the schema
// Refuses is read as none, so an edited or out-of-date value never reaches the screen unchecked
export const readGenshinSettings = (raw: null | string, defaults: GenshinSettings): GenshinSettings => {
  if (raw === null) return defaults;
  // oxlint-disable-next-line no-restricted-properties -- the settings hold no instants, so there is no Date for a reviver to restore
  const parsedJson: unknown = getResult(() => JSON.parse(raw))
    .orTee(console.error)
    .unwrapOr(undefined);
  const result = genshinSettingsSchema.safeParse(parsedJson);
  return result.success ? { ...defaults, ...result.data } : defaults;
};
