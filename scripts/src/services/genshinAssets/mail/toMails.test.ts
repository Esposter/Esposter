import type { ExcelMailRow } from "#src/models/genshinAssets/mail/ExcelMailRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toMails } from "#src/services/genshinAssets/mail/toMails";
import { describe, expect, test } from "vitest";

describe(toMails, () => {
  const REWARD_ID = 240002;
  const ITEM_ID = 201;
  const rewardMap = new Map<number, ExcelRewardRow>([
    [
      REWARD_ID,
      {
        rewardId: REWARD_ID,
        rewardItemList: [
          { itemCount: 5, itemId: ITEM_ID },
          { itemCount: 0, itemId: 0 },
        ],
      },
    ],
  ]);
  const row: ExcelMailRow = {
    contentTextMapHash: 1,
    expireDays: 365,
    id: 9,
    isStar: true,
    senderTextMapHash: 2,
    titleTextMapHash: 3,
  };

  // A mail's sender, title and text read by their text ids, with its expiry and no items since it attaches no reward
  test("a mail reads its sender, title and expiry", () => {
    expect.hasAssertions();

    expect(toMails([row], rewardMap)).toStrictEqual({
      mails: [
        { contentTextId: "1", expireDays: 365, id: 9, isStar: true, items: [], senderTextId: "2", titleTextId: "3" },
      ],
      skipped: 0,
    });
  });

  // A mail attaching a reward reads the items it pays, with the empty slots of the reward left out
  test("a mail with a reward reads its items", () => {
    expect.hasAssertions();

    const { mails } = toMails([{ ...row, rewardId: REWARD_ID }], rewardMap);

    expect(mails[0].items).toStrictEqual([{ itemId: ITEM_ID, quantity: 5 }]);
  });

  // A mail carrying a key the dump does not name is skipped and counted, not guessed at
  test("a mail with an unnamed key is skipped", () => {
    expect.hasAssertions();

    const unnamed = { ...row, ABNBNPOEEDN: "5259001" };

    expect(toMails([unnamed], rewardMap)).toStrictEqual({ mails: [], skipped: 1 });
  });

  // A mail whose reward the table does not hold is skipped and counted, since it would be delivered without its items
  test("a mail whose reward the table lacks is skipped", () => {
    expect.hasAssertions();

    expect(toMails([{ ...row, rewardId: 999999 }], rewardMap)).toStrictEqual({ mails: [], skipped: 1 });
  });
});
