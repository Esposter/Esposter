<script setup lang="ts">
import type { Talk } from "#src/models/dialogue/Talk";
import type { TalkOffer } from "#src/models/dialogue/TalkOffer";
import type { Expedition } from "#src/models/expedition/Expedition";
import type { FishingZone } from "#src/models/fishing/FishingZone";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReputationBountyOffer } from "#src/models/reputation/ReputationBountyOffer";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { GameLanguage, GameText } from "genshin-text";

import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import ExpeditionLoader from "#src/components/Expedition/Loader/Index.vue";
import FishingScreen from "#src/components/Fishing/Screen/Index.vue";
import GameOverScreen from "#src/components/GameOver/Index.vue";
import GcgSession from "#src/components/Gcg/Session/Index.vue";
import ReputationScreen from "#src/components/Reputation/Screen/Index.vue";
import ShopScreen from "#src/components/Shop/Screen/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { GameTextKey } from "genshin-text";

interface Props {
  adventureRank: number;
  castView?: { tension: number; zone: FishingZone };
  characterPassiveGroupIdMap: ReadonlyMap<number, ReadonlySet<number>>;
  completedMainQuestIds: ReadonlySet<string>;
  downCharacterIds: ReadonlySet<number>;
  expeditionCharacters: { id: number; name: string }[];
  gameDataBaseUrl: string;
  gameText: GameText;
  // The card game duel a talk opened, none while no duel is open
  gcgGameId?: number;
  getWorldNow: () => Temporal.Instant;
  goods: ShopGood[];
  inventory: Inventory;
  language: GameLanguage;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  random: () => number;
  regionStatueProgressMap: ReadonlyMap<string, StatueRegionProgressSave>;
  reputation: ReputationProgress;
  reputationBountyOffer?: ReputationBountyOffer;
  reputationCity?: ReputationCity;
  reputationOfferTitle?: string;
  screenKind: ScreenKind;
  talk?: Talk;
  talkDuelGameId?: number;
  talkOffers: TalkOffer[];
  talkTextMap: Readonly<Record<string, string>>;
  wallet: Wallet;
  worldNow: Temporal.Instant;
}

const expeditions = defineModel<Expedition[]>("expeditions", { required: true });
const reputationLevel = defineModel<number>("reputationLevel", { required: true });
const shopPurchases = defineModel<ShopPurchase[]>("shopPurchases", { required: true });
const {
  adventureRank,
  castView,
  characterPassiveGroupIdMap,
  completedMainQuestIds,
  downCharacterIds,
  expeditionCharacters,
  gameDataBaseUrl,
  gameText,
  gcgGameId,
  getWorldNow,
  goods,
  inventory,
  language,
  materialDataMap,
  nameText,
  random,
  regionStatueProgressMap,
  reputation,
  reputationBountyOffer,
  reputationCity,
  reputationOfferTitle,
  screenKind,
  talk,
  talkDuelGameId,
  talkOffers,
  talkTextMap,
  wallet,
  worldNow,
} = defineProps<Props>();
const emit = defineEmits<{
  accept: [];
  begin: [talkId: string];
  close: [];
  duel: [];
  end: [];
  leaveDuel: [won: boolean];
  revive: [];
  "update:inventory": [inventory: Inventory];
  "update:wallet": [wallet: Wallet];
}>();
</script>

<template>
  <GameOverScreen
    v-if="screenKind === ScreenKind.GameOver"
    :revive-label="gameText[GameTextKey.Revive]"
    :title="gameText[GameTextKey.PlayerDieNone]"
    @revive="emit('revive')"
  />
  <DialogueTalk
    v-if="screenKind === ScreenKind.Dialogue && talk"
    :key="talk.id"
    :game-text
    :is-duel-offered="talkDuelGameId !== undefined"
    :offers="talkOffers"
    :talk
    :text-map="talkTextMap"
    @begin="(talkId) => emit('begin', talkId)"
    @duel="emit('duel')"
    @end="emit('end')"
  />
  <ReputationScreen
    v-if="screenKind === ScreenKind.Reputation && reputationCity"
    v-model:level="reputationLevel"
    :game-text
    :material-data-map
    :name-text
    :bounty-offer="reputationBountyOffer"
    :offer-title="reputationOfferTitle"
    :progress="reputation"
    :reputation="reputationCity"
    @accept="emit('accept')"
    @close="emit('close')"
  />
  <GcgSession
    v-if="screenKind === ScreenKind.GcgDuel && gcgGameId !== undefined"
    :game-data-base-url
    :game-id="gcgGameId"
    :game-text
    :language
    @leave="(won) => emit('leaveDuel', won)"
  />
  <FishingScreen v-if="screenKind === ScreenKind.Fishing" :view="castView" />
  <ShopScreen
    v-if="screenKind === ScreenKind.Shop"
    v-model:purchases="shopPurchases"
    :adventure-rank
    :game-text
    :get-world-now
    :goods
    :inventory
    :material-data-map
    :name-text
    :now="worldNow"
    :reputation-level="reputation.level"
    :wallet
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('update:inventory', nextInventory)"
    @update:wallet="(nextWallet) => emit('update:wallet', nextWallet)"
  />
  <ExpeditionLoader
    v-if="screenKind === ScreenKind.Expedition"
    v-model:expeditions="expeditions"
    :adventure-rank
    :characters="expeditionCharacters"
    :character-passive-group-id-map
    :completed-quest-ids="completedMainQuestIds"
    :down-character-ids
    :game-data-base-url
    :game-text
    :inventory
    :material-data-map
    :name-text
    :now="worldNow"
    :random
    :region-statue-progress-map
    :wallet
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('update:inventory', nextInventory)"
    @update:wallet="(nextWallet) => emit('update:wallet', nextWallet)"
  />
</template>
