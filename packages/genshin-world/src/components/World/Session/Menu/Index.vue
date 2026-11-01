<script setup lang="ts">
import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { BannerKind } from "genshin-interface/save";
import type { Constellation } from "#src/models/character/Constellation";
import type { Mail } from "#src/models/mail/Mail";
import type { TextChunk } from "#src/models/data/TextChunk";
import type { WishDrawSave } from "#src/models/wish/WishDrawSave";
import type { WishPity } from "#src/models/wish/WishPity";
import type WorldWindrise from "#src/components/World/Windrise/Index.vue";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { ArchiveData } from "#src/models/archive/ArchiveData";
import type { ArchiveKills } from "#src/models/archive/ArchiveKills";
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { DishUse } from "#src/models/cooking/DishUse";
import type { Element } from "#src/models/Element";
import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { GadgetRow } from "#src/models/gadget/GadgetRow";
import type { HandbookDayCommission } from "#src/models/handbook/HandbookDayCommission";
import type { HandbookDomain } from "#src/models/handbook/HandbookDomain";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryDestruction } from "#src/models/inventory/InventoryDestruction";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { MapSubareaLabel } from "#src/models/map/MapSubareaLabel";
import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { ProfileNamecard } from "#src/models/menu/ProfileNamecard";
import type { MailSave } from "#src/models/mail/MailSave";
import type { Party } from "#src/models/party/Party";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { Trial } from "#src/models/trial/Trial";
import type { Landmark } from "#src/models/world/Landmark";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { WorldTables } from "#src/models/world/WorldTables";
import type { QualityTier } from "genshin-engine";
import type { GameLanguage, GameText } from "genshin-text";

import AchievementScreen from "#src/components/Achievement/Screen/Index.vue";
import BookReaderScreen from "#src/components/Archive/BookReader/Index.vue";
import ArchiveScreen from "#src/components/Archive/Screen/Index.vue";
import CharacterScene from "#src/components/Character/Scene/Index.vue";
import CharacterScreen from "#src/components/Character/Screen/Index.vue";
import CharacterTerms from "#src/components/Character/Terms/Index.vue";
import HandbookScreen from "#src/components/Handbook/Screen/Index.vue";
import InventoryScreen from "#src/components/Inventory/Screen/Index.vue";
import MailScreen from "#src/components/Mail/Screen/Index.vue";
import MapOverlay from "#src/components/Map/Overlay/Index.vue";
import MenuScreen from "#src/components/Menu/Screen/Index.vue";
import MenuSettings from "#src/components/Menu/Settings/Index.vue";
import MenuTime from "#src/components/Menu/Time/Index.vue";
import PaimonsBargainsScreen from "#src/components/PaimonsBargains/Screen/Index.vue";
import PartyScreen from "#src/components/Party/Screen/Index.vue";
import QuestScreen from "#src/components/Quest/Screen/Index.vue";
import WishScreen from "#src/components/Wish/Screen/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { PAIMON_BARGAINS_SHOP_ID } from "#src/services/shop/constants";
import { STAMINA_MAX } from "genshin-engine";
import { CharacterMenuTab, InventorySort, ItemCategory } from "genshin-interface";

// MenuScreen draws the page its screen kind names from its named slots, so every page slot stays in this one component
interface Props {
  accountAvatarUrl: string;
  accountName: string;
  achievementData?: { achievements: Achievement[]; categories: AchievementCategory[]; textMap: TextChunk };
  achievementProgressMap: ReadonlyMap<number, AchievementProgress>;
  activeCharacterId: number;
  adventureExpProgress: number;
  adventureRank: number;
  archiveData?: ArchiveData;
  archiveKillsMap: ArchiveKills;
  archiveProgressMap: ArchiveProgress;
  bookReading?: { body: string; title: string };
  canUseLongTermEncounterPoints: boolean;
  catalogue: WorldTables["catalogue"];
  characterIdConstellationsMap: Map<number, Constellation[]>;
  characterPackReaders: WorldTables["characterPackReaders"];
  characterTalentKits: WorldTables["characterTalentKits"];
  companionshipExpMap: ReadonlyMap<number, number>;
  cookingProgress: CookingProgress;
  dishUseMap: ReadonlyMap<number, DishUse>;
  encounterPointLimit: number;
  explorationAreas: ExplorationArea[];
  finishedMainQuestIds: ReadonlySet<number>;
  gadgetRows: readonly GadgetRow[];
  gameDataBaseUrl: string;
  gameText: GameText;
  getWorldNow: () => Temporal.Instant;
  handbookDayCommissions: HandbookDayCommission[];
  handbookDomains: HandbookDomain[];
  inventory: Inventory;
  instructionRecipeMap: ReadonlyMap<number, CookingRecipe>;
  isAdventureEncountersUnlocked: boolean;
  isMailBagFull: boolean;
  isTouch: boolean;
  isWorldLevelAdjustable: boolean;
  isWorldLevelLowered: boolean;
  language: GameLanguage;
  mailData?: { birthdayMailIds: ReadonlySet<number>; mailRows: ReadonlyMap<number, Mail>; textMap: TextChunk };
  mails: MailSave[];
  mapCamera: MapCamera;
  materialDataMap: WorldTables["materialDataMap"];
  nameText: WorldTables["nameText"];
  namecardItemId: number;
  namecards: ProfileNamecard[];
  paimonsBargainsRotation: WorldTables["paimonsBargainsRotation"];
  party: Party;
  qualityTier: QualityTier;
  questChapters: QuestChapter[];
  questDistanceMap: ReadonlyMap<string, number>;
  questProgressMap: ReadonlyMap<string, QuestProgress>;
  questTextMap: Readonly<Record<string, string>>;
  questsInProgress: Quest[];
  recordedDoingIds: ReadonlySet<string>;
  reliquarySets: WorldTables["reliquarySets"];
  serverClockOffsetMs: number;
  shopIdShopGoodMap: WorldTables["shopIdShopGoodMap"];
  statTables: WorldTables["statTables"];
  stellaFortunaNameTextIdMap: ReadonlyMap<number, string>;
  subareaLabels: MapSubareaLabel[];
  talentUpgradeMap: WorldTables["talentUpgradeMap"];
  trackedQuestId: string;
  trials: Trial[];
  travelerBirthday?: TravelerBirthdaySave;
  travelerBonusLines: AttributeLine[];
  travelerElement?: Element;
  travelerName: string;
  unlockedLandmarks: Landmark[];
  wholeEncounterPoints: number;
  wholeLongTermEncounterPoints: number;
  wishSchedule: WorldTables["wishSchedule"];
  windrise: InstanceType<typeof WorldWindrise> | null;
  worldLevel: number;
  worldLevelChangedAt?: Temporal.Instant;
  worldNow: Temporal.Instant;
}

const screenKind = defineModel<ScreenKind>("screenKind", { required: true });
const mapZoom = defineModel<number>("mapZoom", { required: true });
const characters = defineModel<Character[]>("characters", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const characterCopyCountMap = defineModel<ReadonlyMap<number, number>>("characterCopyCountMap", { required: true });
const wishPityMap = defineModel<Readonly<Record<BannerKind, Readonly<WishPity>>>>("wishPityMap", { required: true });
const wishHistory = defineModel<WishDrawSave[]>("wishHistory", { required: true });
const shopPurchases = defineModel<ShopPurchase[]>("shopPurchases", { required: true });
const settings = defineModel<GenshinSettings>("settings", { required: true });
const {
  accountAvatarUrl,
  accountName,
  achievementData,
  achievementProgressMap,
  activeCharacterId,
  adventureExpProgress,
  adventureRank,
  archiveData,
  archiveKillsMap,
  archiveProgressMap,
  bookReading,
  canUseLongTermEncounterPoints,
  catalogue,
  characterIdConstellationsMap,
  characterPackReaders,
  characterTalentKits,
  companionshipExpMap,
  cookingProgress,
  dishUseMap,
  encounterPointLimit,
  explorationAreas,
  finishedMainQuestIds,
  gadgetRows,
  gameDataBaseUrl,
  gameText,
  getWorldNow,
  handbookDayCommissions,
  handbookDomains,
  inventory,
  instructionRecipeMap,
  isAdventureEncountersUnlocked,
  isMailBagFull,
  isTouch,
  isWorldLevelAdjustable,
  isWorldLevelLowered,
  language,
  mailData,
  mails,
  mapCamera,
  materialDataMap,
  nameText,
  namecardItemId,
  namecards,
  paimonsBargainsRotation,
  party,
  qualityTier,
  questChapters,
  questDistanceMap,
  questProgressMap,
  questTextMap,
  questsInProgress,
  recordedDoingIds,
  reliquarySets,
  serverClockOffsetMs,
  shopIdShopGoodMap,
  statTables,
  stellaFortunaNameTextIdMap,
  subareaLabels,
  talentUpgradeMap,
  trackedQuestId,
  trials,
  travelerBirthday,
  travelerBonusLines,
  travelerElement,
  travelerName,
  unlockedLandmarks,
  wholeEncounterPoints,
  wholeLongTermEncounterPoints,
  wishSchedule,
  windrise,
  worldLevel,
  worldLevelChangedAt,
  worldNow,
} = defineProps<Props>();
const emit = defineEmits<{
  challenge: [landmark: DomainEntranceLandmark];
  claimAllMails: [];
  claimCommission: [commissionId: number];
  claimFirstClear: [entryId: number];
  claimMail: [mail: MailSave];
  close: [];
  closeBook: [];
  confirmTime: [minutes: number];
  deleteGiftMail: [mail: MailSave];
  deleteReadMails: [];
  destroy: [destruction: InventoryDestruction];
  jump: [pose: WorldJumpPose];
  navigate: [questId: string];
  pickNamecard: [itemId: number];
  pinMail: [mail: MailSave];
  quit: [];
  readBook: [entryId: number];
  readMail: [mail: MailSave];
  setBirthday: [birthday: TravelerBirthdaySave];
  toggleWorldLevel: [];
  trial: [trial: Trial];
  updateInventory: [inventory: Inventory];
  updateWallet: [wallet: Wallet];
  use: [entryId: number];
  useLongTermEncounterPoints: [];
}>();
</script>

<template>
  <MenuScreen
    v-model:screen-kind="screenKind"
    :account-avatar-url="accountAvatarUrl"
    :account-name="accountName"
    :adventure-exp-progress="adventureExpProgress"
    :adventure-rank="adventureRank"
    :alerted-icons="[]"
    :finished-main-quest-ids="finishedMainQuestIds"
    :game-text="gameText"
    :is-world-level-adjustable="isWorldLevelAdjustable"
    :is-world-level-lowered="isWorldLevelLowered"
    :namecard-item-id="namecardItemId"
    :namecards="namecards"
    :server-clock-offset-ms="serverClockOffsetMs"
    :traveler-birthday="travelerBirthday"
    :world-level="worldLevel"
    :world-level-changed-at="worldLevelChangedAt"
    @pick-namecard="(itemId) => emit('pickNamecard', itemId)"
    @quit="emit('quit')"
    @set-birthday="(birthday) => emit('setBirthday', birthday)"
    @toggle-world-level="emit('toggleWorldLevel')"
  >
    <template #[ScreenKind.Map]>
      <MapOverlay
        v-model:metres="mapZoom"
        :camera="mapCamera"
        :catalogue
        :exploration-areas="explorationAreas"
        :game-text="gameText"
        :landmarks="unlockedLandmarks"
        :name-text="nameText"
        :recorded-doing-ids="recordedDoingIds"
        :now="worldNow"
        :subarea-labels="subareaLabels"
        :wallet
        @close="emit('close')"
        @jump="(pose) => emit('jump', pose)"
      />
    </template>
    <template v-if="achievementData" #[ScreenKind.Achievements]>
      <AchievementScreen
        :achievements="achievementData.achievements"
        :categories="achievementData.categories"
        :game-text="gameText"
        :progress-map="achievementProgressMap"
        :text-map="achievementData.textMap"
        @close="emit('close')"
      />
    </template>
    <template v-if="archiveData" #[ScreenKind.Archive]>
      <BookReaderScreen
        v-if="bookReading"
        :body="bookReading.body"
        :game-text="gameText"
        :title="bookReading.title"
        @close="emit('closeBook')"
      />
      <ArchiveScreen
        v-else
        :game-text="gameText"
        :kills-map="archiveKillsMap"
        :progress-map="archiveProgressMap"
        :section-entries-map="archiveData.sectionEntriesMap"
        :text-map="archiveData.textMap"
        :weapon-data-map="statTables.weaponDataMap"
        @close="emit('close')"
        @read-book="(entryId) => emit('readBook', entryId)"
      />
    </template>
    <template v-if="mailData" #[ScreenKind.Mail]>
      <!-- eslint-disable vue/no-restricted-syntax -- the Mail screen's own confirm dialog asks first and emits a delete only once the player confirms -->
      <MailScreen
        :birthday-mail-ids="mailData.birthdayMailIds"
        :game-text="gameText"
        :is-bag-full="isMailBagFull"
        :mail-rows="mailData.mailRows"
        :mails
        :material-data-map="materialDataMap"
        :names="nameText"
        :now="worldNow"
        :text-map="mailData.textMap"
        @claim="(mail) => emit('claimMail', mail)"
        @claim-all="emit('claimAllMails')"
        @close="emit('close')"
        @delete-gift="(mail) => emit('deleteGiftMail', mail)"
        @delete-read="emit('deleteReadMails')"
        @read="(mail) => emit('readMail', mail)"
        @pin="(mail) => emit('pinMail', mail)"
      />
      <!-- eslint-enable vue/no-restricted-syntax -->
    </template>
    <template #[ScreenKind.Quests]>
      <QuestScreen
        :game-text="gameText"
        :quest-chapters="questChapters"
        :quest-distance-map="questDistanceMap"
        :quest-progress-map="questProgressMap"
        :quests="questsInProgress"
        :text-map="questTextMap"
        :tracked-quest-id="trackedQuestId"
        @close="emit('close')"
        @navigate="(questId) => emit('navigate', questId)"
      />
    </template>
    <template #[ScreenKind.AdventurerHandbook]>
      <!-- The world keeps no investigations yet, so the Experience page opens on an empty panel -->
      <HandbookScreen
        :commissions="[]"
        :completed-count="0"
        :can-use-long-term-encounter-points="canUseLongTermEncounterPoints"
        :day-commissions="handbookDayCommissions"
        :domains="handbookDomains"
        :encounter-point-limit="encounterPointLimit"
        :encounter-points="wholeEncounterPoints"
        :game-text="gameText"
        :investigation-rewards="[]"
        :is-adventure-encounters-unlocked="isAdventureEncountersUnlocked"
        :is-reward-claimed="false"
        :long-term-encounter-points="wholeLongTermEncounterPoints"
        :name-text="nameText"
        :total-count="0"
        @challenge="(landmark) => emit('challenge', landmark)"
        @claim-commission="(commissionId) => emit('claimCommission', commissionId)"
        @claim-first-clear="(entryId) => emit('claimFirstClear', entryId)"
        @close="emit('close')"
        @use-long-term-encounter-points="emit('useLongTermEncounterPoints')"
      />
    </template>
    <template #[ScreenKind.Character]>
      <CharacterScreen
        v-model:characters="characters"
        v-model:wallet="wallet"
        :active-character-id="activeCharacterId"
        :adventure-rank="adventureRank"
        :character-talent-kits="characterTalentKits"
        :character-id-constellations-map="characterIdConstellationsMap"
        :companionship-exp-map="companionshipExpMap"
        :game-data-base-url="gameDataBaseUrl"
        :game-text="gameText"
        :initial-tab="CharacterMenuTab.Attributes"
        :inventory="inventory"
        :is-touch="isTouch"
        :language="language"
        :material-data-map="materialDataMap"
        :max-stamina="STAMINA_MAX"
        :name-text="nameText"
        :reliquary-sets="reliquarySets"
        :stat-tables="statTables"
        :talent-upgrade-map="talentUpgradeMap"
        :traveler-bonus-lines="travelerBonusLines"
        :traveler-element="travelerElement"
        @close="emit('close')"
        @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
      >
        <template #scene="{ element, tab }">
          <CharacterScene :element :tab />
        </template>
        <template #default="{ characterId }">
          <div class="character-terms">
            <CharacterTerms :key="characterId" :character-id :character-pack-readers />
          </div>
        </template>
      </CharacterScreen>
    </template>
    <template #[ScreenKind.Inventory]>
      <InventoryScreen
        :cooking-progress="cookingProgress"
        :dish-use-map="dishUseMap"
        :game-text="gameText"
        :gadget-rows="gadgetRows"
        :initial-category="ItemCategory.Weapon"
        initial-selected-id=""
        :initial-sort="InventorySort.Level"
        :instruction-recipe-map="instructionRecipeMap"
        :inventory="inventory"
        :material-data-map="materialDataMap"
        :names="nameText"
        :wallet="wallet"
        @close="emit('close')"
        @destroy="(destruction) => emit('destroy', destruction)"
        @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
        @use="(entryId) => emit('use', entryId)"
      />
    </template>
    <template #[ScreenKind.Wish]>
      <WishScreen
        v-model:character-copy-count-map="characterCopyCountMap"
        v-model:characters="characters"
        v-model:pity-map="wishPityMap"
        v-model:wish-history="wishHistory"
        v-model:wallet="wallet"
        :game-text="gameText"
        :inventory="inventory"
        :name-text="nameText"
        :stat-tables="statTables"
        :get-world-now="getWorldNow"
        :now="worldNow"
        :wish-schedule="wishSchedule"
        :stella-fortuna-name-text-id-map="stellaFortunaNameTextIdMap"
        :trials="trials"
        @close="emit('close')"
        @trial="(trial) => emit('trial', trial)"
        @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
      />
    </template>
    <template #[ScreenKind.PaimonsBargains]>
      <PaimonsBargainsScreen
        v-model:characters="characters"
        v-model:purchases="shopPurchases"
        :adventure-rank="adventureRank"
        :character-data-map="statTables.characterDataMap"
        :game-text="gameText"
        :get-world-now="getWorldNow"
        :goods="shopIdShopGoodMap.get(PAIMON_BARGAINS_SHOP_ID) ?? []"
        :inventory="inventory"
        :material-data-map="materialDataMap"
        :name-text="nameText"
        :now="worldNow"
        :rotation="paimonsBargainsRotation"
        :wallet="wallet"
        :weapon-data-map="statTables.weaponDataMap"
        @close="emit('close')"
        @update:inventory="(nextInventory) => emit('updateInventory', nextInventory)"
        @update:wallet="(nextWallet) => emit('updateWallet', nextWallet)"
      />
    </template>
    <!-- The Time screen dials the hour and confirming sets the world's clock to it, from which the world runs on -->
    <template v-if="windrise" #[ScreenKind.Time]>
      <MenuTime
        :clock-minutes="windrise.gameClock.minutes"
        :game-text="gameText"
        @close="emit('close')"
        @confirm="(minutes) => emit('confirmTime', minutes)"
      />
    </template>
    <template #[ScreenKind.Settings]>
      <MenuSettings
        v-model:settings="settings"
        :default-quality-tier="qualityTier"
        :game-text="gameText"
        :language="language"
        @close="emit('close')"
      />
    </template>
    <template #[ScreenKind.PartySetup]>
      <PartyScreen
        :character-data-map="statTables.characterDataMap"
        :characters="characters"
        :game-text="gameText"
        :name-text="nameText"
        :party="party"
        :traveler-name="travelerName"
        @close="emit('close')"
      />
    </template>
  </MenuScreen>
</template>

<style scoped>
/* The terms of the character's model, beside its foot, read as its release carries them */
.character-terms {
  position: absolute;
  right: calc(var(--unit) * 120);
  bottom: calc(var(--unit) * 48);
  max-width: calc(var(--unit) * 720);
  max-height: calc(var(--unit) * 300);
  overflow: auto;
  color: #ece5d8;
  font-size: calc(var(--unit) * 22);
}

.character-terms > pre {
  margin: 0;
  font: inherit;
  white-space: pre-wrap;
}
</style>
