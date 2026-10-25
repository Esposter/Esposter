import { z } from "zod";

// The one event an account deletion publishes. It names the account and nothing else: the sweep is keyed by that user
// Id, and reads what the account owns from the stores keyed to it.
export interface DeleteAccountEventGridData {
  userId: string;
}

export const deleteAccountEventGridDataSchema = z.object({
  userId: z.string(),
}) satisfies z.ZodType<DeleteAccountEventGridData>;
