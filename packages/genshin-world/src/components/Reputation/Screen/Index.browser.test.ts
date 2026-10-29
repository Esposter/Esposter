import { props } from "#src/components/Reputation/Screen/Index.fixture";
import ReputationScreen from "#src/components/Reputation/Screen/Index.vue";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("reputationScreen", () => {
  // The fixture's Reputation is at level 3, so each level it has reached wears a tick, whose hidden label is the
  // Game's word for it
  test("should carry the completed word on an achieved level's tick", async () => {
    expect.hasAssertions();

    await render(ReputationScreen, { props });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.ReputationLevelReached], { exact: true }).first())
      .toBeInTheDocument();
  });
});
