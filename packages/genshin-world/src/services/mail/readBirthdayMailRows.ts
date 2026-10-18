import { birthdayMailRowsSchema } from "#src/models/mail/MailData";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { MAIL_INDEX_KEY } from "#src/services/mail/constants";

// The rows of the birthday mails the mail table's index names, which the Traveler's birthday mail is delivered from
export const readBirthdayMailRows = (gameDataBaseUrl: string) =>
  readGameDataEntry(gameDataBaseUrl, MAIL_INDEX_KEY, "birthdayMails", birthdayMailRowsSchema);
