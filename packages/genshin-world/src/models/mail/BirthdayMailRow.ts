import type { birthdayMailRowsSchema } from "#src/models/mail/MailData";
import type { z } from "zod";

// A row of the birthday mail table: the mail sent on the birthday, and the game time from which it is the one in force
export type BirthdayMailRow = z.infer<typeof birthdayMailRowsSchema>[number];
