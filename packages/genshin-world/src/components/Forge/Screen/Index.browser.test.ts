import ForgeScreenContainer from "#src/components/Forge/Screen/Index.vue";
import { props, variants } from "#src/components/Forge/Screen/Index.fixture";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("forgeScreen", () => {
  // The Materials tab with its actions named by the forge page's own words, the Start button among them
  test("the forge screen labels its actions in the game's words", async () => {
    expect.hasAssertions();

    render(ForgeScreenContainer, { props });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.ForgeMaterialsTab], { exact: true }))
      .toBeVisible();
    await expect.element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.ForgeStart], { exact: true })).toBeVisible();
  });

  // The Enhancement Ore past the day's forge points, its refusal line in place of the Start button
  test("an order past the daily cap shows the refusal words", async () => {
    expect.hasAssertions();

    render(ForgeScreenContainer, { props: { ...props, ...variants.refused } });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.ForgeEnhancementOreRefusal], { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.ForgeStart], { exact: true }))
      .not.toBeInTheDocument();
  });
});
