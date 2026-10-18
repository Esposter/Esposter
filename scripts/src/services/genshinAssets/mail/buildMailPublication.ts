import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { ExcelBirthdayMailRow } from "#src/models/genshinAssets/mail/ExcelBirthdayMailRow";
import type { ExcelMailRow } from "#src/models/genshinAssets/mail/ExcelMailRow";

import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { toMails } from "#src/services/genshinAssets/mail/toMails";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The mail table as one entry per mail, keyed by its id, with the birthday mail table kept under its own entry. A
// Mail with a key the reader cannot name is left out and counted in the note
export const buildMailPublication = (): { note: string; publication: GameDataPublication } => {
  const { mails, skipped } = toMails(readExcelTable<ExcelMailRow>("MailExcelConfigData"), readRewardMap());
  const birthdayMails = readExcelTable<ExcelBirthdayMailRow>("BirthdayMailExcelConfigData").map(
    ({ effectiveDate, mailId }) => ({ effectiveDate, mailId }),
  );
  return {
    note: `${mails.length} mails built, ${skipped} skipped, ${birthdayMails.length} birthday mail rows`,
    publication: {
      indexes: {
        [`${GameDataset.Mail}/mail`]: {
          birthdayMails,
          ...Object.fromEntries(mails.map((mail) => [String(mail.id), mail])),
        },
      },
      objects: {},
    },
  };
};
