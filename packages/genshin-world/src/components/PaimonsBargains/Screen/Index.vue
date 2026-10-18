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

import { ShopOfferKind } from "#src/models/shop/ShopOfferKind";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";
import { buyPaimonsBargainsCharacter } from "#src/services/shop/buyPaimonsBargainsCharacter";
import { buyPaimonsBargainsWeapon } from "#src/services/shop/buyPaimonsBargainsWeapon";
import { buyShopGoodCount } from "#src/services/shop/buyShopGoodCount";
import { checkIsShopGoodOffered } from "#src/services/shop/checkIsShopGoodOffered";
import { computeNextShopRefreshTime } from "#src/services/shop/computeNextShopRefreshTime";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { formatShopRefreshCountdown } from "#src/services/shop/formatShopRefreshCountdown";
import { getPaimonsBargainsGoods } from "#src/services/shop/getPaimonsBargainsGoods";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";
import { ShopRefreshLimitGameTextKeyMap } from "#src/services/shop/ShopRefreshLimitGameTextKeyMap";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { GameScreen, ShopScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The Adventure Rank the player has reached, which opens the Fates the shop sells from it
  adventureRank: number;
  // The characters of the game's roster by id, whose names and data a character on offer is shown and joined from
  characterDataMap: ReadonlyMap<number, CharacterData>;
  // The game's words in the reader's language
  gameText: GameText;
  // The Fates the shop sells, as its dataset holds them, before their sale dates and rank are checked
  goods: ShopGood[];
  // The game's material table by item id, which each Fate's name is read from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items and characters in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The rotation of characters and weapons the shop offers in turn
  rotation: PaimonsBargainsRotation;
  // The game's weapon table by weapon id, which each weapon on offer is named and defined from
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}

// A good on offer with the currency it is paid in: a Fate the shop's dataset gives, or a character or weapon of the rotation
type Offer =
  | { good: ShopGood; kind: ShopOfferKind.Fate; priceCurrency: Currency }
  | { good: PaimonsBargainsGood; kind: ShopOfferKind.Character | ShopOfferKind.Weapon; priceCurrency: Currency };
// What buying one offer leaves in the player's hands and in the shop's record
interface Bought {
  characters: Character[];
  inventory: Inventory;
  purchases: ShopPurchase[];
  wallet: Wallet;
}

const { adventureRank, characterDataMap, gameText, goods, materialDataMap, nameText, rotation, weaponDataMap } =
  defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const characters = defineModel<Character[]>("characters", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
// Every good bought, by its id and the moment it was bought, which each good's limit is counted from
const purchases = defineModel<ShopPurchase[]>("purchases", { required: true });
const count = ref(1);
const goodId = ref(0);
const now = computed(() => Temporal.Now.instant());
const priceCurrencyOf = (good: PaimonsBargainsGood): Currency => {
  const priceCurrency = ShopItemCurrencyMap[good.priceItemId];
  if (priceCurrency === undefined)
    throw new InvalidOperationError(Operation.Read, String(good.priceItemId), "is not a currency the shop trades in");
  return priceCurrency;
};
const offers = computed<Offer[]>(() => {
  const fates = goods.flatMap((good): Offer[] => {
    const priceCurrency = ShopItemCurrencyMap[good.priceItemId];
    return priceCurrency !== undefined && checkIsShopGoodOffered(good, adventureRank, now.value)
      ? [{ good, kind: ShopOfferKind.Fate, priceCurrency }]
      : [];
  });
  const { characterGoods, weaponGoods } = getPaimonsBargainsGoods(rotation, now.value);
  return [
    ...fates,
    ...characterGoods.map((good): Offer => ({
      good,
      kind: ShopOfferKind.Character,
      priceCurrency: priceCurrencyOf(good),
    })),
    ...weaponGoods.map((good): Offer => ({ good, kind: ShopOfferKind.Weapon, priceCurrency: priceCurrencyOf(good) })),
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
  Array.from(new Set(offers.value.map(({ priceCurrency }) => priceCurrency)), (currency) => ({
    id: currency,
    name: gameText[takeOne(CurrencyGameTextKeyMap, currency)],
    quantity: wallet.value[currency],
  })),
);
const goodCells = computed<ShopGoodCell[]>(() =>
  offers.value.map((offer) => {
    const { good, priceCurrency } = offer;
    const left = computeShopGoodLeft(good, purchases.value, now.value);
    const limitKey = ShopRefreshLimitGameTextKeyMap[good.refresh];
    const nextRefreshTime = computeNextShopRefreshTime(good.refresh, now.value);
    return {
      id: good.goodsId,
      limitLabel:
        left === undefined || limitKey === undefined ? undefined : fillGameTextValues(gameText[limitKey], left),
      name:
        offer.kind === ShopOfferKind.Fate
          ? getItemDefinition(good.itemId, nameText, materialDataMap).name
          : offer.kind === ShopOfferKind.Character
            ? nameOfCharacter(good.itemId)
            : getWeaponDefinition(good.itemId).name,
      price: good.priceCount,
      priceName: gameText[takeOne(CurrencyGameTextKeyMap, priceCurrency)],
      refreshLabel:
        nextRefreshTime === undefined
          ? undefined
          : fillGameTextValues(
              gameText[GameTextKey.ShopRefresh],
              formatShopRefreshCountdown(now.value.until(nextRefreshTime)),
            ),
    };
  }),
);
// The most the picked good can be bought for: a Fate counts its limit left and the player's currency, a character or a
// Weapon of the rotation is bought one at a time
const countMaximum = computed(() => {
  if (!pickedOffer.value) return 0;
  const { good, kind, priceCurrency } = pickedOffer.value;
  if (kind !== ShopOfferKind.Fate) return 1;
  const left = computeShopGoodLeft(good, purchases.value, now.value) ?? Number.POSITIVE_INFINITY;
  const affordable = good.priceCount > 0 ? Math.floor(wallet.value[priceCurrency] / good.priceCount) : 1;
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
      now.value,
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
      now.value,
    );
    return bought && { ...bought, inventory: inventory.value };
  }
  const bought = buyPaimonsBargainsWeapon(
    wallet.value,
    inventory.value,
    purchases.value,
    offer.good,
    getWeaponDefinition,
    now.value,
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
  goodId.value = 0;
  count.value = 1;
};
</script>

<template>
  <!-- Paimon's Bargains, opened from the Paimon menu's Shop entry: the Fates the shop sells, and the characters and weapons of
       the month's rotation, each with its price, limit and refresh, the count the player buys and the Buy button -->
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
