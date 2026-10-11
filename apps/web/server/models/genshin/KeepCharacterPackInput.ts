import type { AccountCharacterPackRecord } from "#server/models/genshin/AccountCharacterPackRecord";
import type { z } from "zod";

import { accountCharacterPackRecordSchema } from "#server/models/genshin/AccountCharacterPackRecord";

// A pack the player keeps, once every one of its files has been uploaded under its hash
export type KeepCharacterPackInput = AccountCharacterPackRecord;

export const keepCharacterPackInputSchema =
  accountCharacterPackRecordSchema satisfies z.ZodType<KeepCharacterPackInput>;
