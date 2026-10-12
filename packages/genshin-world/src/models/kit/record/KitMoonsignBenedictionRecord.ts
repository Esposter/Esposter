import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { z } from "zod";

// A Moonsign character's Benediction in a kit's record: the reactions of its party's it turns Lunar, none for one that
// Only counts toward the Moonsign. The bonus it adds is its module's
export interface KitMoonsignBenedictionRecord {
  lunarReactionTypes: LunarReactionType[];
}

export const kitMoonsignBenedictionRecordSchema = z.strictObject({
  lunarReactionTypes: z.array(z.enum(LunarReactionType)),
}) satisfies z.ZodType<KitMoonsignBenedictionRecord>;
