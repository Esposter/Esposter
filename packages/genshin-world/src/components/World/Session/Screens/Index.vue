<script setup lang="ts">
import type { useWorldExpeditionRoster } from "#src/composables/useWorldExpeditionRoster";
import type { useWorldFishing } from "#src/composables/useWorldFishing";
import type { useWorldSave } from "#src/composables/useWorldSave";
import type { useWorldSpiralAbyss } from "#src/composables/useWorldSpiralAbyss";
import type { useWorldStatues } from "#src/composables/useWorldStatues";
import type { DomainLevelRow } from "#src/models/domains/DomainLevelRow";
import type { Talk } from "#src/models/dialogue/Talk";
import type { TalkOffer } from "#src/models/dialogue/TalkOffer";
import type { Expedition } from "#src/models/expedition/Expedition";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Party } from "#src/models/party/Party";
import type { ReputationBountyOffer } from "#src/models/reputation/ReputationBountyOffer";
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { AutoRecoverSetting } from "#src/models/statue/AutoRecoverSetting";
import type { RestorativePower } from "#src/models/statue/RestorativePower";
import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriodBlessing } from "#src/models/spiralAbyss/AbyssPeriodBlessing";
import type { WorldTables } from "#src/models/world/WorldTables";
import type { GameLanguage, GameText } from "genshin-text";
import type { UnwrapRef } from "vue";

import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
import DomainScreen from "#src/components/Domain/Screen/Index.vue";
import ExpeditionLoader from "#src/components/Expedition/Loader/Index.vue";
import FishingScreen from "#src/components/Fishing/Screen/Index.vue";
import GameOverScreen from "#src/components/GameOver/Index.vue";
import GcgSession from "#src/components/Gcg/Session/Index.vue";
import ReputationScreen from "#src/components/Reputation/Screen/Index.vue";
import ShopScreen from "#src/components/Shop/Screen/Index.vue";
import SpiralAbyssBenediction from "#src/components/SpiralAbyss/Benediction/Index.vue";
import SpiralAbyssEntryScreen from "#src/components/SpiralAbyss/Entry/Index.vue";
import StatueScreen from "#src/components/Statue/Screen/Index.vue";
import StatueWorshipScreen from "#src/components/Statue/Worship/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { GameTextKey } from "genshin-text";

// The screens a talk, a fight, a statue, a domain and the Spiral Abyss open, and the shop and the expedition desk, one at a time
interface Props {
  abyssBlessing?: AbyssPeriodBlessing;
  abyssChoiceChamberIndex?: number;
  abyssChoiceFloorIndex?: number;
  abyssChoices?: UnwrapRef<ReturnType<typeof useWorldSpiralAbyss>["abyssChoices"]>;
  abyssFloorsOffered: AbyssFloor[];
  adventureRank: number;
  castView?: UnwrapRef<ReturnType<typeof useWorldFishing>["castView"]>;
  characterPassiveGroupIdMap: UnwrapRef<
    ReturnType<typeof useWorldExpeditionRoster>["characterPassiveGroupIdMap"]
  >;
  completedMainQuestIds: ReadonlySet<string>;
  domainLevelRows: DomainLevelRow[];
  downCharacterIds: ReadonlySet<number>;
  expeditionCharacters: UnwrapRef<ReturnType<typeof useWorldExpeditionRoster>["expeditionCharacters"]>;
  gameDataBaseUrl: string;
  gameText: GameText;
  gcgGameId?: number;
  getCharacterName: (characterId: number) => string;
  getMaxHealth: (characterId: number) => number;
  getRegionProgress: ReturnType<typeof useWorldStatues>["getRegionProgress"];
  getWorldNow: () => Temporal.Instant;
  getWorshipItemName: ReturnType<typeof useWorldStatues>["getWorshipItemName"];
  inventory: Inventory;
  isInDomain: boolean;
  language: GameLanguage;
  materialDataMap: WorldTables["materialDataMap"];
  nameText: WorldTables["nameText"];
  party: Party;
  random: () => number;
  regionStatueProgressMap: UnwrapRef<ReturnType<typeof useWorldSave>["regionStatueProgressMap"]>;
  reputation: ReputationProgress;
  reputationBountyOffer?: ReputationBountyOffer;
  reputationCity?: ReputationCity;
  reputationOfferTitle?: string;
  screenKind: ScreenKind;
  shopId: number;
  shopIdShopGoodMap: WorldTables["shopIdShopGoodMap"];
  statueCount: number;
  talk?: Talk;
  talkDuelGameId?: number;
  talkOffers: TalkOffer[];
  talkTextMap: Readonly<Record<string, string>>;
  wallet: Wallet;
  worldNow: Temporal.Instant;
  worshipLevels: StatueLevel[];
  worshipRegionId?: UnwrapRef<ReturnType<typeof useWorldStatues>["worshipRegionId"]>;
}

const autoRecover = defineModel<AutoRecoverSetting>("autoRecover", { required: true });
const expeditions = defineModel<Expedition[]>("expeditions", { required: true });
const power = defineModel<RestorativePower>("power", { required: true });
const reputationLevel = defineModel<number>("reputationLevel", { required: true });
const shopPurchases = defineModel<ShopPurchase[]>("shopPurchases", { required: true });
const {
  abyssBlessing,
  abyssChoiceChamberIndex,
  abyssChoiceFloorIndex,
  abyssChoices,
  abyssFloorsOffered,
  adventureRank,
  castView,
  characterPassiveGroupIdMap,
  completedMainQuestIds,
  domainLevelRows,
  downCharacterIds,
  expeditionCharacters,
  gameDataBaseUrl,
  gameText,
  gcgGameId,
  getCharacterName,
  getMaxHealth,
  getRegionProgress,
  getWorldNow,
  getWorshipItemName,
  inventory,
  isInDomain,
  language,
  materialDataMap,
  nameText,
  party,
  random,
  regionStatueProgressMap,
  reputation,
  reputationBountyOffer,
  reputationCity,
  reputationOfferTitle,
  screenKind,
  shopId,
  shopIdShopGoodMap,
  statueCount,
  talk,
  talkDuelGameId,
  talkOffers,
  talkTextMap,
  wallet,
  worldNow,
  worshipLevels,
  worshipRegionId,
} = defineProps<Props>();
const emit = defineEmits<{
  accept: [];
  begin: [talkId: string];
  blessing: [];
  chooseBenediction: [towerBuffId: number];
  chooseFloor: [floorId: number, chamberId: number];
  claimWorship: [];
  close: [];
  duel: [];
  end: [];
  enter: [dungeonId: number];
  leave: [];
  leaveGame: [won: boolean];
  offerWorship: [];
  revive: [];
  updateInventory: [inventory: Inventory];
  updateWallet: [wallet: Wallet];
  worship: [];
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
    :game-text="gameText"
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
    :game-text="gameText"
    :material-data-map="materialDataMap"
    :name-text="nameText"
    :bounty-offer="reputationBountyOffer"
    :offer-title="reputationOfferTitle"
    :progress="reputation"
    :reputation="reputationCity"
    @accept="emit('accept')"
    @close="emit('close')"
  />
  <GcgSession
    v-if="screenKind === ScreenKind.GcgDuel && gcgGameId !== undefined"
    :game-data-base-url="gameDataBaseUrl"
    :game-id="gcgGameId"
    :game-text="gameText"
    :language="language"
    @leave="(won) => emit('leaveGame', won)"
  />
  <StatueScreen
    v-if="screenKind === ScreenKind.Blessing"
    v-model:auto-recover="autoRecover"
    v-model:power="power"
    :game-text="gameText"
    :get-max-health="getMaxHealth"
    :get-name="getCharacterName"
    :get-now="getWorldNow"
    :party="party"
    :statue-count="statueCount"
    @close="emit('close')"
    @worship="emit('worship')"
  />
  <StatueWorshipScreen
    v-if="screenKind === ScreenKind.Worship && worshipRegionId"
    :game-text="gameText"
    :get-item-name="getWorshipItemName"
    :levels="worshipLevels"
    :progress="getRegionProgress(worshipRegionId)"
    @blessing="emit('blessing')"
    @claim="emit('claimWorship')"
    @close="emit('close')"
    @offer="emit('offerWorship')"
  />
  <FishingScreen v-if="screenKind === ScreenKind.Fishing" :view="castView" />
  <DomainScreen
    v-if="screenKind === ScreenKind.Domain"
    :game-text="gameText"
    :is-in-domain="isInDomain"
    :levels="domainLevelRows"
    @close="emit('close')"
    @enter="(dungeonId) => emit('enter', dungeonId)"
    @leave="emit('leave')"
  />
  <SpiralAbyssEntryScreen
    v-if="screenKind === ScreenKind.SpiralAbyss"
    :blessing="abyssBlessing"
    :floors="abyssFloorsOffered"
    :game-text="gameText"
    :name-text="nameText"
    @choose="(floorId, chamberId) => emit('chooseFloor', floorId, chamberId)"
    @close="emit('close')"
  />
  <SpiralAbyssBenediction
    v-if="abyssChoices"
    :chamber="abyssChoiceChamberIndex"
    :choices="abyssChoices"
    :floor="abyssChoiceFloorIndex"
    :game-text="gameText"
    :name-text="nameText"
    @choose="(towerBuffId) => emit('chooseBenediction', towerBuffId)"
  />
  <ShopScreen
    v-if="screenKind === ScreenKind.Shop"
    v-model:purchases="shopPurchases"
    :adventure-rank="adventureRank"
    :game-text="gameText"
    :get-world-now="getWorldNow"
    :goods="shopIdShopGoodMap.get(shopId) ?? []"
    :inventory="inventory"
    :material-data-map="materialDataMap"
    :name-text="nameText"
    :now="worldNow"
    :reputation-level="reputation.level"
    :wallet="wallet"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
    @update:wallet="(nextWallet) => emit('updateWallet', nextWallet)"
  />
  <ExpeditionLoader
    v-if="screenKind === ScreenKind.Expedition"
    v-model:expeditions="expeditions"
    :adventure-rank="adventureRank"
    :characters="expeditionCharacters"
    :character-passive-group-id-map="characterPassiveGroupIdMap"
    :completed-quest-ids="completedMainQuestIds"
    :down-character-ids="downCharacterIds"
    :game-data-base-url="gameDataBaseUrl"
    :game-text="gameText"
    :inventory="inventory"
    :material-data-map="materialDataMap"
    :name-text="nameText"
    :now="worldNow"
    :random="random"
    :region-statue-progress-map="regionStatueProgressMap"
    :wallet="wallet"
    @close="emit('close')"
    @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
    @update:wallet="(nextWallet) => emit('updateWallet', nextWallet)"
  />
</template>
