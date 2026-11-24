import type { ExcelBirthdayMailRow } from "#src/models/genshinAssets/mail/ExcelBirthdayMailRow";
import type { ExcelMailRow } from "#src/models/genshinAssets/mail/ExcelMailRow";
import type { HostedAssetPublication } from "#src/models/hostedAssets/HostedAssetPublication";

import { toMails } from "#src/services/genshinAssets/mail/toMails";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readConstValue } from "#src/services/genshinAssets/shared/readConstValue";
import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { takeOne } from "@esposter/shared";
import { GameDataset } from "genshin-world/definitions";

// The mail table as one entry per mail, keyed by its id, with the birthday mail table kept under its own entry, and
// Every mail's title, sender and body in every language under the mail text dataset. A mail with a key the reader
// Cannot name is left out and counted in the note
export const buildMailPublication = (): { note: string; publication: HostedAssetPublication } => {
  const { mails, skipped } = toMails(readExcelTable<ExcelMailRow>("MailExcelConfigData"), readRewardMap());
  const birthdayMails = readExcelTable<ExcelBirthdayMailRow>("BirthdayMailExcelConfigData").map(
    ({ effectiveDate, mailId }) => ({ effectiveDate, mailId }),
  );
  const textIds = [
    ...new Set(
      mails.flatMap(({ contentTextId, senderTextId, titleTextId }) => [contentTextId, senderTextId, titleTextId]),
    ),
  ].toSorted((firstTextId, secondTextId) => firstTextId.localeCompare(secondTextId));
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
      objects: {
        ...objects,
        [`${GameDataset.Mail}/maxCount`]: Number(takeOne(readConstValue("CONST_VALUE_MAIL_MAX_NUM"), 0)),
      },
    },
  };
};
