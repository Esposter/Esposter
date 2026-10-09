import GcgSession from "#src/components/Gcg/Session/Index.vue";
import { ENGLISH_GAME_TEXT, fillGameTextValues, GameLanguage, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

// A duel of the tutorial deck against deck 1 through the board's own buttons: the preparation confirmed, the first roll
// Passed, then the round ended, the opponent's turns taken by the scripted policy until the round's second roll opens
describe("gcgSession", () => {
  test("should open the next round through the board's buttons", async () => {
    expect.hasAssertions();

    render(GcgSession, { props: { gameId: 12, gameText: ENGLISH_GAME_TEXT, language: GameLanguage.English } });
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgConfirm] }).click();
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgReroll] }).click();
    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgEndRound] }).click();

    await expect
      .element(page.getByText(fillGameTextValues(ENGLISH_GAME_TEXT[GameTextKey.GcgRoundTitle], 2)))
      .toBeVisible();
    await expect.element(page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.GcgReroll] })).toBeVisible();
  });
});
