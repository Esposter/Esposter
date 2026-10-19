import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { WikiInternalCooldownTagMap } from "#src/services/genshinAssets/kits/wiki/WikiInternalCooldownTagMap";
import { InternalCooldownTag } from "genshin-world";
import { z } from "zod";

const WIKI_NO_INTERNAL_COOLDOWN_TAG = "none";
const internalCooldownTagSchema = z.enum(InternalCooldownTag) satisfies z.ZodType<InternalCooldownTag>;

// The value a row gives the field of a kit's record its path's last key names, or undefined where the row gives no
// Such field. A row whose ICD tag is `none` gives the field an undefined value, which the row still gives. A tag the
// Enum does not name is given by no row, as the record would reject it, though the row's poise still stands
export const readWikiRowValue = (row: WikiAdvancedProperty, field: string): undefined | { value: unknown } => {
  switch (field) {
    case "gauge":
      return row.gauge === undefined ? undefined : { value: row.gauge };
    case "internalCooldownTag": {
      if (row.internalCooldownTag === undefined) return undefined;
      if (row.internalCooldownTag === WIKI_NO_INTERNAL_COOLDOWN_TAG) return { value: undefined };
      const tag = WikiInternalCooldownTagMap[row.internalCooldownTag] ?? row.internalCooldownTag;
      return internalCooldownTagSchema.safeParse(tag).success ? { value: tag } : undefined;
    }
    case "poiseDamage":
      return row.poise === undefined ? undefined : { value: row.poise };
    default:
      return undefined;
  }
};
