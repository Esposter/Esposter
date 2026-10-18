import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import {
  atCapWeapon,
  COPY_ENTRY_ID,
  FODDER_ENTRY_ID,
  fodderName,
  OPEN_ENTRY_ID,
  ORE_ID,
  oreName,
  props,
  variants,
  weaponData,
} from "#src/components/Weapon/Screen/Index.fixture";
import WeaponScreenContainer from "#src/components/Weapon/Screen/Index.vue";
import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { getBagWeapon } from "#src/services/weapon/getBagWeapon";
import { ENGLISH_GAME_TEXT, fillGameTextValues, GameLanguage, GameTextKey, GameTextLoaderMap } from "genshin-text";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";

const weaponName = props.nameText[weaponData.nameTextId] ?? "";
const levelTextOf = (level: number, maxLevel: number) =>
  fillGameTextValues(ENGLISH_GAME_TEXT[GameTextKey.LevelFormat], `${level}/${maxLevel}`);
const levelText = levelTextOf(1, weaponData.ascensionPhases[0]?.maxLevel ?? 1);
// The copy in the bag sits at the level cap, whose text is the open weapon's text at the cap
const copyLevelText = levelTextOf(atCapWeapon.level, weaponData.ascensionPhases[0]?.maxLevel ?? atCapWeapon.level);

describe("weaponScreen", () => {
  // The weapon's name and its level over the phase's cap, as the game's own level format writes them
  test("the weapon screen opens on a held weapon", async () => {
    expect.hasAssertions();

    render(WeaponScreenContainer, { props });

    await expect.element(page.getByText(weaponName, { exact: true })).toBeVisible();
    await expect.element(page.getByText(levelText, { exact: true })).toBeVisible();
  });

  // The Enhance tab's name, the first action the weapon screen offers, in the reader's game language
  test("the action labels read in the reader's game language", async () => {
    expect.hasAssertions();

    const gameText = await GameTextLoaderMap[GameLanguage.German]();
    render(WeaponScreenContainer, { props: { ...props, gameText } });

    await expect.element(page.getByText(gameText[GameTextKey.WeaponEnhance], { exact: true }).first()).toBeVisible();
  });

  // Enhance with an ore picked while the wallet holds no Mora to pay its EXP: nothing is spent, and the bag is not written back
  test("enhance is refused when the wallet is short of Mora", async () => {
    expect.hasAssertions();

    const onUpdateInventory = vi.fn<(inventory: Inventory) => void>();
    render(WeaponScreenContainer, {
      props: { ...props, "onUpdate:inventory": onUpdateInventory, wallet: { ...props.wallet, [Currency.Mora]: 0 } },
    });

    await page.getByText(oreName, { exact: true }).first().click();
    await page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponEnhance], { exact: true }).last().click();
    expect(onUpdateInventory).not.toHaveBeenCalled();
  });

  // Enhance with an ore and a fodder weapon picked: both leave the bag, the ore's count drops by one and the weapon levels up
  test("enhance applies the chosen ores and fodder", async () => {
    expect.hasAssertions();

    const onUpdateInventory = vi.fn<(inventory: Inventory) => void>();
    render(WeaponScreenContainer, { props: { ...props, "onUpdate:inventory": onUpdateInventory } });

    await page.getByText(oreName, { exact: true }).first().click();
    await page.getByText(fodderName, { exact: true }).first().click();
    await page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponEnhance], { exact: true }).last().click();

    expect(onUpdateInventory).toHaveBeenCalledTimes(1);
    const writtenInventory = onUpdateInventory.mock.calls[0]?.[0];
    expect(writtenInventory?.items.some((item) => item.id === FODDER_ENTRY_ID)).toBe(false);
    expect(countInventoryItem(writtenInventory?.items ?? [], ORE_ID)).toBe(2);
    expect(getBagWeapon(writtenInventory?.items ?? [], OPEN_ENTRY_ID).level).toBeGreaterThan(1);
  });

  // Ascend is absent below the level cap and offered at it
  test("ascend is offered only at the level cap", async () => {
    expect.hasAssertions();

    render(WeaponScreenContainer, { props });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponAscend], { exact: true }))
      .not.toBeInTheDocument();

    render(WeaponScreenContainer, { props: { ...props, ...variants.atCap } });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponAscend], { exact: true }).first())
      .toBeVisible();
  });

  // The weapon at its cap with the next phase's Mora and items held: the weapon's entry moves one phase up, and the Mora is spent
  test("ascend spends the phase's Mora and items", async () => {
    expect.hasAssertions();

    const onUpdateInventory = vi.fn<(inventory: Inventory) => void>();
    const onUpdateWallet = vi.fn<(wallet: Wallet) => void>();
    render(WeaponScreenContainer, {
      props: {
        ...props,
        ...variants.ascend,
        "onUpdate:inventory": onUpdateInventory,
        "onUpdate:wallet": onUpdateWallet,
      },
    });

    await page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponAscend], { exact: true }).last().click();

    expect(onUpdateInventory).toHaveBeenCalledTimes(1);
    expect(getBagWeapon(onUpdateInventory.mock.calls[0]?.[0].items ?? [], OPEN_ENTRY_ID)).toStrictEqual({
      ...atCapWeapon,
      ascension: 1,
    });
    expect(onUpdateWallet).toHaveBeenCalledWith(EMPTY_WALLET);
  });

  // The Adventure Rank below the next phase's requirement: the bag is not written back
  test("ascend is refused below the Adventure Rank", async () => {
    expect.hasAssertions();

    const onUpdateInventory = vi.fn<(inventory: Inventory) => void>();
    render(WeaponScreenContainer, {
      props: { ...props, ...variants.ascend, adventureRank: 0, "onUpdate:inventory": onUpdateInventory },
    });

    await page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponAscend], { exact: true }).last().click();
    expect(onUpdateInventory).not.toHaveBeenCalled();
  });

  // Refine with a copy picked: the copy leaves the bag, the weapon gains the copy's rank, and that rank's Mora is spent
  test("refine adds a rank for a copy and the rank's mora", async () => {
    expect.hasAssertions();

    const onUpdateInventory = vi.fn<(inventory: Inventory) => void>();
    const onUpdateWallet = vi.fn<(wallet: Wallet) => void>();
    render(WeaponScreenContainer, {
      props: {
        ...props,
        ...variants.refine,
        "onUpdate:inventory": onUpdateInventory,
        "onUpdate:wallet": onUpdateWallet,
      },
    });

    await page.getByText(copyLevelText, { exact: true }).click();
    await page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponRefine], { exact: true }).last().click();

    expect(onUpdateInventory).toHaveBeenCalledTimes(1);
    const writtenInventory = onUpdateInventory.mock.calls[0]?.[0];
    expect(writtenInventory?.items.some((item) => item.id === COPY_ENTRY_ID)).toBe(false);
    expect(getBagWeapon(writtenInventory?.items ?? [], OPEN_ENTRY_ID).refinement).toBe(2);
    expect(onUpdateWallet).toHaveBeenCalledWith({
      ...props.wallet,
      [Currency.Mora]: props.wallet[Currency.Mora] - (weaponData.refinementCosts[0] ?? 0),
    });
  });

  // Refine is absent at rank five, the weapon's last rank
  test("refine is not offered at rank five", async () => {
    expect.hasAssertions();

    render(WeaponScreenContainer, { props: { ...props, ...variants.rankFive } });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponRefine], { exact: true }))
      .not.toBeInTheDocument();
  });

  // Refine is absent for a two-star weapon, which the game gives no refinement costs at all
  test("refine is not offered for a two-star weapon", async () => {
    expect.hasAssertions();

    render(WeaponScreenContainer, { props: { ...props, ...variants.twoStar } });

    await expect
      .element(page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponRefine], { exact: true }))
      .not.toBeInTheDocument();
  });
});
