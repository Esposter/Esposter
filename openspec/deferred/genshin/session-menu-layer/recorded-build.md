# Session menu layer: the recorded build

The exact code of the earlier build of the cut, as it stood when the package typecheck stopped at the event-map failure, kept here so the idea survives whatever becomes of the history it was read from. Any other type error under that failure was never seen. It was recorded from the commits `9fc42e9c70`, which moved the overlay layers into children, and `a92c786385`, which typed the children's props by their models; two later commits revert them.

To build the cut once the [proposal](./proposal.md)'s trigger is met, create the menu child from the first block, replace the root's `MenuScreen` block with the mount in the second, and apply the import changes in the third. The third block is the root's whole diff in that build, and its hunks for the HUD, screens and workshop layers were redone and have landed differently, so only the menu hunks and the imports they free belong here. Read the recorded code as the build the [design](./design.md) judges, not as the answer: the design says what to keep and what to change.

## The menu child

```vue
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
```

## The root's mount of it

```vue
<WorldSessionMenu
  v-model:screen-kind="screenKind"
  v-model:map-zoom="mapZoom"
  v-model:characters="characters"
  v-model:character-copy-count-map="characterCopyCountMap"
  v-model:settings="settings"
  v-model:shop-purchases="shopPurchases"
  v-model:wallet="wallet"
  v-model:wish-history="wishHistory"
  v-model:wish-pity-map="wishPityMap"
  :account-avatar-url
  :account-name
  :achievement-data
  :achievement-progress-map
  :active-character-id
  :adventure-exp-progress
  :adventure-rank="rank"
  :archive-data
  :archive-kills-map
  :archive-progress-map
  :book-reading
  :can-use-long-term-encounter-points="isAdventureEncountersUnlocked && isLongTermPointConvertible"
  :catalogue
  :character-id-constellations-map
  :character-pack-readers
  :character-talent-kits
  :companionship-exp-map="savedState.companionshipExpMap"
  :cooking-progress
  :dish-use-map
  :encounter-point-limit
  :exploration-areas
  :finished-main-quest-ids
  :gadget-rows
  :game-data-base-url
  :game-text
  :get-world-now
  :handbook-day-commissions
  :handbook-domains
  :inventory
  :instruction-recipe-map
  :is-adventure-encounters-unlocked
  :is-mail-bag-full
  :is-touch
  :is-world-level-adjustable
  :is-world-level-lowered="worldLevelAdjustment.isLowered"
  :language
  :mail-data
  :mails
  :map-camera
  :material-data-map
  :name-text
  :namecard-item-id
  :namecards="profileNamecards"
  :paimons-bargains-rotation
  :party
  :quality-tier
  :quest-chapters
  :quest-distance-map
  :quest-progress-map
  :quest-text-map
  :quests-in-progress
  :recorded-doing-ids
  :reliquary-sets
  :server-clock-offset-ms
  :shop-id-shop-good-map
  :stat-tables
  :stella-fortuna-name-text-id-map
  :subarea-labels
  :talent-upgrade-map
  :tracked-quest-id
  :trials
  :traveler-birthday
  :traveler-bonus-lines
  :traveler-element
  :traveler-name="savedState.travelerName"
  :unlocked-landmarks
  :whole-encounter-points
  :whole-long-term-encounter-points
  :wish-schedule
  :windrise
  :world-level
  :world-level-changed-at="worldLevelAdjustment.changedAt"
  :world-now
  @challenge="(landmark) => challengeWeeklyBoss(landmark)"
  @claim-all-mails="claimAllMails()"
  @claim-commission="(commissionId) => claimCommission(commissionId)"
  @claim-first-clear="(entryId) => claimWeeklyBossFirstClearReward(entryId)"
  @claim-mail="(mail) => claimMail(mail)"
  @close="closeScreen()"
  @close-book="bookReading = undefined"
  @confirm-time="
    (minutes) => {
      if (windrise) windrise.gameClock.minutes = minutes;
      closeScreen();
    }
  "
  @delete-gift-mail="(mail) => deleteGiftMail(mail)"
  @delete-read-mails="deleteReadMails()"
  @destroy="(destruction) => applyDestruction(destruction)"
  @jump="
    (pose) => {
      closeScreen();
      jumpTo(pose);
    }
  "
  @navigate="(questId) => (trackedQuestId = questId)"
  @pick-namecard="(itemId) => setNamecardItemId(itemId)"
  @pin-mail="(mail) => toggleMailPin(mail)"
  @quit="emit('quit')"
  @read-book="(entryId) => readBook(entryId)"
  @read-mail="(mail) => markMailRead(mail)"
  @set-birthday="(birthday) => chooseTravelerBirthday(birthday)"
  @toggle-world-level="toggleWorldLevel()"
  @trial="(trial) => openTrial(trial)"
  @update-inventory="(nextInventory) => setInventory(nextInventory)"
  @update-wallet="(nextWallet) => setWallet(nextWallet)"
  @use="(entryId) => useBagEntry(entryId)"
  @use-long-term-encounter-points="convertLongTermPoint()"
/>
```

## The root's changes in that build

```diff
diff --git a/packages/genshin-world/src/components/World/Session/Index.vue b/packages/genshin-world/src/components/World/Session/Index.vue
index dc6d88fa18..767fa6870b 100644
--- a/packages/genshin-world/src/components/World/Session/Index.vue
+++ b/packages/genshin-world/src/components/World/Session/Index.vue
@@ -9,47 +9,11 @@ import type { WorldTables } from "#src/models/world/WorldTables";
 import type { TresCanvasInstance } from "@tresjs/core";

-import AchievementScreen from "#src/components/Achievement/Screen/Index.vue";
-import BookReaderScreen from "#src/components/Archive/BookReader/Index.vue";
-import ArchiveScreen from "#src/components/Archive/Screen/Index.vue";
-import CharacterScene from "#src/components/Character/Scene/Index.vue";
-import CharacterScreen from "#src/components/Character/Screen/Index.vue";
-import CharacterTerms from "#src/components/Character/Terms/Index.vue";
-import ProcessingScreen from "#src/components/Cooking/Processing/Index.vue";
-import CookingScreen from "#src/components/Cooking/Screen/Index.vue";
-import CraftingScreen from "#src/components/Crafting/Screen/Index.vue";
-import DialogueTalk from "#src/components/Dialogue/Talk/Index.vue";
-import DomainScreen from "#src/components/Domain/Screen/Index.vue";
-import ExpeditionLoader from "#src/components/Expedition/Loader/Index.vue";
-import FishingScreen from "#src/components/Fishing/Screen/Index.vue";
-import ForgeScreen from "#src/components/Forge/Screen/Index.vue";
-import GameOverScreen from "#src/components/GameOver/Index.vue";
-import GcgSession from "#src/components/Gcg/Session/Index.vue";
-import HandbookScreen from "#src/components/Handbook/Screen/Index.vue";
-import HudNavigation from "#src/components/Hud/Navigation/Index.vue";
-import HudScreen from "#src/components/Hud/Screen/Index.vue";
-import HudShortcutWheel from "#src/components/Hud/ShortcutWheel/Index.vue";
-import OfferChoice from "#src/components/Interaction/OfferChoice/Index.vue";
-import InteractionPromptList from "#src/components/Interaction/PromptList/Index.vue";
-import InventoryScreen from "#src/components/Inventory/Screen/Index.vue";
-import MailScreen from "#src/components/Mail/Screen/Index.vue";
-import MapOverlay from "#src/components/Map/Overlay/Index.vue";
-import MenuScreen from "#src/components/Menu/Screen/Index.vue";
-import MenuSettings from "#src/components/Menu/Settings/Index.vue";
-import MenuTime from "#src/components/Menu/Time/Index.vue";
-import PaimonsBargainsScreen from "#src/components/PaimonsBargains/Screen/Index.vue";
-import PartyScreen from "#src/components/Party/Screen/Index.vue";
-import QuestScreen from "#src/components/Quest/Screen/Index.vue";
-import ReputationScreen from "#src/components/Reputation/Screen/Index.vue";
-import ShopScreen from "#src/components/Shop/Screen/Index.vue";
-import SpiralAbyssBenediction from "#src/components/SpiralAbyss/Benediction/Index.vue";
-import SpiralAbyssEntryScreen from "#src/components/SpiralAbyss/Entry/Index.vue";
-import StatueScreen from "#src/components/Statue/Screen/Index.vue";
-import StatueWorshipScreen from "#src/components/Statue/Worship/Index.vue";
-import WishScreen from "#src/components/Wish/Screen/Index.vue";
 import WorldCharacter from "#src/components/World/Character/Index.vue";
-import WorldEnemyNameTags from "#src/components/World/EnemyNameTags/Index.vue";
 import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
 import WorldRealm from "#src/components/World/Realm/Index.vue";
-import TipPopup from "#src/components/World/Tip/Index.vue";
+import WorldSessionHud from "#src/components/World/Session/Hud/Index.vue";
+import WorldSessionMenu from "#src/components/World/Session/Menu/Index.vue";
+import WorldSessionScreens from "#src/components/World/Session/Screens/Index.vue";
+import WorldSessionWorkshop from "#src/components/World/Session/Workshop/Index.vue";
 import WorldWindrise from "#src/components/World/Windrise/Index.vue";
 import { useMiningOutcrops } from "#src/composables/useMiningOutcrops";
@@ -125,5 +89,4 @@ import { createTresRenderer } from "#src/services/scene/createTresRenderer";
 import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
 import { getTeamAntiColdRatio } from "#src/services/sheerCold/getTeamAntiColdRatio";
-import { PAIMON_BARGAINS_SHOP_ID } from "#src/services/shop/constants";
 import { ABYSS_ENTRANCE_POSITION } from "#src/services/spiralAbyss/constants";
 import { getResonatedRegionIds } from "#src/services/statue/getResonatedRegionIds";
@@ -140,6 +103,4 @@ import {
   STAMINA_MAX,
 } from "genshin-engine";
-import { CharacterMenuTab, InventorySort, ItemCategory } from "genshin-interface";
-import { GameTextKey } from "genshin-text";
 import { Group, PCFShadowMap, Vector3 } from "three";

@@ -1455,376 +1416,238 @@ useWorldSaveSync({
       <WorldRealm v-else />
     </TresCanvas>
-    <WorldEnemyNameTags
+    <WorldSessionHud
+      :bag-full-hint
+      :catalogue
+      :character-data-map="statTables.characterDataMap"
+      :character-id-skill-glyphs-map
+      :claim-prompt
+      :domain-claim-offers
       :elemental-sight
       :enemy-kind-map="enemyTables.enemyKindMap"
       :enemy-map="kitContext.enemyMap"
+      :gadget-cooldown-seconds="equippedGadget?.cooldownSeconds"
+      :game-text
       :get-camera
       :get-ground-height
-      :name-text
-      :origin
-    />
-    <!-- The shortcut wheel drawn over the world while its key is held, its entries and their pick from the move -->
-    <div v-if="isShortcutWheelOpen" class="shortcut-wheel">
-      <HudShortcutWheel
-        :direction-count="shortcutWheelDirectionCount"
-        :game-text
-        :picked-index="shortcutWheelPickedIndex"
-      />
-    </div>
-    <!-- No HUD over a reference's held camera or a witness render, which the game's recordings show bare -->
-    <HudNavigation
-      v-if="isHudShown && pointedLandmark"
-      :get-camera
-      :get-ground-height
-      :landmark="pointedLandmark"
-      :origin
-    />
-    <HudScreen
-      v-if="isHudShown"
-      :camera="mapCamera"
-      :catalogue
-      :character-data-map="statTables.characterDataMap"
-      :character-id-skill-glyphs-map
-      :frame="hudFrame"
-      :game-text
-      :gadget-cooldown-seconds="equippedGadget?.cooldownSeconds"
+      :hud-frame="hudFrame"
+      :hud-interface-rects="hudInterfaceRects"
+      :hud-member="hudMember"
       :input
-      :interface-rects="hudInterfaceRects"
+      :interaction-prompts
+      :is-hud-shown="isHudShown"
+      :is-shortcut-wheel-open="isShortcutWheelOpen"
       :is-touch
-      :landmarks="unlockedLandmarks"
-      :max-stamina="STAMINA_MAX"
+      :map-camera="mapCamera"
+      :name-text
       :near-oculus-places
-      :member="hudMember"
-      :name-text-map="nameText"
+      :origin
       :party
+      :pointed-landmark
       :quest-mark
       :quest-progress="trackerQuest && questProgressMap.get(trackerQuest.id)"
       :quest-text-map
       :quick-swap-open="isQuickSwapOpen"
+      :shortcut-wheel-direction-count
+      :shortcut-wheel-picked-index
+      :showing-tip
+      :tip-text
       :tracked-quest="trackerQuest"
       :traveler-name="savedState.travelerName"
       :trial-seconds-remaining
+      :trounce-claim-prompt
+      :unlocked-landmarks
+      @choose-domain="(offer) => chooseDomainTreeClaim(offer, getWorldNow())"
+      @choose-outcrop="(offer) => chooseOutcropClaim(offer, getWorldNow(), worldLevel, kitContext.random)"
+      @choose-trounce="() => chooseTrounceBlossomClaim(getWorldNow(), worldLevel, kitContext.random)"
+      @close-domain="closeDomainTreeClaim()"
+      @close-outcrop="closeOutcropClaim()"
+      @close-tip="closeTip()"
+      @close-trounce="closeTrounceBlossomClaim()"
       @map="screenKind = ScreenKind.Map"
       @menu="screenKind = ScreenKind.PaimonMenu"
-    >
-      <template #prompts>
-        <InteractionPromptList :interaction-prompts :is-touch @press="(id) => pressInteractable(id)" />
-        <TipPopup
-          v-if="showingTip"
-          :game-text
-          :subtitle="tipText[showingTip.subtitleTextId] || ''"
-          :title="tipText[showingTip.titleTextId] || ''"
-          @close="closeTip()"
-        />
-        <OfferChoice
-          v-if="claimPrompt"
-          :can-restore="claimPrompt.canRestore"
-          :game-text
-          :offers="claimPrompt.offers"
-          @choose="(offer) => chooseOutcropClaim(offer, getWorldNow(), worldLevel, kitContext.random)"
-          @close="closeOutcropClaim()"
-          @restore="restoreOutcropClaim(getWorldNow())"
-        />
-        <OfferChoice
-          v-if="trounceClaimPrompt"
-          :game-text
-          :offers="trounceClaimPrompt.offers"
-          @choose="() => chooseTrounceBlossomClaim(getWorldNow(), worldLevel, kitContext.random)"
-          @close="closeTrounceBlossomClaim()"
-        />
-        <OfferChoice
-          v-if="domainClaimOffers"
-          :game-text
-          :offers="domainClaimOffers"
-          @choose="(offer) => chooseDomainTreeClaim(offer, getWorldNow())"
-          @close="closeDomainTreeClaim()"
-        />
-        <p v-if="bagFullHint" class="bag-full-hint">{{ bagFullHint }}</p>
-      </template>
-    </HudScreen>
-    <MenuScreen
+      @press="(id) => pressInteractable(id)"
+      @restore-outcrop="restoreOutcropClaim(getWorldNow())"
+    />
+    <WorldSessionMenu
       v-model:screen-kind="screenKind"
+      v-model:map-zoom="mapZoom"
+      v-model:characters="characters"
+      v-model:character-copy-count-map="characterCopyCountMap"
+      v-model:settings="settings"
+      v-model:shop-purchases="shopPurchases"
+      v-model:wallet="wallet"
+      v-model:wish-history="wishHistory"
+      v-model:wish-pity-map="wishPityMap"
       :account-avatar-url
       :account-name
+      :achievement-data
+      :achievement-progress-map
+      :active-character-id
       :adventure-exp-progress
       :adventure-rank="rank"
-      :alerted-icons="[]"
+      :archive-data
+      :archive-kills-map
+      :archive-progress-map
+      :book-reading
+      :can-use-long-term-encounter-points="isAdventureEncountersUnlocked && isLongTermPointConvertible"
+      :catalogue
+      :character-id-constellations-map
+      :character-pack-readers
+      :character-talent-kits
+      :companionship-exp-map="savedState.companionshipExpMap"
+      :cooking-progress
+      :dish-use-map
+      :encounter-point-limit
+      :exploration-areas
       :finished-main-quest-ids
+      :gadget-rows
+      :game-data-base-url
       :game-text
+      :get-world-now
+      :handbook-day-commissions
+      :handbook-domains
+      :inventory
+      :instruction-recipe-map
+      :is-adventure-encounters-unlocked
+      :is-mail-bag-full
+      :is-touch
       :is-world-level-adjustable
       :is-world-level-lowered="worldLevelAdjustment.isLowered"
+      :language
+      :mail-data
+      :mails
+      :map-camera
+      :material-data-map
+      :name-text
       :namecard-item-id
       :namecards="profileNamecards"
+      :paimons-bargains-rotation
+      :party
+      :quality-tier
+      :quest-chapters
+      :quest-distance-map
+      :quest-progress-map
+      :quest-text-map
+      :quests-in-progress
+      :recorded-doing-ids
+      :reliquary-sets
       :server-clock-offset-ms
+      :shop-id-shop-good-map
+      :stat-tables
+      :stella-fortuna-name-text-id-map
+      :subarea-labels
+      :talent-upgrade-map
+      :tracked-quest-id
+      :trials
       :traveler-birthday
+      :traveler-bonus-lines
+      :traveler-element
+      :traveler-name="savedState.travelerName"
+      :unlocked-landmarks
+      :whole-encounter-points
+      :whole-long-term-encounter-points
+      :wish-schedule
+      :windrise
       :world-level
       :world-level-changed-at="worldLevelAdjustment.changedAt"
+      :world-now
+      @challenge="(landmark) => challengeWeeklyBoss(landmark)"
+      @claim-all-mails="claimAllMails()"
+      @claim-commission="(commissionId) => claimCommission(commissionId)"
+      @claim-first-clear="(entryId) => claimWeeklyBossFirstClearReward(entryId)"
+      @claim-mail="(mail) => claimMail(mail)"
+      @close="closeScreen()"
+      @close-book="bookReading = undefined"
+      @confirm-time="
+        (minutes) => {
+          if (windrise) windrise.gameClock.minutes = minutes;
+          closeScreen();
+        }
+      "
+      @delete-gift-mail="(mail) => deleteGiftMail(mail)"
+      @delete-read-mails="deleteReadMails()"
+      @destroy="(destruction) => applyDestruction(destruction)"
+      @jump="
+        (pose) => {
+          closeScreen();
+          jumpTo(pose);
+        }
+      "
+      @navigate="(questId) => (trackedQuestId = questId)"
       @pick-namecard="(itemId) => setNamecardItemId(itemId)"
+      @pin-mail="(mail) => toggleMailPin(mail)"
       @quit="emit('quit')"
+      @read-book="(entryId) => readBook(entryId)"
+      @read-mail="(mail) => markMailRead(mail)"
       @set-birthday="(birthday) => chooseTravelerBirthday(birthday)"
       @toggle-world-level="toggleWorldLevel()"
-    >
-      <template #[ScreenKind.Map]>
-        <MapOverlay
-          v-model:metres="mapZoom"
-          :camera="mapCamera"
-          :catalogue
-          :exploration-areas
-          :game-text
-          :landmarks="unlockedLandmarks"
-          :name-text
-          :recorded-doing-ids
-          :now="worldNow"
-          :subarea-labels
-          :wallet
-          @close="closeScreen()"
-          @jump="
-            (pose) => {
-              closeScreen();
-              jumpTo(pose);
-            }
-          "
-        />
-      </template>
-      <template v-if="achievementData" #[ScreenKind.Achievements]>
-        <AchievementScreen
-          :achievements="achievementData.achievements"
-          :categories="achievementData.categories"
-          :game-text
-          :progress-map="achievementProgressMap"
-          :text-map="achievementData.textMap"
-          @close="closeScreen()"
-        />
-      </template>
-      <template v-if="archiveData" #[ScreenKind.Archive]>
-        <BookReaderScreen
-          v-if="bookReading"
-          :body="bookReading.body"
-          :game-text
-          :title="bookReading.title"
-          @close="bookReading = undefined"
-        />
-        <ArchiveScreen
-          v-else
-          :game-text
-          :kills-map="archiveKillsMap"
-          :progress-map="archiveProgressMap"
-          :section-entries-map="archiveData.sectionEntriesMap"
-          :text-map="archiveData.textMap"
-          :weapon-data-map="statTables.weaponDataMap"
-          @close="closeScreen()"
-          @read-book="(entryId) => readBook(entryId)"
-        />
-      </template>
-      <template v-if="mailData" #[ScreenKind.Mail]>
-        <!-- eslint-disable vue/no-restricted-syntax -- the Mail screen's own confirm dialog asks first and emits a delete only once the player confirms -->
-        <MailScreen
-          :birthday-mail-ids="mailData.birthdayMailIds"
-          :game-text
-          :is-bag-full="isMailBagFull"
-          :mail-rows="mailData.mailRows"
-          :mails
-          :material-data-map
-          :names="nameText"
-          :now="worldNow"
-          :text-map="mailData.textMap"
-          @claim="(mail) => claimMail(mail)"
-          @claim-all="claimAllMails()"
-          @close="closeScreen()"
-          @delete-gift="(mail) => deleteGiftMail(mail)"
-          @delete-read="deleteReadMails()"
-          @read="(mail) => markMailRead(mail)"
-          @pin="(mail) => toggleMailPin(mail)"
-        />
-        <!-- eslint-enable vue/no-restricted-syntax -->
-      </template>
-      <template #[ScreenKind.Quests]>
-        <QuestScreen
-          :game-text
-          :quest-chapters
-          :quest-distance-map
-          :quest-progress-map
-          :quests="questsInProgress"
-          :text-map="questTextMap"
-          :tracked-quest-id
-          @close="closeScreen()"
-          @navigate="(questId) => (trackedQuestId = questId)"
-        />
-      </template>
-      <template #[ScreenKind.AdventurerHandbook]>
-        <!-- The world keeps no investigations yet, so the Experience page opens on an empty panel -->
-        <HandbookScreen
-          :commissions="[]"
-          :completed-count="0"
-          :can-use-long-term-encounter-points="isAdventureEncountersUnlocked && isLongTermPointConvertible"
-          :day-commissions="handbookDayCommissions"
-          :domains="handbookDomains"
-          :encounter-point-limit
-          :encounter-points="wholeEncounterPoints"
-          :game-text
-          :investigation-rewards="[]"
-          :is-adventure-encounters-unlocked
-          :is-reward-claimed="false"
-          :long-term-encounter-points="wholeLongTermEncounterPoints"
-          :name-text
-          :total-count="0"
-          @challenge="(landmark) => challengeWeeklyBoss(landmark)"
-          @claim-commission="(commissionId) => claimCommission(commissionId)"
-          @claim-first-clear="(entryId) => claimWeeklyBossFirstClearReward(entryId)"
-          @close="closeScreen()"
-          @use-long-term-encounter-points="convertLongTermPoint()"
-        />
-      </template>
-      <template #[ScreenKind.Character]>
-        <CharacterScreen
-          v-model:characters="characters"
-          v-model:wallet="wallet"
-          :active-character-id
-          :adventure-rank="rank"
-          :character-talent-kits
-          :character-id-constellations-map
-          :companionship-exp-map="savedState.companionshipExpMap"
-          :game-data-base-url
-          :game-text
-          :initial-tab="CharacterMenuTab.Attributes"
-          :inventory
-          :is-touch
-          :language
-          :material-data-map
-          :max-stamina="STAMINA_MAX"
-          :name-text
-          :reliquary-sets
-          :stat-tables
-          :talent-upgrade-map
-          :traveler-bonus-lines
-          :traveler-element
-          @close="closeScreen()"
-          @update:inventory="(nextInventory) => setInventory(nextInventory)"
-        >
-          <template #scene="{ element, tab }">
-            <CharacterScene :element :tab />
-          </template>
-          <template #default="{ characterId }">
-            <div class="character-terms">
-              <CharacterTerms :key="characterId" :character-id :character-pack-readers />
-            </div>
-          </template>
-        </CharacterScreen>
-      </template>
-      <template #[ScreenKind.Inventory]>
-        <InventoryScreen
-          :cooking-progress
-          :dish-use-map
-          :game-text
-          :gadget-rows
-          :initial-category="ItemCategory.Weapon"
-          initial-selected-id=""
-          :initial-sort="InventorySort.Level"
-          :instruction-recipe-map
-          :inventory
-          :material-data-map
-          :names="nameText"
-          :wallet
-          @close="closeScreen()"
-          @destroy="(destruction) => applyDestruction(destruction)"
-          @update:inventory="(nextInventory) => setInventory(nextInventory)"
-          @use="(entryId) => useBagEntry(entryId)"
-        />
-      </template>
-      <template #[ScreenKind.Wish]>
-        <WishScreen
-          v-model:character-copy-count-map="characterCopyCountMap"
-          v-model:characters="characters"
-          v-model:pity-map="wishPityMap"
-          v-model:wish-history="wishHistory"
-          v-model:wallet="wallet"
-          :game-text
-          :inventory
-          :name-text
-          :stat-tables
-          :get-world-now
-          :now="worldNow"
-          :wish-schedule
-          :stella-fortuna-name-text-id-map
-          :trials
-          @close="closeScreen()"
-          @trial="(trial) => openTrial(trial)"
-          @update:inventory="(nextInventory) => setInventory(nextInventory)"
-        />
-      </template>
-      <template #[ScreenKind.PaimonsBargains]>
-        <PaimonsBargainsScreen
-          v-model:characters="characters"
-          v-model:purchases="shopPurchases"
-          :adventure-rank="rank"
-          :character-data-map="statTables.characterDataMap"
-          :game-text
-          :get-world-now
-          :goods="shopIdShopGoodMap.get(PAIMON_BARGAINS_SHOP_ID) ?? []"
-          :inventory
-          :material-data-map
-          :name-text
-          :now="worldNow"
-          :rotation="paimonsBargainsRotation"
-          :wallet
-          :weapon-data-map="statTables.weaponDataMap"
-          @close="closeScreen()"
-          @update:inventory="(nextInventory) => setInventory(nextInventory)"
-          @update:wallet="(nextWallet) => setWallet(nextWallet)"
-        />
-      </template>
-      <!-- The Time screen dials the hour and confirming sets the world's clock to it, from which the world runs on -->
-      <template v-if="windrise" #[ScreenKind.Time]>
-        <MenuTime
-          :clock-minutes="windrise.gameClock.minutes"
-          :game-text
-          @close="closeScreen()"
-          @confirm="
-            (minutes) => {
-              if (windrise) windrise.gameClock.minutes = minutes;
-              closeScreen();
-            }
-          "
-        />
-      </template>
-      <template #[ScreenKind.Settings]>
-        <MenuSettings
-          v-model:settings="settings"
-          :default-quality-tier="qualityTier"
-          :game-text
-          :language
-          @close="closeScreen()"
-        />
-      </template>
-      <template #[ScreenKind.PartySetup]>
-        <PartyScreen
-          :character-data-map="statTables.characterDataMap"
-          :characters
-          :game-text
-          :name-text
-          :party
-          :traveler-name="savedState.travelerName"
-          @close="closeScreen()"
-        />
-      </template>
-    </MenuScreen>
-    <GameOverScreen
-      v-if="screenKind === ScreenKind.GameOver"
-      :revive-label="gameText[GameTextKey.Revive]"
-      :title="gameText[GameTextKey.PlayerDieNone]"
-      @revive="
-        reviveFallenParty();
-        closeScreen();
-      "
+      @trial="(trial) => openTrial(trial)"
+      @update-inventory="(nextInventory) => setInventory(nextInventory)"
+      @update-wallet="(nextWallet) => setWallet(nextWallet)"
+      @use="(entryId) => useBagEntry(entryId)"
+      @use-long-term-encounter-points="convertLongTermPoint()"
     />
-    <DialogueTalk
-      v-if="screenKind === ScreenKind.Dialogue && talk"
-      :key="talk.id"
+    <WorldSessionScreens
+      v-model:auto-recover="autoRecoverSetting"
+      v-model:expeditions="expeditions"
+      v-model:power="restorativePower"
+      v-model:reputation-level="reputationLevel"
+      v-model:shop-purchases="shopPurchases"
+      :abyss-blessing
+      :abyss-choice-chamber-index
+      :abyss-choice-floor-index
+      :abyss-choices
+      :abyss-floors-offered
+      :adventure-rank="rank"
+      :cast-view
+      :character-passive-group-id-map
+      :completed-main-quest-ids="completedMainQuestIds"
+      :domain-level-rows
+      :down-character-ids
+      :expedition-characters
+      :game-data-base-url
       :game-text
-      :is-duel-offered="talkDuelGameId !== undefined"
-      :offers="talkOffers"
+      :gcg-game-id
+      :get-character-name="getCharacterName"
+      :get-max-health="(characterId) => getMemberMaxHealth(characterId) ?? 0"
+      :get-region-progress
+      :get-world-now
+      :get-worship-item-name
+      :inventory
+      :is-in-domain="domainArena !== undefined"
+      :language
+      :material-data-map
+      :name-text
+      :party
+      :random="kitContext.random"
+      :region-statue-progress-map
+      :reputation
+      :reputation-bounty-offer
+      :reputation-city
+      :reputation-offer-title
+      :screen-kind
+      :shop-id
+      :shop-id-shop-good-map
+      :statue-count="resonatedRegionIds.length"
       :talk
-      :text-map="talkTextMap"
+      :talk-duel-game-id
+      :talk-offers
+      :talk-text-map
+      :wallet
+      :world-now
+      :worship-levels
+      :worship-region-id
+      @accept="acceptReputationOffer()"
       @begin="(talkId) => beginTalk(talkId)"
+      @blessing="screenKind = ScreenKind.Blessing"
+      @choose-benediction="(towerBuffId) => chooseAbyssBenediction(towerBuffId)"
+      @choose-floor="
+        (floorId, chamberId) => {
+          enterAbyssChamber(floorId, chamberId);
+          closeScreen();
+        }
+      "
+      @claim-worship="claimWorship()"
+      @close="closeScreen()"
       @duel="
         gcgGameId = talkDuelGameId;
@@ -1832,25 +1655,10 @@ useWorldSaveSync({
       "
       @end="endTalk()"
-    />
-    <ReputationScreen
-      v-if="screenKind === ScreenKind.Reputation && reputationCity"
-      v-model:level="reputationLevel"
-      :game-text
-      :material-data-map
-      :name-text
-      :bounty-offer="reputationBountyOffer"
-      :offer-title="reputationOfferTitle"
-      :progress="reputation"
-      :reputation="reputationCity"
-      @accept="acceptReputationOffer()"
-      @close="closeScreen()"
-    />
-    <GcgSession
-      v-if="screenKind === ScreenKind.GcgDuel && gcgGameId !== undefined"
-      :game-data-base-url
-      :game-id="gcgGameId"
-      :game-text
-      :language
+      @enter="(dungeonId) => enterDomainLevel(dungeonId)"
       @leave="
+        leaveDomain();
+        closeScreen();
+      "
+      @leave-game="
         (won) => {
           payCardGameReward(gcgGameId, won);
@@ -1859,75 +1667,37 @@ useWorldSaveSync({
         }
       "
-    />
-    <StatueScreen
-      v-if="screenKind === ScreenKind.Blessing"
-      v-model:auto-recover="autoRecoverSetting"
-      v-model:power="restorativePower"
-      :game-text
-      :get-max-health="(characterId) => getMemberMaxHealth(characterId) ?? 0"
-      :get-name="getCharacterName"
-      :get-now="getWorldNow"
-      :party
-      :statue-count="resonatedRegionIds.length"
-      @close="closeScreen()"
-      @worship="screenKind = ScreenKind.Worship"
-    />
-    <StatueWorshipScreen
-      v-if="screenKind === ScreenKind.Worship && worshipRegionId"
-      :game-text
-      :get-item-name="getWorshipItemName"
-      :levels="worshipLevels"
-      :progress="getRegionProgress(worshipRegionId)"
-      @blessing="screenKind = ScreenKind.Blessing"
-      @claim="claimWorship()"
-      @close="closeScreen()"
-      @offer="offerWorship()"
-    />
-    <CookingScreen
-      v-if="screenKind === ScreenKind.Cooking && cookingRecipe"
-      v-model:progress="cookingProgress"
-      v-model:recipe="cookingRecipe"
-      :avatar-id="activeCharacterId"
-      :game-text
-      :inventory
-      :material-data-map
-      :name-text
-      :random="kitContext.random"
-      :recipes="openCookingRecipes"
-      :talent="cookingTalents[activeCharacterId]"
-      @close="closeScreen()"
-      @update:inventory="(nextInventory) => setInventory(nextInventory)"
-    />
-    <ProcessingScreen
-      v-if="screenKind === ScreenKind.Processing"
-      v-model:jobs="processingJobs"
-      :game-text
-      :inventory
-      :material-data-map
-      :name-text
-      :now="getWorldNow"
-      :recipes="processingRecipes"
-      @close="closeScreen()"
-      @update:inventory="(nextInventory) => setInventory(nextInventory)"
-    />
-    <FishingScreen v-if="screenKind === ScreenKind.Fishing" :view="castView" />
-    <DomainScreen
-      v-if="screenKind === ScreenKind.Domain"
-      :game-text
-      :is-in-domain="domainArena !== undefined"
-      :levels="domainLevelRows"
-      @close="closeScreen()"
-      @enter="(dungeonId) => enterDomainLevel(dungeonId)"
-      @leave="
-        leaveDomain();
+      @offer-worship="offerWorship()"
+      @revive="
+        reviveFallenParty();
         closeScreen();
       "
+      @update-inventory="(nextInventory) => setInventory(nextInventory)"
+      @update-wallet="(nextWallet) => setWallet(nextWallet)"
+      @worship="screenKind = ScreenKind.Worship"
     />
-    <CraftingScreen
-      v-if="screenKind === ScreenKind.Crafting"
+    <WorldSessionWorkshop
+      v-model:adventure-exp="adventureExp"
+      v-model:cooking-progress="cookingProgress"
+      v-model:cooking-recipe="cookingRecipe"
       v-model:crafted-count-map="craftedCountMap"
+      v-model:forge-amount="forgeAmount"
+      v-model:forge-progress="forgeProgress"
+      v-model:forge-recipe-id="forgeRecipeId"
+      v-model:forge-tab="forgeTab"
+      v-model:processing-jobs="processingJobs"
+      :active-character-id
       :adventure-rank="rank"
-      :artifact-drop-tables="craftingArtifactDropTables"
+      :adventure-rank-tables
+      :completed-main-quest-ids
+      :cooking-talents
+      :crafting-artifact-drop-tables="craftingArtifactDropTables"
+      :crafting-progress
+      :crafting-recipes
+      :crafting-strongboxes
       :crafters="crafting.crafters"
+      :forge-definitions
+      :forge-now
+      :forge-recipes
+      :forge-weapons
       :game-text
       :get-world-now
@@ -1936,102 +1706,17 @@ useWorldSaveSync({
       :material-data-map
       :name-text
-      :now="worldNow"
-      :progress="craftingProgress"
+      :open-cooking-recipes
+      :party-character-ids="getDeployedCharacterIds(party)"
+      :processing-recipes
       :random="kitContext.random"
-      :recipes="craftingRecipes"
       :reliquary-piece-entry-map
-      :strongboxes="craftingStrongboxes"
+      :screen-kind
       :wallet
       :weapon-data-map="statTables.weaponDataMap"
+      :world-now
       @achievement-events="(achievementEvents) => events.emit('achievementEvents', achievementEvents)"
       @close="closeScreen()"
-      @update:inventory="(nextInventory) => setInventory(nextInventory)"
-      @update:wallet="(nextWallet) => setWallet(nextWallet)"
-    />
-    <SpiralAbyssEntryScreen
-      v-if="screenKind === ScreenKind.SpiralAbyss"
-      :blessing="abyssBlessing"
-      :floors="abyssFloorsOffered"
-      :game-text
-      :name-text
-      @choose="
-        (floorId, chamberId) => {
-          enterAbyssChamber(floorId, chamberId);
-          closeScreen();
-        }
-      "
-      @close="closeScreen()"
-    />
-    <SpiralAbyssBenediction
-      v-if="abyssChoices"
-      :chamber="abyssChoiceChamberIndex"
-      :choices="abyssChoices"
-      :floor="abyssChoiceFloorIndex"
-      :game-text
-      :name-text
-      @choose="(towerBuffId) => chooseAbyssBenediction(towerBuffId)"
-    />
-    <ForgeScreen
-      v-if="screenKind === ScreenKind.Forge"
-      v-model:adventure-exp="adventureExp"
-      v-model:amount="forgeAmount"
-      v-model:progress="forgeProgress"
-      v-model:recipe-id="forgeRecipeId"
-      v-model:tab="forgeTab"
-      :adventure-rank="rank"
-      :adventure-rank-tables
-      :completed-main-quest-ids
-      :definitions="forgeDefinitions"
-      :game-text
-      :inventory
-      :is-in-realm="false"
-      :now="forgeNow"
-      :party-character-ids="getDeployedCharacterIds(party)"
-      :random="kitContext.random"
-      :recipes="forgeRecipes"
-      :wallet
-      :weapons="forgeWeapons"
-      @achievement-events="(achievementEvents) => events.emit('achievementEvents', achievementEvents)"
-      @close="closeScreen()"
-      @update:inventory="(nextInventory) => setInventory(nextInventory)"
-      @update:wallet="(nextWallet) => setWallet(nextWallet)"
-    />
-    <ShopScreen
-      v-if="screenKind === ScreenKind.Shop"
-      v-model:purchases="shopPurchases"
-      :adventure-rank="rank"
-      :game-text
-      :get-world-now
-      :goods="shopIdShopGoodMap.get(shopId) ?? []"
-      :inventory
-      :material-data-map
-      :name-text
-      :now="worldNow"
-      :reputation-level="reputation.level"
-      :wallet
-      @close="closeScreen()"
-      @update:inventory="(nextInventory) => setInventory(nextInventory)"
-      @update:wallet="(nextWallet) => setWallet(nextWallet)"
-    />
-    <ExpeditionLoader
-      v-if="screenKind === ScreenKind.Expedition"
-      v-model:expeditions="expeditions"
-      :adventure-rank="rank"
-      :characters="expeditionCharacters"
-      :character-passive-group-id-map
-      :completed-quest-ids="completedMainQuestIds"
-      :down-character-ids
-      :game-data-base-url
-      :game-text
-      :inventory
-      :material-data-map
-      :name-text
-      :now="worldNow"
-      :random="kitContext.random"
-      :region-statue-progress-map
-      :wallet
-      @close="closeScreen()"
-      @update:inventory="(nextInventory) => setInventory(nextInventory)"
-      @update:wallet="(nextWallet) => setWallet(nextWallet)"
+      @update-inventory="(nextInventory) => setInventory(nextInventory)"
+      @update-wallet="(nextWallet) => setWallet(nextWallet)"
     />
     <div
@@ -2051,15 +1736,4 @@ useWorldSaveSync({
 <style scoped>
 /* The package carries no utility classes, so the screen fills its host with a style of its own */
-/* Provisional: where the game's hint sits and how long it stays wait on a recording of the English client at 1080 high */
-.bag-full-hint {
-  position: absolute;
-  top: 50%;
-  left: 50%;
-  transform: translate(-50%, -50%);
-  margin: 0;
-  color: #ece5d8;
-  text-shadow: 0 0 4px rgb(0 0 0 / 0.8);
-}
-
 .world-screen {
   position: relative;
@@ -2068,33 +1742,4 @@ useWorldSaveSync({
 }

-/* The terms of the character's model, beside its foot, read as its release carries them */
-.character-terms {
-  position: absolute;
-  right: calc(var(--unit) * 120);
-  bottom: calc(var(--unit) * 48);
-  max-width: calc(var(--unit) * 720);
-  max-height: calc(var(--unit) * 300);
-  overflow: auto;
-  color: #ece5d8;
-  font-size: calc(var(--unit) * 22);
-}
-
-.character-terms > pre {
-  margin: 0;
-  font: inherit;
-  white-space: pre-wrap;
-}
-
-/* The shortcut wheel centred over the world, its size the shorter side of the view so it fits any window */
-.shortcut-wheel {
-  position: absolute;
-  top: 50%;
-  left: 50%;
-  width: min(60vh, 60vw);
-  aspect-ratio: 1;
-  pointer-events: none;
-  transform: translate(-50%, -50%);
-}
-
 /* The teleport's fade to the loading screen's background and back, its durations read off the teleport clip */
 .teleport-fade {
```
