<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Banner } from "#src/models/wish/Banner";
import type { WishItem } from "#src/models/wish/WishItem";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishResultCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { WishItemKind } from "#src/models/wish/WishItemKind";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { BannerKindFateMap } from "#src/services/wish/BannerKindFateMap";
import { BannerKindGameTextKeyMap } from "#src/services/wish/BannerKindGameTextKeyMap";
import { checkIsWishSetOffered } from "#src/services/wish/checkIsWishSetOffered";
import { BEGINNERS_WISH_LIMIT, FATE_POINT_LIMIT, TEN_WISH_COUNT } from "#src/services/wish/constants";
import { getWishCost } from "#src/services/wish/getWishCost";
import { makeWishes } from "#src/services/wish/makeWishes";
import { sortWishResults } from "#src/services/wish/sortWishResults";
import { BannerKind, BannerKinds, GameScreen, ItemCategory, WishScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The banners the world offers, one of a kind
  banners: Banner[];
  // The game's words in the reader's language
  gameText: GameText;
}

// The copies of each character the player holds, the bag a drawn weapon goes into, each kind's counters and the wallet
// The Fates are spent from and the returns go into
const characterCopyCountMap = defineModel<ReadonlyMap<number, number>>("characterCopyCountMap", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const pityMap = defineModel<Readonly<Record<BannerKind, WishPity>>>("pityMap", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const { banners, gameText } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The banners on offer in the game's order, the beginners' wish gone once its wishes are made
const bannerKinds = computed(() =>
  BannerKinds.filter(
    (bannerKind) =>
      banners.some(({ kind }) => kind === bannerKind) &&
      (bannerKind !== BannerKind.Beginners || pityMap.value[bannerKind].wishCount < BEGINNERS_WISH_LIMIT),
  ),
);
const bannerKind = ref(bannerKinds.value[0]);
const bannerLabels = computed(() =>
  Object.fromEntries(BannerKinds.map((kind) => [kind, gameText[BannerKindGameTextKeyMap[kind]]])),
);
const toCountText = (currency: Currency, quantity: number) =>
  fillGameTextValues(gameText[GameTextKey.ItemCount], gameText[CurrencyGameTextKeyMap[currency]], quantity);
// The open banner's ×1 and ×10, each offered while the wallet holds its Fates and the beginners' wish has room for it
const sets = computed(() => {
  const kind = bannerKind.value;
  if (!kind) return [];
  return [1, TEN_WISH_COUNT].map((count) => {
    const { currency, quantity } = getWishCost(kind, count);
    return {
      cost: toCountText(currency, quantity),
      count,
      isAffordable: checkIsWishSetOffered(kind, pityMap.value[kind], wallet.value, count),
      label: fillGameTextValues(gameText[GameTextKey.WishCount], count),
    };
  });
});
const currencies = computed(() =>
  [Currency.Primogem, ...(bannerKind.value ? [BannerKindFateMap[bannerKind.value]] : [])].map((currency) => ({
    id: currency,
    name: gameText[CurrencyGameTextKeyMap[currency]],
    quantity: wallet.value[currency],
  })),
);
const isWeaponWish = computed(() => bannerKind.value === BannerKind.WeaponEvent);
const banner = computed(() => banners.find(({ kind }) => kind === bannerKind.value));
const toPoolCells = (items: WishItem[], isFeatured: boolean) =>
  items.map(({ id, name, rarity }) => ({ id, isFeatured, name, rarity }));
// What the open banner can draw, the highest rarity first and its featured items first of each rarity
const pool = computed(() => {
  if (!banner.value) return [];
  const { featuredFiveStars, featuredFourStars, fiveStars, fourStars, threeStars } = banner.value;
  return [
    ...toPoolCells(featuredFiveStars, true),
    ...toPoolCells(fiveStars, false),
    ...toPoolCells(featuredFourStars, true),
    ...toPoolCells(fourStars, false),
    ...toPoolCells(threeStars, false),
  ];
});
const results = ref<WishResultCell[]>([]);
// A set's wishes made: the counters, the wallet and the characters' copies after them, every weapon drawn into the bag,
// And what each drew shown until a click goes on, a card each in the order the game shows them
const wish = (count: number) => {
  if (!banner.value) return;
  const wishes = makeWishes(
    {
      banner: banner.value,
      count,
      heldCountMap: characterCopyCountMap.value,
      pity: pityMap.value[banner.value.kind],
      wallet: wallet.value,
    },
    () => Math.random(),
  );
  let nextInventory = inventory.value;
  for (const { item } of wishes.results)
    if (item.kind === WishItemKind.Weapon)
      nextInventory = addInventoryItem(
        nextInventory,
        { category: ItemCategory.Weapon, id: item.id, name: item.name, rank: 0, rarity: item.rarity, stackLimit: 1 },
        1,
      ).inventory;
  characterCopyCountMap.value = wishes.heldCountMap;
  inventory.value = nextInventory;
  pityMap.value = { ...pityMap.value, [banner.value.kind]: wishes.pity };
  wallet.value = wishes.wallet;
  results.value = sortWishResults(wishes.results).map(
    ({ isCapturingRadiance, item: { name, rarity }, wishReturn }) => ({
      isCapturingRadiance,
      name,
      rarity,
      wishReturn: wishReturn ? toCountText(wishReturn.currency, wishReturn.quantity) : "",
    }),
  );
};
</script>

<template>
  <!-- The wish, opened by F3 or the Paimon menu, on the first banner on offer -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Wish]">
    <WishScreen
      v-model:banner-kind="bannerKind"
      :back-label="gameText[GameTextKey.Back]"
      :banner-kinds
      :banner-labels
      :currencies
      :fate-points="
        isWeaponWish
          ? fillGameTextValues(
              gameText[GameTextKey.WishFatePoint],
              pityMap[BannerKind.WeaponEvent].fatePoints,
              FATE_POINT_LIMIT,
            )
          : ''
      "
      :path-label="isWeaponWish ? gameText[GameTextKey.WishEpitomizedPath] : ''"
      :pool
      :results
      :sets
      :title="gameText[GameTextKey.Wish]"
      @close="emit('close')"
      @dismiss="results = []"
      @wish="(count) => wish(count)"
    />
  </GameScreen>
</template>
