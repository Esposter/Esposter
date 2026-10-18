import { props, variants } from "#src/components/Weapon/Screen/Index.fixture";
import WeaponScreenContainer from "#src/components/Weapon/Screen/Index.vue";
import { Currency } from "#src/models/inventory/Currency";
import type { Weapon } from "#src/models/weapon/Weapon";
import { describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import { page } from "vitest/browser";
import { ENGLISH_GAME_TEXT, fillGameTextValues, GameLanguage, GameTextKey, GameTextLoaderMap } from "genshin-text";

const weaponName = props.nameText[props.weaponData.nameTextId] ?? "";
const levelText = fillGameTextValues(
  ENGLISH_GAME_TEXT[GameTextKey.LevelFormat],
  `${props.weapon.level}/${props.weaponData.ascensionPhases[0]?.maxLevel ?? props.weapon.level}`,
);
// The first ore in the bag, which the Enhance tab picks one of
const oreName = props.inventory.items[0]?.definition.name ?? "";

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

  // Enhance with an ore picked while the wallet holds no Mora to pay its EXP: nothing is spent, no weapon is written back
  test("enhance is refused when the wallet is short of Mora", async () => {
    expect.hasAssertions();

    const onUpdateWeapon = vi.fn<(weapon: Weapon) => void>();
    render(WeaponScreenContainer, {
      props: { ...props, "onUpdate:weapon": onUpdateWeapon, wallet: { ...props.wallet, [Currency.Mora]: 0 } },
    });

    await page.getByText(oreName, { exact: true }).first().click();
    await page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponEnhance], { exact: true }).last().click();
    expect(onUpdateWeapon).not.toHaveBeenCalled();
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

  // The weapon at its cap with the next phase's Mora and items held: the weapon is written back one phase up
  test("ascend spends the phase's Mora and items", async () => {
    expect.hasAssertions();

    const onUpdateWeapon = vi.fn<(weapon: Weapon) => void>();
    render(WeaponScreenContainer, { props: { ...props, ...variants.ascend, "onUpdate:weapon": onUpdateWeapon } });

    await page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponAscend], { exact: true }).last().click();
    expect(onUpdateWeapon).toHaveBeenCalledWith({ ...variants.ascend.weapon, ascension: 1 });
  });

  // The Adventure Rank below the next phase's requirement: the weapon is not written back
  test("ascend is refused below the Adventure Rank", async () => {
    expect.hasAssertions();

    const onUpdateWeapon = vi.fn<(weapon: Weapon) => void>();
    render(WeaponScreenContainer, {
      props: { ...props, ...variants.ascend, adventureRank: 0, "onUpdate:weapon": onUpdateWeapon },
    });

    await page.getByText(ENGLISH_GAME_TEXT[GameTextKey.WeaponAscend], { exact: true }).last().click();
    expect(onUpdateWeapon).not.toHaveBeenCalled();
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
