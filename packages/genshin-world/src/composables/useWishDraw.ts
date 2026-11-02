import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Banner } from "#src/models/wish/Banner";
import type { WishDrawSave } from "#src/models/wish/WishDrawSave";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishResult } from "#src/models/wish/WishResult";
import type { BannerKind, WishResultCell } from "genshin-interface";
import type { Ref } from "vue";

import { WishItemKind } from "#src/models/wish/WishItemKind";
import { addStellaFortuna } from "#src/services/character/addStellaFortuna";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";
import { appendWishHistory } from "#src/services/wish/appendWishHistory";
import { getNewCharacters } from "#src/services/wish/getNewCharacters";
import { makeWishes } from "#src/services/wish/makeWishes";
import { sortWishResults } from "#src/services/wish/sortWishResults";
import { InvalidOperationError, Operation } from "@esposter/shared";

interface WishDrawSource {
  // The copies of each character the player holds, which the set's draws add to
  characterCopyCountMap: Ref<ReadonlyMap<number, number>>;
  // The player's characters, which a character drawn for the first time joins
  characters: Ref<Character[]>;
  // The banner the screen is on, read as a set is drawn
  getBanner: () => Banner | undefined;
  // The game's stat tables, which a drawn weapon and a drawn character are read from
  getStatTables: () => StatTables;
  // The world's clock as a draw reads it at the moment the draw is made
  getWorldNow: () => Temporal.Instant;
  // The bag a drawn weapon goes into
  inventory: Ref<Inventory>;
  // Each kind's counters, which the set's wishes advance
  pityMap: Ref<Readonly<Record<BannerKind, WishPity>>>;
  // The cards the screen shows, which a set's draws replace
  results: Ref<WishResultCell[]>;
  // The card a drawn result shows
  toResultCell: (wishResult: WishResult) => WishResultCell;
  // The Fates are spent from and the returns go into
  wallet: Ref<Wallet>;
  // The draws the wish history keeps, which the draws of each set are appended to
  wishHistory: Ref<WishDrawSave[]>;
}

// A set's wishes made: the counters, the wallet and the characters' copies after them, every weapon drawn into the bag,
// And what each drew shown until a click goes on, a card each in the order the game shows them
export const useWishDraw =
  ({
    characterCopyCountMap,
    characters,
    getBanner,
    getStatTables,
    getWorldNow,
    inventory,
    pityMap,
    results,
    toResultCell,
    wallet,
    wishHistory,
  }: WishDrawSource) =>
  (count: number) => {
    const banner = getBanner();
    if (!banner) return;
    const { characterDataMap, weaponDataMap } = getStatTables();
    const wishes = makeWishes(
      {
        banner,
        count,
        heldCountMap: characterCopyCountMap.value,
        pity: pityMap.value[banner.kind],
        wallet: wallet.value,
      },
      () => Math.random(),
    );
    let nextInventory = inventory.value;
    for (const { item } of wishes.results)
      if (item.kind === WishItemKind.Weapon) {
        const weaponData = weaponDataMap.get(item.id);
        if (!weaponData) throw new InvalidOperationError(Operation.Read, String(item.id), "has no weapon data");
        nextInventory = addInventoryItem(nextInventory, toWeaponDefinition(weaponData, item.name), 1).inventory;
      }
    // A character drawn for the first time joins the roster in the order it was drawn, a duplicate only counting a copy, and
    // Each duplicate's Stella Fortuna is added to its character as the draw lands, a new character's second copy included
    const newCharacters = getNewCharacters(characterCopyCountMap.value, wishes.heldCountMap, characterDataMap);
    characters.value = addStellaFortuna([...characters.value, ...newCharacters], wishes.stellaFortunaCountMap);
    characterCopyCountMap.value = wishes.heldCountMap;
    inventory.value = nextInventory;
    pityMap.value = { ...pityMap.value, [banner.kind]: wishes.pity };
    const { kind } = banner;
    const drawnAt = getWorldNow();
    wishHistory.value = appendWishHistory(
      wishHistory.value,
      wishes.results.map(({ item }) => ({ bannerKind: kind, itemId: item.id, time: drawnAt.toString() })),
      drawnAt,
    );
    wallet.value = wishes.wallet;
    results.value = sortWishResults(wishes.results).map((wishResult) => toResultCell(wishResult));
  };
