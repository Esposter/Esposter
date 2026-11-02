import type { WishResult } from "#src/models/wish/WishResult";
import type { WishResultCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { fillGameTextValues, GameTextKey } from "genshin-text";
import { ref } from "vue";

interface WishResultsSource {
  // The game's words in the reader's language
  getGameText: () => GameText;
  // The names the stat tables cite by text id, in the reader's language
  getNameText: () => Readonly<Record<string, string>>;
  // The text id of each character's own Stella Fortuna's name, by the character's id, for a character with one set
  getStellaFortunaNameTextIdMap: () => ReadonlyMap<number, string>;
  // The count text of an amount of a currency, in the reader's language
  toCountText: (currency: Currency, quantity: number) => string;
}

// The cards the screen shows, which a set's draws replace, and the card each drawn result shows: its name, rarity and
// Capturing radiance, and the Stella Fortuna and the return it brought as their count texts
export const useWishResults = ({
  getGameText,
  getNameText,
  getStellaFortunaNameTextIdMap,
  toCountText,
}: WishResultsSource) => {
  const results = ref<WishResultCell[]>([]);
  // The Stella Fortuna a result brought, as its count text: the drawn character's own, named in the reader's language, or the
  // Masterless one a five-star past six copies brought, "" for none
  const toStellaFortunaText = ({ item, masterlessStellaFortunaCount, stellaFortunaCount }: WishResult): string => {
    if (stellaFortunaCount) {
      const nameTextId = getStellaFortunaNameTextIdMap().get(item.id);
      // A name the names do not hold yet shows no count, rather than a bare one
      const name = nameTextId === undefined ? "" : getNameText()[nameTextId];
      return name ? fillGameTextValues(getGameText()[GameTextKey.ItemCount], name, stellaFortunaCount) : "";
    }
    return masterlessStellaFortunaCount
      ? toCountText(Currency.MasterlessStellaFortuna, masterlessStellaFortunaCount)
      : "";
  };
  const toResultCell = (wishResult: WishResult): WishResultCell => {
    const {
      item: { name, rarity },
      wishReturn,
    } = wishResult;
    return {
      name,
      rarity,
      stellaFortuna: toStellaFortunaText(wishResult),
      wishReturn: wishReturn ? toCountText(wishReturn.currency, wishReturn.quantity) : "",
    };
  };
  return { results, toResultCell };
};
