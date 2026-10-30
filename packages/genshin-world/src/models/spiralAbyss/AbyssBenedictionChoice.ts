import { AbyssBenedictionIcon } from "#src/models/spiralAbyss/AbyssBenedictionIcon";
import { AbyssBenedictionScope } from "#src/models/spiralAbyss/AbyssBenedictionScope";
import { z } from "zod";

// One Benediction a chamber's list offers: its id in the game's tower buff table, the weight the list draws it by, and the
// Text hash of its description, which the game's name text holds. Its glyph and the span it lasts are absent where the
// Published record does not carry them yet
export interface AbyssBenedictionChoice {
  descriptionTextHash: number;
  // The glyph its card draws in the diamond
  icon?: AbyssBenedictionIcon;
  // Where it lasts: the floor it is chosen on, or the chamber alone
  scope?: AbyssBenedictionScope;
  towerBuffId: number;
  weight: number;
}

export const abyssBenedictionChoiceSchema = z.object({
  descriptionTextHash: z.int().positive(),
  icon: z.enum(AbyssBenedictionIcon).optional(),
  scope: z.enum(AbyssBenedictionScope).optional(),
  towerBuffId: z.int().positive(),
  weight: z.int().positive(),
}) satisfies z.ZodType<AbyssBenedictionChoice>;
