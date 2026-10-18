import type { AccountCharacterPackRecord } from "#server/models/genshin/AccountCharacterPackRecord";

import { accountCharacterPackRecordSchema } from "#server/models/genshin/AccountCharacterPackRecord";
import { z } from "zod";

// A pack the player keeps, once every one of its files has been uploaded under its hash, under the id of the keep its uploads were granted for
export type KeepCharacterPackInput = AccountCharacterPackRecord & { keepId: string };

export const keepCharacterPackInputSchema = accountCharacterPackRecordSchema.extend({
  keepId: z.uuid(),
}) satisfies z.ZodType<KeepCharacterPackInput>;
