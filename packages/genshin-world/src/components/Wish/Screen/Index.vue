<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WishDrawSave } from "#src/models/wish/WishDrawSave";
import type { WishItem } from "#src/models/wish/WishItem";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishResult } from "#src/models/wish/WishResult";
import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";
import type { WishResultCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { WishItemKind } from "#src/models/wish/WishItemKind";
import { addStellaFortuna } from "#src/services/character/addStellaFortuna";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";
import { appendWishHistory } from "#src/services/wish/appendWishHistory";
import { BannerKindFateMap } from "#src/services/wish/BannerKindFateMap";
import { BannerKindGameTextKeyMap } from "#src/services/wish/BannerKindGameTextKeyMap";
import { buyWishFate } from "#src/services/wish/buyWishFate";
import { checkIsWishSetOffered } from "#src/services/wish/checkIsWishSetOffered";
import {
  BEGINNERS_WISH_LIMIT,
  FATE_POINT_LIMIT,
  FATE_PRIMOGEM_COST,
  TEN_WISH_COUNT,
} from "#src/services/wish/constants";
import { createBanners } from "#src/services/wish/createBanners";
import { getNewCharacters } from "#src/services/wish/getNewCharacters";
import { getOpenEventBanners } from "#src/services/wish/getOpenEventBanners";
import { getWishCost } from "#src/services/wish/getWishCost";
import { makeWishes } from "#src/services/wish/makeWishes";
import { sortWishResults } from "#src/services/wish/sortWishResults";
import { toWishHistoryCells } from "#src/services/wish/toWishHistoryCells";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { BannerKind, BannerKinds, GameScreen, WishScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The names the stat tables cite by text id, in the reader's language
  nameText: Readonly<Record<string, string>>;
  // The server's clock offset from this machine's, which the event banners are offered at the game's time by
  serverClockOffsetMs: number;
  // The game's stat tables, which the banners' pools are read from
  statTables: StatTables;
  // The text id of each character's own Stella Fortuna's name, by the character's id, for a character with one set
  stellaFortunaNameTextIdMap: ReadonlyMap<number, string>;
  // The wish schedule's event banners, each offered only inside its window
  wishSchedule: WishScheduleEvent[];
}

// The copies of each character the player holds, the bag a drawn weapon goes into, each kind's counters and the wallet
// The Fates are spent from and the returns go into
const characterCopyCountMap = defineModel<ReadonlyMap<number, number>>("characterCopyCountMap", { required: true });
// The player's characters, which a character drawn for the first time joins
const characters = defineModel<Character[]>("characters", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const pityMap = defineModel<Readonly<Record<BannerKind, WishPity>>>("pityMap", { required: true });
// The draws the wish history keeps, which the draws of each set are appended to
const wishHistory = defineModel<WishDrawSave[]>("wishHistory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const { gameText, nameText, serverClockOffsetMs, statTables, stellaFortunaNameTextIdMap, wishSchedule } =
  defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The banners the world offers now, their pools read from the stat tables and named in the reader's language: the
// Permanent ones and each event banner the schedule has open at the game's time
// The draws the History popup lists, each named from the stat tables and its banner labelled in the reader's language
const historyCells = computed(() =>
  toWishHistoryCells(
    wishHistory.value,
    (itemId) => {
      const data = statTables.characterDataMap.get(itemId) ?? statTables.weaponDataMap.get(itemId);
      return data ? { name: nameText[data.nameTextId] ?? "", rarity: data.rarity } : { name: "", rarity: 0 };
    },
    (bannerKind) =>
      splitGameTextColors(gameText[BannerKindGameTextKeyMap[bannerKind]])
        .map(({ text }) => text)
        .join(""),
    Temporal.Now.timeZoneId(),
  ),
);
const banners = computed(() =>
  createBanners(
    statTables,
    nameText,
    getOpenEventBanners(
      wishSchedule,
      Temporal.Now.instant().add({ milliseconds: serverClockOffsetMs }).epochMilliseconds,
    ),
  ),
);
// The banners on offer in the game's order, each kind's in the order the schedule gives them, the beginners' wish gone
// Once its wishes are made. Each is named in the runs of colour the game words its kind in, and a second banner of a kind
// Carries its number after the name
const bannerOffers = computed(() =>
  BannerKinds.flatMap((kind) =>
    kind === BannerKind.Beginners && pityMap.value[kind].wishCount >= BEGINNERS_WISH_LIMIT
      ? []
      : banners.value.filter((banner) => banner.kind === kind),
  ).map((banner) => ({
    id: banner.id,
    kind: banner.kind,
    label: [
      ...splitGameTextColors(gameText[BannerKindGameTextKeyMap[banner.kind]]),
      ...(banner.kindNumber > 1 ? [{ text: `-${banner.kindNumber}` }] : []),
    ],
  })),
);
const bannerId = ref(bannerOffers.value[0]?.id);
const bannerKind = computed(() => banners.value.find(({ id }) => id === bannerId.value)?.kind);
const toCountText = (currency: Currency, quantity: number) =>
  fillGameTextValues(gameText[GameTextKey.ItemCount], gameText[CurrencyGameTextKeyMap[currency]], quantity);
// The Stella Fortuna a result brought, as its count text: the drawn character's own, named in the reader's language, or the
// Masterless one a five-star past six copies brought, "" for none
const toStellaFortunaText = ({ item, masterlessStellaFortunaCount, stellaFortunaCount }: WishResult): string => {
  if (stellaFortunaCount) {
    const nameTextId = stellaFortunaNameTextIdMap.get(item.id);
    // A name the names do not hold yet shows no count, rather than a bare one
    const name = nameTextId === undefined ? "" : nameText[nameTextId];
    return name ? fillGameTextValues(gameText[GameTextKey.ItemCount], name, stellaFortunaCount) : "";
  }
  return masterlessStellaFortunaCount
    ? toCountText(Currency.MasterlessStellaFortuna, masterlessStellaFortunaCount)
    : "";
};
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
// The open banner's Fate bought with Primogems once the wallet holds too few Fates for its ×1, the game's direct purchase
const purchases = computed(() => {
  const kind = bannerKind.value;
  if (!kind) return [];
  const fate = BannerKindFateMap[kind];
  if (wallet.value[fate] >= getWishCost(kind, 1).quantity) return [];
  return [
    {
      cost: toCountText(Currency.Primogem, FATE_PRIMOGEM_COST),
      isAffordable: wallet.value[Currency.Primogem] >= FATE_PRIMOGEM_COST,
      label: fillGameTextValues(gameText[GameTextKey.WishBuyFate], gameText[CurrencyGameTextKeyMap[fate]]),
    },
  ];
});
// The open banner's Fate bought: the wallet takes its Primogems and gains the Fate
const buyFate = () => {
  const kind = bannerKind.value;
  if (!kind) return;
  wallet.value = buyWishFate(wallet.value, BannerKindFateMap[kind]);
};
const currencies = computed(() =>
  [Currency.Primogem, ...(bannerKind.value ? [BannerKindFateMap[bannerKind.value]] : [])].map((currency) => ({
    id: currency,
    name: gameText[CurrencyGameTextKeyMap[currency]],
    quantity: wallet.value[currency],
  })),
);
const isWeaponWish = computed(() => bannerKind.value === BannerKind.WeaponEvent);
// The Epitomized Path's Fate Points in the game's words and colours, which only the weapon wish shows
const fatePoints = computed(() =>
  isWeaponWish.value
    ? splitGameTextColors(
        fillGameTextValues(
          gameText[GameTextKey.WishFatePoint],
          pityMap.value[BannerKind.WeaponEvent].fatePoints,
          FATE_POINT_LIMIT,
        ),
      )
    : [],
);
const banner = computed(() => banners.value.find(({ id }) => id === bannerId.value));
// The Character Event banner's card, the banner the world builds its card for
const bannerCard = computed(() =>
  bannerKind.value === BannerKind.CharacterEvent
    ? {
        featuredTitle: gameText[GameTextKey.WishCharacterEventFeaturedTitle],
        rateUp: gameText[GameTextKey.WishRateUp],
        title: splitGameTextColors(gameText[GameTextKey.WishCharacterEventTitle]),
      }
    : undefined,
);
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
    if (item.kind === WishItemKind.Weapon) {
      const weaponData = statTables.weaponDataMap.get(item.id);
      if (!weaponData) throw new InvalidOperationError(Operation.Read, String(item.id), "has no weapon data");
      nextInventory = addInventoryItem(nextInventory, toWeaponDefinition(weaponData, item.name), 1).inventory;
    }
  // A character drawn for the first time joins the roster in the order it was drawn, a duplicate only counting a copy, and
  // Each duplicate's Stella Fortuna is added to its character as the draw lands, a new character's second copy included
  const newCharacters = getNewCharacters(characterCopyCountMap.value, wishes.heldCountMap, statTables.characterDataMap);
  characters.value = addStellaFortuna([...characters.value, ...newCharacters], wishes.stellaFortunaCountMap);
  characterCopyCountMap.value = wishes.heldCountMap;
  inventory.value = nextInventory;
  pityMap.value = { ...pityMap.value, [banner.value.kind]: wishes.pity };
  const { kind } = banner.value;
  const drawnAt = Temporal.Now.instant();
  wishHistory.value = appendWishHistory(
    wishHistory.value,
    wishes.results.map(({ item }) => ({ bannerKind: kind, itemId: item.id, time: drawnAt.toString() })),
    drawnAt,
  );
  wallet.value = wishes.wallet;
  results.value = sortWishResults(wishes.results).map((wishResult) => {
    const {
      isCapturingRadiance,
      item: { name, rarity },
      wishReturn,
    } = wishResult;
    return {
      isCapturingRadiance,
      name,
      rarity,
      stellaFortuna: toStellaFortunaText(wishResult),
      wishReturn: wishReturn ? toCountText(wishReturn.currency, wishReturn.quantity) : "",
    };
  });
};
</script>

<template>
  <!-- The wish, opened by F3 or the Paimon menu, on the first banner on offer -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Wish]">
    <WishScreen
      v-model:banner-id="bannerId"
      :back-label="gameText[GameTextKey.Back]"
      :banner-card
      :banners="bannerOffers"
      :currencies
      :details-label="gameText[GameTextKey.WishDetails]"
      :fate-points
      :history="historyCells"
      :history-label="gameText[GameTextKey.WishHistory]"
      :path-label="isWeaponWish ? gameText[GameTextKey.WishEpitomizedPath] : ''"
      :pool
      :probability-label="gameText[GameTextKey.WishProbabilityUp]"
      :purchases
      :results
      :shop-label="gameText[GameTextKey.Shop]"
      :sets
      :title="gameText[GameTextKey.Wish]"
      @buy="buyFate()"
      @close="emit('close')"
      @dismiss="results = []"
      @wish="(count) => wish(count)"
    />
  </GameScreen>
</template>
