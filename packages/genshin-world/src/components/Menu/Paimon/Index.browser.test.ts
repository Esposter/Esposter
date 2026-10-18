import { props } from "#src/components/Menu/Paimon/Index.fixture";
import MenuPaimon from "#src/components/Menu/Paimon/Index.vue";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("menuPaimon", () => {
  // The side bar's Settings entry opens the Settings screen, which the world's menu names by its own screen kind
  test("settings opens from the side bar", async () => {
    expect.hasAssertions();

    const onOpen = vi.fn<(screenKind: ScreenKind) => void>();
    render(MenuPaimon, { attrs: { onOpen }, props });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.Settings] }).click();

    expect(onOpen).toHaveBeenCalledExactlyOnceWith(ScreenKind.Settings);
  });

  test("a signed-in reader sees the account's name and avatar", async () => {
    expect.hasAssertions();

    render(MenuPaimon, {
      props: { ...props, accountAvatarUrl: "https://example.com/avatar.png", accountName: "Aether" },
    });

    await expect.element(page.getByText("Aether", { exact: true })).toBeInTheDocument();
    await expect
      .element(page.getByRole("img", { name: "Aether" }))
      .toHaveAttribute("src", "https://example.com/avatar.png");
  });

  test("a signed-out reader sees the default name", async () => {
    expect.hasAssertions();

    render(MenuPaimon, { props });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.PlayerDefaultName], { exact: true }))
      .toBeInTheDocument();
  });

  test("a profile field appears once its system is built", async () => {
    expect.hasAssertions();

    render(MenuPaimon, { props });

    await expect.element(page.getByText(String(props.adventureRank), { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText(String(props.worldLevel), { exact: true })).toBeInTheDocument();
  });

  test("a profile field stays out until its system is built", async () => {
    expect.hasAssertions();

    render(MenuPaimon, { props });

    await expect.element(page.getByText(/^\d{6,}$/u)).not.toBeInTheDocument();
  });

  test("community and Feedback show as disabled entries", async () => {
    expect.hasAssertions();

    render(MenuPaimon, { props });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Community] }))
      .toBeDisabled();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Feedback] }))
      .toBeDisabled();
  });

  test("version Highlights and Survey show as disabled entries", async () => {
    expect.hasAssertions();

    render(MenuPaimon, { props });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.VersionHighlights] }))
      .toBeDisabled();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Survey] }))
      .toBeDisabled();
  });

  test("training Guide is absent from the contents", async () => {
    expect.hasAssertions();

    render(MenuPaimon, { props });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.TrainingGuide] }))
      .not.toBeInTheDocument();
  });

  test("choosing Time opens the Time screen", async () => {
    expect.hasAssertions();

    const onOpen = vi.fn<(screenKind: ScreenKind) => void>();
    render(MenuPaimon, { attrs: { onOpen }, props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Time] }).click();

    expect(onOpen).toHaveBeenCalledExactlyOnceWith(ScreenKind.Time);
  });

  test("choosing Quit Game opens the quit prompt", async () => {
    expect.hasAssertions();

    render(MenuPaimon, { props });
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
    render(MenuPaimon, { attrs: { onSetBirthday }, props });
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.BirthdaySet] }).click();
    // The month list comes before the day list, so the first October is the month
    await page.getByRole("button", { exact: true, name: "10" }).first().click();
    await page.getByRole("button", { exact: true, name: "13" }).click();
    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Confirm] }).click();

    expect(onSetBirthday).toHaveBeenCalledExactlyOnceWith({ day: 13, month: 10 });
  });

  test("a birthday already set shows its date and no button to set it", async () => {
    expect.hasAssertions();

    render(MenuPaimon, { props: { ...props, travelerBirthday: { day: 13, month: 10 } } });

    await expect.element(page.getByText("10/13", { exact: true })).toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.BirthdaySet] }))
      .not.toBeInTheDocument();
  });
});
