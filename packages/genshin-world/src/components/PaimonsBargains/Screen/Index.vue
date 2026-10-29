<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Currency } from "#src/models/inventory/Currency";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { PaimonsBargainsGood, PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { CurrencyCount, ShopGoodCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { useShopGoodCells } from "#src/composables/useShopGoodCells";
import { useShopPick } from "#src/composables/useShopPick";
import { ShopOfferKind } from "#src/models/shop/ShopOfferKind";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";
import { buyPaimonsBargainsCharacter } from "#src/services/shop/buyPaimonsBargainsCharacter";
import { buyPaimonsBargainsWeapon } from "#src/services/shop/buyPaimonsBargainsWeapon";
import { buyShopGoodCount } from "#src/services/shop/buyShopGoodCount";
import { checkIsCurrencyOnlyGood } from "#src/services/shop/checkIsCurrencyOnlyGood";
import { checkIsShopGoodOffered } from "#src/services/shop/checkIsShopGoodOffered";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { getPaimonsBargainsGoods } from "#src/services/shop/getPaimonsBargainsGoods";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { GameScreen, ShopScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// What buying one offer leaves in the player's hands and in the shop's record
interface Bought {
  characters: Character[];
  inventory: Inventory;
  purchases: ShopPurchase[];
  wallet: Wallet;
}

// A good on offer: a Fate the shop's dataset gives, or a character or weapon of the rotation
type Offer =
  | { good: PaimonsBargainsGood; kind: ShopOfferKind.Character | ShopOfferKind.Weapon }
  | { good: ShopGood; kind: ShopOfferKind.Fate };
interface Props {
  // The Adventure Rank the player has reached, which opens the Fates the shop sells from it
  adventureRank: number;
  // The characters of the game's roster by id, whose names and data a character on offer is shown and joined from
  characterDataMap: ReadonlyMap<number, CharacterData>;
  // The game's words in the reader's language
  gameText: GameText;
  // The world's clock as a purchase reads it at the moment the purchase is made
  getWorldNow: () => Temporal.Instant;
  // The Fates the shop sells, as its dataset holds them, before their sale dates and rank are checked
  goods: ShopGood[];
  // The game's material table by item id, which each Fate's name is read from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items and characters in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The world's clock as the screen shows it, which the Fates and offers on show and their refreshes are read at
  now: Temporal.Instant;
  // The rotation of characters and weapons the shop offers in turn
  rotation: PaimonsBargainsRotation;
  // The game's weapon table by weapon id, which each weapon on offer is named and defined from
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}

const {
  adventureRank,
  characterDataMap,
  gameText,
  getWorldNow,
  goods,
  materialDataMap,
  nameText,
  now,
  rotation,
  weaponDataMap,
} = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const { count, goodId, resetShopPick } = useShopPick();
const characters = defineModel<Character[]>("characters", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
// Every good bought, by its id and the moment it was bought, which each good's limit is counted from
const purchases = defineModel<ShopPurchase[]>("purchases", { required: true });
// The currency a cost is paid in; a cost the wallet does not trade is a bad row, as nothing here could pay for it
const currencyOf = (itemId: number): Currency => {
  const currency = ShopItemCurrencyMap[itemId];
  if (currency === undefined)
    throw new InvalidOperationError(Operation.Read, String(itemId), "is not a currency the shop trades in");
  return currency;
};
const offers = computed<Offer[]>(() => {
  const fates = goods.flatMap((good): Offer[] =>
    checkIsCurrencyOnlyGood(good) && checkIsShopGoodOffered(good, adventureRank, now)
      ? [{ good, kind: ShopOfferKind.Fate }]
      : [],
  );
  const { characterGoods, weaponGoods } = getPaimonsBargainsGoods(rotation, now);
  return [
    ...fates,
    ...characterGoods.map((good): Offer => ({ good, kind: ShopOfferKind.Character })),
    ...weaponGoods.map((good): Offer => ({ good, kind: ShopOfferKind.Weapon })),
  ];
});
const nameOfCharacter = (characterId: number): string =>
  nameText[characterDataMap.get(characterId)?.nameTextId ?? ""] ?? "";
const getWeaponDefinition = (weaponId: number): ItemDefinition => {
  const weaponData = weaponDataMap.get(weaponId);
  if (!weaponData) throw new InvalidOperationError(Operation.Read, String(weaponId), "has no weapon data");
  return toWeaponDefinition(weaponData, nameText[weaponData.nameTextId] ?? "");
};
const pickedOffer = computed(() => offers.value.find(({ good }) => good.goodsId === goodId.value));
const balances = computed<CurrencyCount[]>(() =>
  Array.from(
    new Set(offers.value.flatMap(({ good }) => good.costs.map(({ itemId }) => currencyOf(itemId)))),
    (currency) => ({
      id: currency,
      isTopUp: false,
      name: gameText[takeOne(CurrencyGameTextKeyMap, currency)],
      quantity: wallet.value[currency],
    }),
  ),
);
// The name each offer is drawn under: a Fate's item, a character's name, or a weapon's name
const offerNames = computed(() =>
  offers.value.map(({ good, kind }) => ({
    good,
    name:
      kind === ShopOfferKind.Fate
        ? getItemDefinition(good.itemId, nameText, materialDataMap).name
        : kind === ShopOfferKind.Character
          ? nameOfCharacter(good.itemId)
          : getWeaponDefinition(good.itemId).name,
  })),
);
const goodCells = useShopGoodCells({
  getCostName: (itemId) => gameText[takeOne(CurrencyGameTextKeyMap, currencyOf(itemId))],
  getGameText: () => gameText,
  getNow: () => now,
  goods: offerNames,
  purchases,
});
// The most the picked good can be bought for: a Fate counts its limit left and the player's currency, a character or a
// Weapon of the rotation is bought one at a time
const countMaximum = computed(() => {
  if (!pickedOffer.value) return 0;
  const { good, kind } = pickedOffer.value;
  if (kind !== ShopOfferKind.Fate) return 1;
  const left = computeShopGoodLeft(good, purchases.value, now) ?? Number.POSITIVE_INFINITY;
  const affordable = Math.min(
    ...good.costs.map((cost) => (cost.count > 0 ? Math.floor(wallet.value[currencyOf(cost.itemId)] / cost.count) : 1)),
  );
  return Math.min(left, affordable);
});
// What buying an offer the count asks for leaves, or undefined where nothing is bought
const buyOffer = (offer: Offer, buyCount: number): Bought | undefined => {
  if (offer.kind === ShopOfferKind.Fate) {
    const bought = buyShopGoodCount(
      wallet.value,
      inventory.value,
      (itemId) => getItemDefinition(itemId, nameText, materialDataMap),
      purchases.value,
      offer.good,
      buyCount,
      adventureRank,
      getWorldNow(),
    );
    return bought.purchases === purchases.value ? undefined : { ...bought, characters: characters.value };
  }
  if (offer.kind === ShopOfferKind.Character) {
    const bought = buyPaimonsBargainsCharacter(
      wallet.value,
      characters.value,
      purchases.value,
      offer.good,
      characterDataMap,
      getWorldNow(),
    );
    return bought && { ...bought, inventory: inventory.value };
  }
  const bought = buyPaimonsBargainsWeapon(
    wallet.value,
    inventory.value,
    purchases.value,
    offer.good,
    getWeaponDefinition,
    getWorldNow(),
  );
  return bought && { ...bought, characters: characters.value };
};
// Buys the picked good and keeps what the purchase leaves, then clears the picked good
const buy = (good: ShopGoodCell, buyCount: number) => {
  const offer = offers.value.find(({ good: offered }) => offered.goodsId === good.id);
  const bought = offer && buyOffer(offer, buyCount);
  if (!bought) return;
  characters.value = bought.characters;
  inventory.value = bought.inventory;
  purchases.value = bought.purchases;
  wallet.value = bought.wallet;
  resetShopPick();
};
</script>

<template>
  <!-- Paimon's Bargains, opened from the Paimon menu's Shop entry: the Fates the shop sells, and the characters and weapons of
       the month's rotation, each with its costs, limit and refresh, the count the player buys and the Buy button -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.PaimonsBargains]">
    <ShopScreen
      v-model:count="count"
      v-model:good-id="goodId"
      :balances
      :buy-label="gameText[GameTextKey.ShopPurchase]"
      :close-label="gameText[GameTextKey.Back]"
      :count-label="gameText[GameTextKey.CraftingAmount]"
      :count-maximum
      :goods="goodCells"
      :tabs="[]"
      :title="gameText[GameTextKey.PaimonsBargains]"
      @buy="(good, count) => buy(good, count)"
      @close="emit('close')"
    />
  </GameScreen>
</template>
