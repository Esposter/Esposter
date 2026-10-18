import { props } from "#src/components/Hud/Screen/Index.fixture";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("hudScreen", () => {
  test("a character trial's countdown shows the seconds its clock has left", async () => {
    expect.hasAssertions();

    render(HudScreen, { props: { ...props, trialSecondsRemaining: 299 } });

    await expect.element(page.getByText("4:59", { exact: true })).toBeVisible();
  });

  test("the world shows no countdown outside a trial", () => {
    expect.hasAssertions();

    render(HudScreen, { props });

    expect(page.getByText(/^\d+:\d{2}$/u).query()).toBeNull();
  });

  // The Paimon button gives the menu press back to the screen's owner
  test("pressing the Paimon button gives the menu back to the screen's owner", async () => {
    expect.hasAssertions();

    const onMenu = vi.fn<() => void>();
    render(HudScreen, { attrs: { onMenu }, props });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Paimon] }).click();

    expect(onMenu).toHaveBeenCalledTimes(1);
  });

  // The minimap is the way to the map, and its press gives the map back to the screen's owner
  test("pressing the minimap gives the map back to the screen's owner", async () => {
    expect.hasAssertions();

    const onMap = vi.fn<() => void>();
    render(HudScreen, { attrs: { onMap }, props });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Map] }).click();

    expect(onMap).toHaveBeenCalledTimes(1);
  });
});
