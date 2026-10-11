import { z } from "zod";

// The character whose pack the player removes from the account
export interface RemoveCharacterPackInput {
  characterId: number;
}

export const removeCharacterPackInputSchema = z.object({
  characterId: z.int().positive(),
}) satisfies z.ZodType<RemoveCharacterPackInput>;
