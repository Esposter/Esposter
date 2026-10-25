import { z } from "zod";

// The one event an account deletion publishes. It names the account and nothing else: the sweep reads what the account
// owns from the stores keyed to it, and the user row it deletes last is what a redelivery finds the account by.
export interface DeleteAccountEventGridData {
  userId: string;
}

export const deleteAccountEventGridDataSchema = z.object({
  userId: z.string(),
}) satisfies z.ZodType<DeleteAccountEventGridData>;
