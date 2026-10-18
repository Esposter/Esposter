import type { Mail } from "#src/models/mail/Mail";

import { z } from "zod";

// A mail as the game data holds it, read by its id; its text ids name the game's words, and its items its reward
export const mailDataSchema = z.object({
  contentTextId: z.string(),
  expireDays: z.int().positive(),
  id: z.int().positive(),
  isStar: z.boolean(),
  items: z.array(z.object({ itemId: z.int().positive(), quantity: z.int().positive() })),
  senderTextId: z.string(),
  titleTextId: z.string(),
}) satisfies z.ZodType<Mail>;

// The birthday mail table's rows, read as one entry: the mail sent on each birthday, from the game time it takes effect
export const birthdayMailRowsSchema = z.array(z.object({ effectiveDate: z.string(), mailId: z.int().positive() }));
