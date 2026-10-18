import type { Mail } from "#src/models/mail/Mail";

import { z } from "zod";

// A mail as the game data holds it, read by its id; its text ids name the game's words, and its items its reward
export const mailDataSchema = z.object({
  contentTextId: z.string().min(1),
  expireDays: z.int().positive(),
  id: z.int().positive(),
  isStar: z.boolean(),
  items: z.array(z.object({ itemId: z.int().positive(), quantity: z.int().positive() })),
  senderTextId: z.string().min(1),
  titleTextId: z.string().min(1),
}) satisfies z.ZodType<Mail>;

// The birthday mail table's rows, read as one entry: the mail sent on each birthday, and the game time from which it is
// The one in force, parsed where the row is read so a date that is not one is refused there
export const birthdayMailRowsSchema = z.array(
  z.object({
    effectiveDate: z.string().transform((value) => Temporal.PlainDateTime.from(value.replace(" ", "T"))),
    mailId: z.int().positive(),
  }),
);
