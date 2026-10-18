import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { Currency } from "#src/models/inventory/Currency";
import { CurrencyItemIdMap } from "#src/services/inventory/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

import MailScreen from "#src/components/Mail/Screen/Index.vue";

const BIRTHDAY_MAIL_ID = 35;
const BIRTHDAY_TITLE_ID = "101";
const DELIVERED_AT = new Date(0).toISOString();
const mailRows = new Map<number, Mail>([
  [
    BIRTHDAY_MAIL_ID,
    {
      contentTextId: "103",
      expireDays: 365,
      id: BIRTHDAY_MAIL_ID,
      isStar: false,
      items: [{ itemId: CurrencyItemIdMap[Currency.Mora], quantity: 5000 }],
      senderTextId: "102",
      titleTextId: BIRTHDAY_TITLE_ID,
    },
  ],
]);
const textMap = {
  [BIRTHDAY_TITLE_ID]: "Best Wishes on Your Birthday",
  "102": "Mailing System",
  "103": "Happy birthday, Traveler.",
};
const props = {
  birthdayMailIds: new Set([BIRTHDAY_MAIL_ID]),
  gameText: ENGLISH_GAME_TEXT,
  isBagFull: false,
  mailRows,
  materialDataMap: new Map(),
  names: {},
  now: Temporal.Instant.fromEpochMilliseconds(86_400_000),
  textMap,
};
const mail = (isClaimed: boolean): MailSave => ({
  deliveredAt: DELIVERED_AT,
  id: BIRTHDAY_MAIL_ID,
  isClaimed,
  isRead: false,
});

describe("mailScreen", () => {
  // The held mail listed by its title, and the claim pressed on the selected mail gives its id back
  test("should claim the selected mail when its claim is pressed", async () => {
    expect.hasAssertions();

    const onClaim = vi.fn<(mailId: number) => void>();
    render(MailScreen, { ...props, mails: [mail(false)], onClaim });

    await page.getByRole("tab", { name: "Best Wishes on Your Birthday" }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailClaim] }).click();

    expect(onClaim).toHaveBeenCalledWith(BIRTHDAY_MAIL_ID);
  });

  // A claimed birthday mail sits in the Gift Mail Box, and Claim All has nothing left to claim
  test("should disable claim all once every mail is claimed", async () => {
    expect.hasAssertions();

    render(MailScreen, { ...props, mails: [mail(true)] });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailClaimAll] }))
      .toBeDisabled();
  });

  // Delete Read is pressed once a read mail has nothing left to claim, and says so to the screen's owner
  test("should delete read mail when delete read is pressed", async () => {
    expect.hasAssertions();

    const onDeleteRead = vi.fn<() => void>();
    render(MailScreen, { ...props, mails: [{ ...mail(true), isRead: true }], onDeleteRead });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDeleteRead] }).click();

    expect(onDeleteRead).toHaveBeenCalledTimes(1);
  });

  // Delete Read is disabled while every held mail is unread or still holds an unclaimed attachment
  test("should disable delete read while no read mail can go", async () => {
    expect.hasAssertions();

    render(MailScreen, { ...props, mails: [mail(false)] });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDeleteRead] }))
      .toBeDisabled();
  });
});
