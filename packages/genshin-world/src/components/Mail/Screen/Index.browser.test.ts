import type { Mail } from "#src/models/mail/Mail";
import type { MailSave } from "#src/models/mail/MailSave";

import MailScreen from "#src/components/Mail/Screen/Index.vue";
import { Currency } from "#src/models/inventory/Currency";
import { CurrencyItemIdMap } from "#src/services/inventory/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { defineComponent, h } from "vue";

describe("mailScreen", () => {
  const BIRTHDAY_MAIL_ID = 35;
  const BIRTHDAY_TITLE_ID = "101";
  const CONTENT_TEXT_ID = "103";
  const SENDER_TEXT_ID = "102";
  const DELIVERED_AT = new Date(0).toISOString();
  const mailRows = new Map<number, Mail>([
    [
      BIRTHDAY_MAIL_ID,
      {
        contentTextId: CONTENT_TEXT_ID,
        expireDays: 365,
        id: BIRTHDAY_MAIL_ID,
        isStar: false,
        items: [{ itemId: CurrencyItemIdMap[Currency.Mora], quantity: 5000 }],
        senderTextId: SENDER_TEXT_ID,
        titleTextId: BIRTHDAY_TITLE_ID,
      },
    ],
  ]);
  const textMap = {
    [SENDER_TEXT_ID]: "Mailing System",
    [CONTENT_TEXT_ID]: "a",
    [BIRTHDAY_TITLE_ID]: "Best Wishes on Your Birthday",
  };
  const props = {
    birthdayMailIds: new Set([BIRTHDAY_MAIL_ID]),
    gameText: ENGLISH_GAME_TEXT,
    isBagFull: false,
    mailRows,
    materialDataMap: new Map(),
    names: {},
    now: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 24 }),
    textMap,
  };
  const createMail = (isClaimed: boolean): MailSave => ({
    deliveredAt: DELIVERED_AT,
    id: BIRTHDAY_MAIL_ID,
    isClaimed,
    isPinned: false,
    isRead: false,
  });
  const claimedMailProps = { ...props, mails: [createMail(true)] };
  const readMailProps = {
    ...props,
    birthdayMailIds: new Set<number>(),
    mails: [{ ...createMail(true), isRead: true }],
  };
  const unclaimedMailProps = { ...props, mails: [createMail(false)] };

  // The held mail listed by its title, and the claim pressed on the selected mail gives that held mail back
  test("should claim the selected mail when its claim is pressed", async () => {
    expect.hasAssertions();

    const onClaim = vi.fn<(held: MailSave) => void>();
    await render(MailScreen, { attrs: { onClaim }, props: unclaimedMailProps });

    await page.getByRole("tab", { name: "Best Wishes on Your Birthday Mailing System Expires in 364 day(s)" }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailClaim] }).click();

    expect(onClaim).toHaveBeenCalledExactlyOnceWith(createMail(false));
  });

  // A claimed birthday mail sits in the Gift Mail Box, and Claim All has nothing left to claim
  test("should disable claim all once every mail is claimed", async () => {
    expect.hasAssertions();

    await render(MailScreen, { props: claimedMailProps });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailClaimAll] }))
      .toBeDisabled();
  });

  // Delete Read asks first, and says so to the screen's owner only once the player confirms it. The read mail is an
  // Ordinary letter here, since a claimed birthday mail sits in the Gift Mail Box, which Delete Read keeps
  test("should delete read mail once delete read is confirmed", async () => {
    expect.hasAssertions();

    const onDeleteRead = vi.fn<() => void>();
    await render(MailScreen, { attrs: { onDeleteRead }, props: readMailProps });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDeleteRead] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Confirm] }).click();

    expect(onDeleteRead).toHaveBeenCalledExactlyOnceWith();
  });

  // Cancel closes the confirm and leaves every read mail where it is
  test("should keep read mail when delete read is cancelled", async () => {
    expect.hasAssertions();

    const onDeleteRead = vi.fn<() => void>();
    await render(MailScreen, { attrs: { onDeleteRead }, props: readMailProps });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDeleteRead] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }).click();

    expect(onDeleteRead).not.toHaveBeenCalled();
  });

  // Delete Read is disabled while every held mail is unread or still holds an unclaimed attachment
  test("should disable delete read while no read mail can go", async () => {
    expect.hasAssertions();

    await render(MailScreen, { props: unclaimedMailProps });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDeleteRead] }))
      .toBeDisabled();
  });

  // A claimed birthday mail leaves the Mailbox and is listed under the Gift Mail Box tab
  test("should list a claimed birthday mail under the gift mail box tab", async () => {
    expect.hasAssertions();

    await render(MailScreen, { props: claimedMailProps });

    await expect
      .element(page.getByRole("tab", { name: "Best Wishes on Your Birthday Mailing System Gift Mail Box" }))
      .not.toBeInTheDocument();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailGiftBox] }).click();

    await expect
      .element(page.getByRole("tab", { name: "Best Wishes on Your Birthday Mailing System Gift Mail Box" }))
      .toBeVisible();
  });

  // The date line gives the date the mail was received, which NuxtTime formats in the reader's locale
  test("should show the date a mail was received", async () => {
    expect.hasAssertions();

    const NuxtTimeStub = defineComponent({
      props: { datetime: { required: true, type: String } },
      setup: (componentProps) => () => h("time", { datetime: componentProps.datetime }),
    });
    await render(MailScreen, { global: { stubs: { NuxtTime: NuxtTimeStub } }, props: unclaimedMailProps });

    expect(document.querySelector("time")?.getAttribute("datetime")).toBe(DELIVERED_AT);
  });

  // The pin pressed on the selected mail gives that held mail back to the screen's owner
  test("should pin the selected mail when its pin is pressed", async () => {
    expect.hasAssertions();

    const onPin = vi.fn<(held: MailSave) => void>();
    await render(MailScreen, { attrs: { onPin }, props: unclaimedMailProps });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailStar] }).click();

    expect(onPin).toHaveBeenCalledExactlyOnceWith(createMail(false));
  });

  // Delete on a gift mail asks first, and gives the mail back to the screen's owner only once the player confirms it
  test("should delete a gift mail once its delete is confirmed", async () => {
    expect.hasAssertions();

    const onDeleteGift = vi.fn<(held: MailSave) => void>();
    await render(MailScreen, { attrs: { onDeleteGift }, props: claimedMailProps });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailGiftBox] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDelete] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDelete] }).click();

    expect(onDeleteGift).toHaveBeenCalledExactlyOnceWith(createMail(true));
  });

  // Cancel closes the warning and leaves the gift mail in the Gift Mail Box
  test("should keep the gift mail when its delete is cancelled", async () => {
    expect.hasAssertions();

    const onDeleteGift = vi.fn<(held: MailSave) => void>();
    await render(MailScreen, { attrs: { onDeleteGift }, props: claimedMailProps });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailGiftBox] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailDelete] }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }).click();

    expect(onDeleteGift).not.toHaveBeenCalled();
  });

  // A pinned mail offers to delete its pin in place of pinning it again
  test("should offer to delete the pin of a pinned mail", async () => {
    expect.hasAssertions();

    await render(MailScreen, { props: { ...props, mails: [{ ...createMail(false), isPinned: true }] } });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.MailCancelStar] }))
      .toBeVisible();
  });
});
