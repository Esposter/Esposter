import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { PaimonsBargainsGood } from "#src/models/shop/PaimonsBargainsRotation";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { addStellaFortuna } from "#src/services/character/addStellaFortuna";
import { createCharacter } from "#src/services/character/createCharacter";
import { EMPTY_INVENTORY } from "#src/services/inventory/constants";
import { checkIsCurrencyOnlyGood } from "#src/services/shop/checkIsCurrencyOnlyGood";
import { checkIsPaimonsBargainsCharacterBuyable } from "#src/services/shop/checkIsPaimonsBargainsCharacterBuyable";
import { payShopGoodCosts } from "#src/services/shop/payShopGoodCosts";

// The wallet, roster and purchases after a character of Paimon's Bargains is bought at `now`.
// The character is the good's item id. A character the player does not hold joins the roster at level one.
// One held below its sixth constellation gains a Stella Fortuna instead, as a wish's duplicate does.
// Undefined where the character is at its sixth constellation, or the good is sold out this month.
// It is also undefined where the wallet cannot pay its price.
export const buyPaimonsBargainsCharacter = (
  wallet: Wallet,
  characters: readonly Character[],
  purchases: ShopPurchase[],
  good: PaimonsBargainsGood,
  characterDataMap: ReadonlyMap<number, CharacterData>,
  now: Temporal.Instant,
): { characters: Character[]; purchases: ShopPurchase[]; wallet: Wallet } | undefined => {
  const characterId = good.itemId;
  const held = characters.find(({ id }) => id === characterId);
  if (!checkIsCurrencyOnlyGood(good) || !checkIsPaimonsBargainsCharacterBuyable(held)) return undefined;
  const paid = payShopGoodCosts(wallet, EMPTY_INVENTORY, purchases, good, now);
  if (!paid) return undefined;
  return {
    characters: held
      ? addStellaFortuna(characters, new Map([[characterId, 1]]))
      : [...characters, createCharacter(characterId, characterDataMap)],
    purchases: paid.purchases,
    wallet: paid.wallet,
  };
};
