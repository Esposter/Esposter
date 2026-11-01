<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Trial } from "#src/models/trial/Trial";
import type { WishDrawSave } from "#src/models/wish/WishDrawSave";
import type { WishItem } from "#src/models/wish/WishItem";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishResult } from "#src/models/wish/WishResult";
import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";
import type { WishResultCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { useWishDraw } from "#src/composables/useWishDraw";
import { Currency } from "#src/models/inventory/Currency";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from "#src/services/time/constants";
import { findBannerTrial } from "#src/services/trial/findBannerTrial";
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
import { getOpenEventBanners } from "#src/services/wish/getOpenEventBanners";
import { getWishCost } from "#src/services/wish/getWishCost";
import { toWishHistoryCells } from "#src/services/wish/toWishHistoryCells";
import { MILLISECONDS_PER_SECOND } from "@esposter/shared";
import { BannerKind, BannerKinds, GameScreen, WishScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The world's clock as a draw reads it at the moment the draw is made
  getWorldNow: () => Temporal.Instant;
  // The names the stat tables cite by text id, in the reader's language
  nameText: Readonly<Record<string, string>>;
  // The world's clock as the screen shows it, at which the event banners on offer are read
  now: Temporal.Instant;
  // The game's stat tables, which the banners' pools are read from
  statTables: StatTables;
  // The text id of each character's own Stella Fortuna's name, by the character's id, for a character with one set
  stellaFortunaNameTextIdMap: ReadonlyMap<number, string>;
  // The character trials, each offered on the banner whose featured five-star is its character
  trials: readonly Trial[];
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
const { gameText, getWorldNow, nameText, now, statTables, stellaFortunaNameTextIdMap, trials, wishSchedule } =
  defineProps<Props>();
const emit = defineEmits<{ close: []; trial: [trial: Trial] }>();
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
// The banners the world offers now, their pools read from the stat tables and named in the reader's language: the
// Permanent ones and each event banner the schedule has open at the game's time
const banners = computed(() =>
  createBanners(statTables, nameText, getOpenEventBanners(wishSchedule, now.epochMilliseconds)),
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
const banner = computed(() => banners.value.find(({ id }) => id === bannerId.value));
const bannerKind = computed(() => banner.value?.kind);
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
    const { quantity } = getWishCost(kind, count);
    return {
      // The set's Fates are drawn as the game draws them, by their icon and count alone
      cost: `×${quantity}`,
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
// The Primogems at the head, and at the foot the open banner's Fate beside the Genesis Crystals the game counts there too
const currencies = computed(() =>
  [Currency.Primogem, ...(bannerKind.value ? [BannerKindFateMap[bannerKind.value]] : []), Currency.GenesisCrystal].map(
    (currency) => ({
      id: currency,
      isTopUp: currency === Currency.Primogem,
      name: gameText[CurrencyGameTextKeyMap[currency]],
      quantity: wallet.value[currency],
    }),
  ),
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
// The trial the open banner's featured character has, which the card's button opens
const bannerTrial = computed(() =>
  banner.value ? findBannerTrial(trials, banner.value.featuredFiveStars) : undefined,
);
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
// The five-star notice a card gives: the character one on a character event, the weapon one on a weapon event
const fiveStarNotice = computed(() => {
  if (bannerKind.value === BannerKind.CharacterEvent) return gameText[GameTextKey.WishFiveStarCharacterNotice];
  return bannerKind.value === BannerKind.WeaponEvent ? gameText[GameTextKey.WishFiveStarWeaponNotice] : "";
});
// The seconds left as the game's three parts, each counted in its unit's words, and the three joined by the game's format,
// "" on a banner with no window and otherwise the open event banner's window left by the screen's clock
const timeRemainingText = computed(() => {
  const event = wishSchedule.find(({ id }) => id === bannerId.value);
  if (!event) return "";
  const seconds = Math.max(0, Math.floor((event.endTime - now.epochMilliseconds) / MILLISECONDS_PER_SECOND));
  const days = Math.floor(seconds / SECONDS_PER_DAY);
  const hours = Math.floor((seconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  return fillGameTextValues(
    gameText[GameTextKey.WishTimeRemainingFormat],
    fillGameTextValues(gameText[GameTextKey.WishTimeRemainingDays], days),
    fillGameTextValues(gameText[GameTextKey.WishTimeRemainingHours], hours),
    fillGameTextValues(gameText[GameTextKey.WishTimeRemainingMinutes], minutes),
  );
});
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
// The card a drawn result shows: its name, rarity and capturing radiance, and the Stella Fortuna and the return it brought
// as their count texts
const toResultCell = (wishResult: WishResult): WishResultCell => {
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
};
const wish = useWishDraw({
  characterCopyCountMap,
  characters,
  getBanner: () => banner.value,
  getStatTables: () => statTables,
  getWorldNow,
  inventory,
  pityMap,
  results,
  toResultCell,
  wallet,
  wishHistory,
});
</script>

<template>
  <!-- The wish, opened by F3 or the Paimon menu, on the first banner on offer. The Fate on offer is bought with the
       wallet's Primogems, and the trial the banner's character has opens from its card -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Wish]">
    <WishScreen
      v-model:banner-id="bannerId"
      :back-label="gameText[GameTextKey.Back]"
      :banner-card
      :banners="bannerOffers"
      :currencies
      :details-label="gameText[GameTextKey.WishDetails]"
      :fate-points
      :five-star-notice
      :history="historyCells"
      :history-label="gameText[GameTextKey.WishHistory]"
      :path-label="isWeaponWish ? gameText[GameTextKey.WishEpitomizedPath] : ''"
      :pool
      :probability-label="gameText[GameTextKey.WishProbabilityUp]"
      :purchases
      :results
      :shop-label="gameText[GameTextKey.Shop]"
      :sets
      :time-remaining-label="gameText[GameTextKey.WishTimeRemaining]"
      :time-remaining-text
      :title="gameText[GameTextKey.Wish]"
      :trial-label="bannerTrial ? gameText[GameTextKey.WishGoToTrial] : ''"
      @buy="bannerKind && (wallet = buyWishFate(wallet, BannerKindFateMap[bannerKind]))"
      @close="emit('close')"
      @dismiss="results = []"
      @trial="bannerTrial && emit('trial', bannerTrial)"
      @wish="wish"
    />
  </GameScreen>
</template>
