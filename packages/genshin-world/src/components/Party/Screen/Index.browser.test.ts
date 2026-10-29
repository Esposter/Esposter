import { props } from "#src/components/Party/Screen/Index.fixture";
import PartyScreen from "#src/components/Party/Screen/Index.vue";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("partyScreen", () => {
  const PARTY_1 = ENGLISH_GAME_TEXT[GameTextKey.PartyDefaultName1];
  const PARTY_2 = ENGLISH_GAME_TEXT[GameTextKey.PartyDefaultName2];
  const PARTY_3 = ENGLISH_GAME_TEXT[GameTextKey.PartyDefaultName3];
  const PARTY_4 = ENGLISH_GAME_TEXT[GameTextKey.PartyDefaultName4];

  // Party 1 is deployed, so the arrows name Party 4 and Party 2, and a step names the arrows again from where it lands
  test("should name each arrow by the party it steps to", async () => {
    expect.hasAssertions();

    await render(PartyScreen, { props });

    await expect.element(page.getByRole("button", { exact: true, name: PARTY_4 })).toBeInTheDocument();
    await expect.element(page.getByRole("button", { exact: true, name: PARTY_2 })).toBeInTheDocument();

    await page.getByRole("button", { exact: true, name: PARTY_2 }).click();

    await expect.element(page.getByRole("button", { exact: true, name: PARTY_1 })).toBeInTheDocument();
    await expect.element(page.getByRole("button", { exact: true, name: PARTY_3 })).toBeInTheDocument();
  });
});
