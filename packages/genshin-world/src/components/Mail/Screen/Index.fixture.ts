import type { MailSave } from "#src/models/mail/MailSave";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { readMailRows } from "#src/services/mail/readMailRows";
import { readMailText } from "#src/services/mail/readMailText";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// Three of the table's mails: the first, pinned, with one item to claim, then one more with an item, then a summary with
// none. The clip's own mails are the 2024 build's, which the table no longer holds, so the words are the table's own
const MAIL_IDS = [14, 15, 1];
const now = Temporal.Instant.from("2026-10-30T00:00:00Z");
const deliveredAt = "2026-10-29T00:00:00.000Z";

export const props = {
  birthdayMailIds: new Set<number>(),
  gameText: ENGLISH_GAME_TEXT,
  isBagFull: false,
  mailRows: await readMailRows(GAME_DATA_LOCAL_BASE_URL, MAIL_IDS),
  mails: [
    { deliveredAt, id: 14, isClaimed: false, isPinned: true, isRead: false },
    { deliveredAt, id: 15, isClaimed: false, isPinned: false, isRead: false },
    { deliveredAt, id: 1, isClaimed: false, isPinned: false, isRead: true },
  ] satisfies MailSave[],
  materialDataMap: await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL),
  names: englishNameText,
  now,
  textMap: await readMailText(GAME_DATA_LOCAL_BASE_URL, GameLanguage.English),
};
