import type { ExcelMailRow } from "#src/models/genshinAssets/mail/ExcelMailRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { Mail } from "genshin-world";

// The keys of a mail row this reader names; a row carrying any other key is one whose meaning is not known
const MAIL_NAMED_KEYS = new Set([
  "contentTextMapHash",
  "expireDays",
  "id",
  "isStar",
  "rewardId",
  "senderTextMapHash",
  "titleTextMapHash",
  "type",
]);

// The mails the table holds, each with its text ids, its expiry and the items its reward pays. A row carrying a key this
// Reader does not name is skipped, and so is one whose reward the table lacks, since it would reach the player without
// Its items; both are counted so the build can say how many it left out
export const toMails = (
  rows: ExcelMailRow[],
  rewardMap: Map<number, ExcelRewardRow>,
): { mails: Mail[]; skipped: number } => {
  const mails: Mail[] = [];
  let skipped = 0;
  for (const row of rows) {
    const reward = row.rewardId ? rewardMap.get(row.rewardId) : undefined;
    const hasUnnamedKey = Object.keys(row).some((key) => !MAIL_NAMED_KEYS.has(key));
    if (hasUnnamedKey || (row.rewardId && reward === undefined)) {
      skipped++;
      continue;
    }
    mails.push({
      contentTextId: String(row.contentTextMapHash),
      expireDays: row.expireDays,
      id: row.id,
      isStar: row.isStar ?? false,
      items: (reward?.rewardItemList ?? [])
        .filter(({ itemId }) => itemId !== 0)
        .map(({ itemCount, itemId }) => ({ itemId, quantity: itemCount })),
      senderTextId: String(row.senderTextMapHash),
      titleTextId: String(row.titleTextMapHash),
    });
  }
  return { mails, skipped };
};
