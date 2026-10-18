import type {
  AccountCharacterPackFileRecord,
  AccountCharacterPackRecord,
} from "#server/models/genshin/AccountCharacterPackRecord";

import {
  accountCharacterPackFileRecordSchema,
  accountCharacterPackRecordSchema,
} from "#server/models/genshin/AccountCharacterPackRecord";
import { MAX_CHARACTER_PACK_FILE_COUNT } from "#server/services/genshin/accountCharacterPack/constants";
import { z } from "zod";

// A file of a pack about to be kept: its record, and the staging id of the upload its own grant named. The id is only
// Named to the keep, and is never stored in the account's list
export interface KeepCharacterPackFileInput extends AccountCharacterPackFileRecord {
  stagingId: string;
}

// A pack the player keeps, once every one of its files has been uploaded under the staging id its own grant minted
export interface KeepCharacterPackInput extends Omit<AccountCharacterPackRecord, "files"> {
  files: KeepCharacterPackFileInput[];
}

const keepCharacterPackFileInputSchema = accountCharacterPackFileRecordSchema.extend({
  stagingId: z.uuid(),
}) satisfies z.ZodType<KeepCharacterPackFileInput>;

export const keepCharacterPackInputSchema = accountCharacterPackRecordSchema.extend({
  files: z.array(keepCharacterPackFileInputSchema).min(1).max(MAX_CHARACTER_PACK_FILE_COUNT),
}) satisfies z.ZodType<KeepCharacterPackInput>;
