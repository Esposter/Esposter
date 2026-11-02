<script setup lang="ts">
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Currency } from "#src/models/inventory/Currency";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Trial } from "#src/models/trial/Trial";
import type { WishDrawSave } from "#src/models/wish/WishDrawSave";
import type { WishPity } from "#src/models/wish/WishPity";
import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";
import type { BannerKind } from "genshin-interface";
import type { GameText } from "genshin-text";

import { useWishBanners } from "#src/composables/useWishBanners";
import { useWishCard } from "#src/composables/useWishCard";
import { useWishDraw } from "#src/composables/useWishDraw";
import { useWishEpitomizedPath } from "#src/composables/useWishEpitomizedPath";
import { useWishHistory } from "#src/composables/useWishHistory";
import { useWishOffers } from "#src/composables/useWishOffers";
import { useWishResults } from "#src/composables/useWishResults";
import { useWishTimeRemaining } from "#src/composables/useWishTimeRemaining";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { BannerKindFateMap } from "#src/services/wish/BannerKindFateMap";
import { buyWishFate } from "#src/services/wish/buyWishFate";
import { GameScreen, WishScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

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
const emit = defineEmits<{ close: []; startTrial: [trial: Trial] }>();
// An amount of a currency as the game's count text: its name and its count in the item-count format, in the reader's language
const toCountText = (currency: Currency, quantity: number) =>
  fillGameTextValues(gameText[GameTextKey.ItemCount], gameText[CurrencyGameTextKeyMap[currency]], quantity);
const { banner, bannerId, bannerKind, bannerOffers, pool } = useWishBanners({
  getGameText: () => gameText,
  getNameText: () => nameText,
  getNow: () => now,
  getStatTables: () => statTables,
  getWishSchedule: () => wishSchedule,
  pityMap,
});
const historyCells = useWishHistory({
  getGameText: () => gameText,
  getNameText: () => nameText,
  getStatTables: () => statTables,
  wishHistory,
});
const { currencies, purchases, sets } = useWishOffers({
  bannerKind,
  getGameText: () => gameText,
  pityMap,
  toCountText,
  wallet,
});
const { bannerCard, bannerTrial, fiveStarNotice } = useWishCard({
  banner,
  bannerKind,
  getGameText: () => gameText,
  getTrials: () => trials,
});
const timeRemainingText = useWishTimeRemaining({
  bannerId,
  getGameText: () => gameText,
  getNow: () => now,
  getWishSchedule: () => wishSchedule,
});
const { fatePoints, isWeaponWish } = useWishEpitomizedPath({ bannerKind, getGameText: () => gameText, pityMap });
const { results, toResultCell } = useWishResults({
  getGameText: () => gameText,
  getNameText: () => nameText,
  getStellaFortunaNameTextIdMap: () => stellaFortunaNameTextIdMap,
  toCountText,
});
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
      @start-trial="bannerTrial && emit('startTrial', bannerTrial)"
      @wish="(count) => wish(count)"
    />
  </GameScreen>
</template>
