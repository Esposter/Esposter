import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { ExcelBirthdayMailRow } from "#src/models/genshinAssets/mail/ExcelBirthdayMailRow";
import type { ExcelMailRow } from "#src/models/genshinAssets/mail/ExcelMailRow";

import { toMails } from "#src/services/genshinAssets/mail/toMails";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The mail table as one entry per mail, keyed by its id, with the birthday mail table kept under its own entry, and every
// Mail's title, sender and body in every language under the mail text dataset. A mail with a key the reader cannot name
// Is left out and counted in the note
export const buildMailPublication = (): { note: string; publication: GameDataPublication } => {
  const { mails, skipped } = toMails(readExcelTable<ExcelMailRow>("MailExcelConfigData"), readRewardMap());
  const birthdayMails = readExcelTable<ExcelBirthdayMailRow>("BirthdayMailExcelConfigData").map(
    ({ effectiveDate, mailId }) => ({ effectiveDate, mailId }),
  );
  const textIds = [
    ...new Set(
      mails.flatMap(({ contentTextId, senderTextId, titleTextId }) => [contentTextId, senderTextId, titleTextId]),
    ),
  ].toSorted((first, second) => first.localeCompare(second));
  const { notes, objects } = buildTextChunks(GameDataset.MailText, textIds);
  return {
    note: [
      `${mails.length} mails built, ${skipped} skipped, ${birthdayMails.length} birthday mail rows, ${textIds.length} mail texts`,
      ...notes,
    ].join("\n"),
    publication: {
      indexes: {
        [`${GameDataset.Mail}/mail`]: {
          birthdayMails,
          ...Object.fromEntries(mails.map((mail) => [String(mail.id), mail])),
        },
      },
      objects,
    },
  };
};
