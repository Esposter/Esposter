import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";

import { props } from "#src/components/Menu/Paimon/Index.fixture";
import MenuPaimon from "#src/components/Menu/Paimon/Index.vue";
import { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import {
  ADVENTURER_HANDBOOK_UNLOCK_QUEST_ID,
  CO_OP_UNLOCK_QUEST_ID,
  WISH_UNLOCK_QUEST_ID,
} from "#src/services/adventureRank/constants";
import { BIRTHDAY_MONTHS } from "#src/services/profile/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page, userEvent } from "vitest/browser";

// The labels of the contents the menu draws, in its order, read from its entries that are not links
const getContentLabels = () =>
  Array.from(document.querySelectorAll(".contents .entry:not(.link) .label"), (label) => label.textContent);
const dotOf = (name: string) => page.getByRole("button", { exact: true, name }).element().querySelector(".alert");

describe("menuPaimon", () => {
  const birthday = { day: 13, month: 10 };
  const travelerName = "Aether";
  // The main quests the systems a quest opens wait on, all finished, as a player who has opened every system has them
  const openedQuestIds = new Set([ADVENTURER_HANDBOOK_UNLOCK_QUEST_ID, CO_OP_UNLOCK_QUEST_ID, WISH_UNLOCK_QUEST_ID]);

  // The side bar's Settings entry opens the Settings screen, which the world's menu names by its own screen kind
  test("settings opens from the side bar", async () => {
    expect.hasAssertions();

    const onOpen = vi.fn<(screenKind: ScreenKind) => void>();
    await render(MenuPaimon, { attrs: { onOpen }, props });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.Settings] }).click();

    expect(onOpen).toHaveBeenCalledExactlyOnceWith(ScreenKind.Settings);
  });

  // The avatar is NuxtImg, which only the Nuxt app registers; the browser suites draw it as the plain image it renders
  // (`parity/NuxtImgStub.ts`)
  test("a signed-in reader sees the account's name and avatar", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props: { ...props, accountAvatarUrl: "a", accountName: travelerName } });

    await expect.element(page.getByText(travelerName, { exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole("img", { name: travelerName })).toHaveAttribute("src", "a");
  });

  test("a signed-out reader sees the default name", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.PlayerDefaultName], { exact: true }))
      .toBeInTheDocument();
  });

  test("a profile field appears once its system is built", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });

    await expect.element(page.getByText(String(props.adventureRank), { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText(String(props.worldLevel), { exact: true })).toBeInTheDocument();
  });

  test("a profile field stays out until its system is built", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });

    await expect.element(page.getByText(/^\d{6,}$/u)).not.toBeInTheDocument();
  });

  test("community and Feedback show as disabled entries", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Community] }))
      .toBeDisabled();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Feedback] }))
      .toBeDisabled();
  });

  test("version Highlights and Survey show as disabled entries", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.VersionHighlights] }))
      .toBeDisabled();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Survey] }))
      .toBeDisabled();
  });

  // The red dots are the host's state, so an entry carries one only when the host flags its icon
  test("a red dot marks only the entries the host flags", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props: { ...props, alertedIcons: [MenuEntryIcon.Achievements] } });

    expect(dotOf(ENGLISH_GAME_TEXT[GameTextKey.Achievements])).not.toBeNull();
    expect(dotOf(ENGLISH_GAME_TEXT[GameTextKey.Friends])).toBeNull();
  });

  test("training Guide is absent from the contents", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.TrainingGuide] }))
      .not.toBeInTheDocument();
  });

  // A locked account draws the frame's nine contents, the systems its rank and quests have not opened left out, not drawn
  test("a locked account's menu draws only the contents it has opened", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });

    expect(getContentLabels()).toStrictEqual(
      [
        GameTextKey.PartySetup,
        GameTextKey.Friends,
        GameTextKey.Achievements,
        GameTextKey.Archive,
        GameTextKey.CharacterArchive,
        GameTextKey.Character,
        GameTextKey.Inventory,
        GameTextKey.Quests,
        GameTextKey.Map,
      ].map((key) => ENGLISH_GAME_TEXT[key]),
    );
  });

  test("a player at rank 20 with the quests finished sees all fifteen contents", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props: { ...props, adventureRank: 20, finishedMainQuestIds: openedQuestIds } });

    expect(getContentLabels()).toHaveLength(15);
    expect(getContentLabels()).toContain(ENGLISH_GAME_TEXT[GameTextKey.BattlePass]);
  });

  test("a player at rank 15 with the quests finished has no Battle Pass and no Co-Op Mode", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props: { ...props, adventureRank: 15, finishedMainQuestIds: openedQuestIds } });

    expect(getContentLabels()).toHaveLength(13);
    expect(getContentLabels()).not.toContain(ENGLISH_GAME_TEXT[GameTextKey.BattlePass]);
    expect(getContentLabels()).not.toContain(ENGLISH_GAME_TEXT[GameTextKey.CoOp]);
  });

  test("an open system whose screen is not built is drawn disabled", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props: { ...props, checkIsBuilt: () => false } });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.PartySetup] }))
      .toBeDisabled();
  });

  test("choosing Time opens the Time screen", async () => {
    expect.hasAssertions();

    const onOpen = vi.fn<(screenKind: ScreenKind) => void>();
    await render(MenuPaimon, { attrs: { onOpen }, props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Time] }).click();

    expect(onOpen).toHaveBeenCalledExactlyOnceWith(ScreenKind.Time);
  });

  test("choosing Quit Game opens the quit prompt", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.QuitGame] }).click();

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.QuitConfirmQuestion], { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Cancel] }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Confirm] }))
      .toBeInTheDocument();
  });

  // The row offers the button that sets the birthday while it is unset, and the dialog's confirm sets the picked date once
  test("a birthday not yet set is set once from the profile's dialog", async () => {
    expect.hasAssertions();

    const onSetBirthday = vi.fn<(birthday: TravelerBirthdaySave) => void>();
    await render(MenuPaimon, { attrs: { onSetBirthday }, props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.BirthdaySet] }).click();
    // The month list comes before the day list, so the first October is the month
    await page
      .getByRole("button", { exact: true, name: String(birthday.month) })
      .first()
      .click();
    await page.getByRole("button", { exact: true, name: String(birthday.day) }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Confirm] }).click();

    expect(onSetBirthday).toHaveBeenCalledExactlyOnceWith(birthday);
  });

  // The menu behind an open dialog is inert, so Tab walks the dialog's own stops and never lands on the menu's entries.
  // The months and the cross are the birthday dialog's stops, and the Tab after the cross
  // Is the one that would reach the menu
  test("tab from the birthday dialog never reaches the menu behind it", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props });
    const menu = document.querySelector(".menu");
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.BirthdaySet] }).click();

    for (let index = 0; index < BIRTHDAY_MONTHS.length + 2; index++) {
      // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: every Tab moves the focus the next one starts from
      await userEvent.tab();

      expect(menu?.contains(document.activeElement)).toBe(false);
    }
  });

  // The namecards and the cross are the namecard dialog's stops, and the Tab after the cross
  // Is the one that would reach the menu
  test("tab from the namecard dialog never reaches the menu behind it", async () => {
    expect.hasAssertions();

    const namecard = { itemId: 1, name: travelerName };
    const namecards = [namecard];
    await render(MenuPaimon, { props: { ...props, namecardItemId: namecard.itemId, namecards } });
    const menu = document.querySelector(".menu");
    await page.getByRole("button", { exact: true, name: namecard.name }).click();

    for (let index = 0; index < namecards.length + 2; index++) {
      // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: every Tab moves the focus the next one starts from
      await userEvent.tab();

      expect(menu?.contains(document.activeElement)).toBe(false);
    }
  });

  test("a birthday already set shows its date and no button to set it", async () => {
    expect.hasAssertions();

    await render(MenuPaimon, { props: { ...props, travelerBirthday: birthday } });

    await expect.element(page.getByText("10/13", { exact: true })).toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.BirthdaySet] }))
      .not.toBeInTheDocument();
  });

  // The profile's signature is shown as it is, and the game's no-signature line stands in only while it holds none
  test("a profile's signature is shown in place of the no-signature line", async () => {
    expect.hasAssertions();

    const signature = "Ask me about the tide";
    await render(MenuPaimon, { props: { ...props, signature } });

    await expect.element(page.getByText(signature, { exact: true })).toBeInTheDocument();
    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.FriendNoSignature], { exact: true }))
      .not.toBeInTheDocument();
  });
});
