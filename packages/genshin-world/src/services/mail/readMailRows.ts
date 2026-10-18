import type { Mail } from "#src/models/mail/Mail";

import { mailDataSchema } from "#src/models/mail/MailData";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { readGameDataIndex } from "#src/services/data/readGameDataIndex";
import { MAIL_INDEX_KEY } from "#src/services/mail/constants";

// The rows of the held mails the mail table still names, read by id. A mail whose row is gone has no entry in the index,
// So it is left out of the rows rather than failing the others, and the save keeps it until its expiry can be read
export const readMailRows = async (gameDataBaseUrl: string, mailIds: readonly number[]): Promise<Map<number, Mail>> => {
  const index = await readGameDataIndex(gameDataBaseUrl, MAIL_INDEX_KEY);
  const namedIds = mailIds.filter((id) => index[String(id)] !== undefined);
  const entries = await Promise.all(
    namedIds.map(
      async (id) => [id, await readGameDataEntry(gameDataBaseUrl, MAIL_INDEX_KEY, String(id), mailDataSchema)] as const,
    ),
  );
  return new Map(entries);
};
