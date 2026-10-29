import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";

import { FORGED_WEAPON_RARITY, props, variants, weaponRecipe } from "#src/components/Forge/Screen/Index.fixture";
import ForgeScreenContainer from "#src/components/Forge/Screen/Index.vue";
import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

describe("forgeScreen", () => {
  // The Materials tab with its actions named by the forge page's own words, the Start button among them
  test("the forge screen labels its actions in the game's words", async () => {
    expect.hasAssertions();

    await render(ForgeScreenContainer, { props });

    await expect
      .element(page.getByRole("button", { exact: true, name: ENGLISH_GAME_TEXT[GameTextKey.ForgeMaterialsTab] }))
      .toBeVisible();
    await expect.element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.ForgeStart], { exact: true })).toBeVisible();
  });

  // The Enhancement Ore past the day's forge points, its refusal line in place of the Start button
  test("an order past the daily cap shows the refusal words", async () => {
    expect.hasAssertions();

    await render(ForgeScreenContainer, { props: { ...props, ...variants.refused } });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.ForgeEnhancementOreRefusal], { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.ForgeStart], { exact: true }))
      .not.toBeInTheDocument();
  });

  // Both units of the weapon order obtained beside a weapon the bag already held: the two new weapons are counted at the
  // Four-star rarity they forge at, and the held one is no forge doing
  test("obtaining a weapon order counts each forged weapon at its rarity", async () => {
    expect.hasAssertions();

    const forgedWeaponEvent: AchievementEvent = {
      kind: AchievementEventKind.WeaponForged,
      quantity: 1,
      targetId: String(FORGED_WEAPON_RARITY),
    };
    const onAchievementEvents = vi.fn<(achievementEvents: AchievementEvent[]) => void>();
    await render(ForgeScreenContainer, { props: { ...props, ...variants.weaponsDone, onAchievementEvents } });

    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.ForgeObtain] }).click();

    expect(onAchievementEvents).toHaveBeenCalledExactlyOnceWith([forgedWeaponEvent, forgedWeaponEvent]);
  });

  // The first ore's order obtained beside a weapon the bag already held: its new entries are materials, so no weapon is
  // Counted as forged
  test("obtaining an ore order counts no weapon", async () => {
    expect.hasAssertions();

    const onAchievementEvents = vi.fn<(achievementEvents: AchievementEvent[]) => void>();
    await render(ForgeScreenContainer, { props: { ...props, ...variants.oresDone, onAchievementEvents } });

    await page.getByRole("button", { name: ENGLISH_GAME_TEXT[GameTextKey.ForgeObtain] }).click();

    expect(onAchievementEvents).not.toHaveBeenCalled();
  });

  // The four-star weapon's recipe queues one unit, under the five the amount holds: picking it asks the parent for that recipe
  // And for the amount brought down to the queue
  test("picking a recipe brings an amount past its queue down to the queue", async () => {
    expect.hasAssertions();

    const onUpdateAmount = vi.fn<(amount: number) => void>();
    const onUpdateRecipeId = vi.fn<(recipeId: number) => void>();
    const { container } = await render(ForgeScreenContainer, {
      props: {
        ...props,
        "onUpdate:amount": onUpdateAmount,
        "onUpdate:recipeId": onUpdateRecipeId,
        recipes: [...props.recipes, weaponRecipe],
      },
    });

    // The weapon's recipe is listed after the three ores' recipes
    [...container.querySelectorAll<HTMLButtonElement>(".recipe")].at(-1)?.click();

    expect(onUpdateRecipeId).toHaveBeenCalledExactlyOnceWith(weaponRecipe.id);
    expect(onUpdateAmount).toHaveBeenCalledExactlyOnceWith(weaponRecipe.queueSize);
  });
});
