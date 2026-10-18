import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import { Currency } from "#src/models/inventory/Currency";
import { CurrencyItemIdMap } from "#src/services/inventory/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { defineComponent, h } from "vue";

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
  isPinned: false,
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

  // Delete Read asks first, and says so to the screen's owner only once the player confirms it
  test("should delete read mail once delete read is confirmed", async () => {
    expect.hasAssertions();

    const onDeleteRead = vi.fn<() => void>();
    render(MailScreen, { ...props, mails: [{ ...mail(true), isRead: true }], onDeleteRead });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDeleteRead] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Confirm] }).click();

    expect(onDeleteRead).toHaveBeenCalledTimes(1);
  });

  // Cancel closes the confirm and leaves every read mail where it is
  test("should keep read mail when delete read is cancelled", async () => {
    expect.hasAssertions();

    const onDeleteRead = vi.fn<() => void>();
    render(MailScreen, { ...props, mails: [{ ...mail(true), isRead: true }], onDeleteRead });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDeleteRead] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }).click();

    expect(onDeleteRead).not.toHaveBeenCalled();
  });

  // Delete Read is disabled while every held mail is unread or still holds an unclaimed attachment
  test("should disable delete read while no read mail can go", async () => {
    expect.hasAssertions();

    render(MailScreen, { ...props, mails: [mail(false)] });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDeleteRead] }))
      .toBeDisabled();
  });

  // A claimed birthday mail leaves the Mailbox and is listed under the Gift Mail Box tab
  test("should list a claimed birthday mail under the gift mail box tab", async () => {
    expect.hasAssertions();

    render(MailScreen, { ...props, mails: [mail(true)] });

    await expect.element(page.getByRole("tab", { name: "Best Wishes on Your Birthday" })).not.toBeInTheDocument();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailGiftBox] }).click();

    await expect.element(page.getByRole("tab", { name: "Best Wishes on Your Birthday" })).toBeVisible();
  });

  // The date line gives the date the mail was received, which NuxtTime formats in the reader's locale
  test("should show the date a mail was received", () => {
    expect.hasAssertions();

    const NuxtTimeStub = defineComponent({
      props: { datetime: { required: true, type: String } },
      setup: (componentProps) => () => h("time", { datetime: componentProps.datetime }),
    });
    render(MailScreen, { ...props, global: { stubs: { NuxtTime: NuxtTimeStub } }, mails: [mail(false)] });

    expect(document.querySelector("time")?.getAttribute("datetime")).toBe(DELIVERED_AT);
  });

  // The pin pressed on the selected mail gives its id back to the screen's owner
  test("should pin the selected mail when its pin is pressed", async () => {
    expect.hasAssertions();

    const onPin = vi.fn<(mailId: number) => void>();
    render(MailScreen, { ...props, mails: [mail(false)], onPin });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailStar] }).click();

    expect(onPin).toHaveBeenCalledWith(BIRTHDAY_MAIL_ID);
  });

  // Delete on a gift mail asks first, and gives the mail's id back to the screen's owner only once the player confirms it
  test("should delete a gift mail once its delete is confirmed", async () => {
    expect.hasAssertions();

    const onDeleteGift = vi.fn<(mailId: number) => void>();
    render(MailScreen, { ...props, mails: [mail(true)], onDeleteGift });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailGiftBox] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDelete] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDelete] }).click();

    expect(onDeleteGift).toHaveBeenCalledWith(BIRTHDAY_MAIL_ID);
  });

  // Cancel closes the warning and leaves the gift mail in the Gift Mail Box
  test("should keep the gift mail when its delete is cancelled", async () => {
    expect.hasAssertions();

    const onDeleteGift = vi.fn<(mailId: number) => void>();
    render(MailScreen, { ...props, mails: [mail(true)], onDeleteGift });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailGiftBox] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDelete] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }).click();

    expect(onDeleteGift).not.toHaveBeenCalled();
  });

  // A pinned mail offers to delete its pin in place of pinning it again
  test("should offer to delete the pin of a pinned mail", async () => {
    expect.hasAssertions();

    render(MailScreen, { ...props, mails: [{ ...mail(false), isPinned: true }] });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailCancelStar] }))
      .toBeVisible();
  });
});
