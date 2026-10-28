import CraftingScreenContainer from "#src/components/Crafting/Screen/Index.vue";
import { MYSTIC_OFFERING_ADVENTURE_RANK } from "#src/services/crafting/constants";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("craftingScreen", () => {
  // The Mystic Offering at its Adventure Rank with no recipe open, so the offering's tab is the bench's only one, and
  // The Back it shows closes the bench rather than returning to a tab that is the offering itself
  test("back from the Mystic Offering closes the bench when no recipe tab is open", async () => {
    expect.hasAssertions();

    const onClose = vi.fn<() => void>();
    await render(CraftingScreenContainer, {
      props: {
        adventureRank: MYSTIC_OFFERING_ADVENTURE_RANK,
        artifactDropTables: { artifactMainAffixPools: [], artifactRarityDataMap: new Map(), reliquarySets: [] },
        craftedCountMap: new Map(),
        crafters: [],
        gameText: ENGLISH_GAME_TEXT,
        getWorldNow: () => Temporal.Instant.fromEpochMilliseconds(0),
        initialCrafterId: 0,
        inventory: { items: [], nextId: 0, quickSwapItemIds: [] },
        materialDataMap: new Map(),
        nameText: {},
        now: Temporal.Instant.fromEpochMilliseconds(0),
        onClose,
        progress: { learnedRecipeIds: [] },
        random: () => 0,
        recipes: [],
        reliquaryPieceEntryMap: new Map(),
        strongboxes: [],
        wallet: EMPTY_WALLET,
        weaponDataMap: new Map(),
      },
    });

    await page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.Back] }).click();

    expect(onClose).toHaveBeenCalledExactlyOnceWith();
  });
});
