<script setup lang="ts">
import type { BlossomClaimPrompt } from "#src/models/originalResin/BlossomClaimPrompt";
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";
import type { KitContext } from "#src/models/kit/KitContext";
import type { OrthographicCamera } from "three";
import type { PerspectiveCamera } from "three";
import type { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import type { SkillGlyphs } from "#src/models/hud/SkillGlyphs";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { HudMember } from "#src/models/hud/HudMember";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { Party } from "#src/models/party/Party";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestMark } from "#src/models/quest/QuestMark";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { Tip } from "#src/models/tip/Tip";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldTables } from "#src/models/world/WorldTables";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";
import type { Vector3 } from "three";

import HudNavigation from "#src/components/Hud/Navigation/Index.vue";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import HudShortcutWheel from "#src/components/Hud/ShortcutWheel/Index.vue";
import InteractionPromptList from "#src/components/Interaction/PromptList/Index.vue";
import OfferChoice from "#src/components/Interaction/OfferChoice/Index.vue";
import TipPopup from "#src/components/World/Tip/Index.vue";
import WorldEnemyNameTags from "#src/components/World/EnemyNameTags/Index.vue";
import { STAMINA_MAX } from "genshin-engine";

interface Props {
  bagFullHint: string;
  catalogue: WorldTables["catalogue"];
  characterDataMap: WorldTables["statTables"]["characterDataMap"];
  characterIdSkillGlyphsMap: Map<number, SkillGlyphs>;
  claimPrompt?: BlossomClaimPrompt & { placeId: number };
  domainClaimOffers?: BlossomClaimOffer[];
  elementalSight: ElementalSight;
  enemyKindMap: WorldTables["enemyTables"]["enemyKindMap"];
  enemyMap: KitContext["enemyMap"];
  gadgetCooldownSeconds?: number;
  gameText: GameText;
  getCamera: () => OrthographicCamera | PerspectiveCamera | undefined;
  getGroundHeight: (x: number, z: number) => number;
  hudFrame: HudFrame;
  hudInterfaceRects: WorldTables["hudInterfaceRects"];
  hudMember?: HudMember;
  input: Input;
  interactionPrompts: InteractionPrompts;
  isHudShown: boolean;
  isShortcutWheelOpen: boolean;
  isTouch: boolean;
  mapCamera: MapCamera;
  nameText: WorldTables["nameText"];
  nearOculusPlaces: OculusPlace[];
  origin: Vector3;
  party: Party;
  pointedLandmark?: Landmark;
  questMark?: QuestMark;
  questProgress?: QuestProgress;
  questTextMap: Readonly<Record<string, string>>;
  quickSwapOpen: boolean;
  shortcutWheelDirectionCount: ShortcutWheelDirectionCount;
  shortcutWheelPickedIndex?: number;
  showingTip?: Tip;
  tipText: WorldTables["tipText"];
  trackedQuest?: Quest;
  travelerName: string;
  trialSecondsRemaining?: number;
  trounceClaimPrompt?: { offers: BlossomClaimOffer[]; spawnKey: string };
  unlockedLandmarks: Landmark[];
}

const {
  bagFullHint,
  catalogue,
  characterDataMap,
  characterIdSkillGlyphsMap,
  claimPrompt,
  domainClaimOffers,
  elementalSight,
  enemyKindMap,
  enemyMap,
  gadgetCooldownSeconds,
  gameText,
  getCamera,
  getGroundHeight,
  hudFrame,
  hudInterfaceRects,
  hudMember,
  input,
  interactionPrompts,
  isHudShown,
  isShortcutWheelOpen,
  isTouch,
  mapCamera,
  nameText,
  nearOculusPlaces,
  origin,
  party,
  pointedLandmark,
  questMark,
  questProgress,
  questTextMap,
  quickSwapOpen,
  shortcutWheelDirectionCount,
  shortcutWheelPickedIndex,
  showingTip,
  tipText,
  trackedQuest,
  travelerName,
  trialSecondsRemaining,
  trounceClaimPrompt,
  unlockedLandmarks,
} = defineProps<Props>();
const emit = defineEmits<{
  chooseDomain: [offer: BlossomClaimOffer];
  chooseOutcrop: [offer: BlossomClaimOffer];
  chooseTrounce: [];
  closeDomain: [];
  closeOutcrop: [];
  closeTip: [];
  closeTrounce: [];
  map: [];
  menu: [];
  press: [id: string];
  restoreOutcrop: [];
}>();
</script>

<template>
  <WorldEnemyNameTags :elemental-sight :enemy-kind-map :enemy-map :get-camera :get-ground-height :name-text :origin />
  <!-- The shortcut wheel drawn over the world while its key is held, its entries and their pick from the move -->
  <div v-if="isShortcutWheelOpen" class="shortcut-wheel">
    <HudShortcutWheel
      :direction-count="shortcutWheelDirectionCount"
      :game-text
      :picked-index="shortcutWheelPickedIndex"
    />
  </div>
  <!-- No HUD over a reference's held camera or a witness render, which the game's recordings show bare -->
  <HudNavigation
    v-if="isHudShown && pointedLandmark"
    :get-camera
    :get-ground-height
    :landmark="pointedLandmark"
    :origin
  />
  <HudScreen
    v-if="isHudShown"
    :camera="mapCamera"
    :catalogue
    :character-data-map="characterDataMap"
    :character-id-skill-glyphs-map="characterIdSkillGlyphsMap"
    :frame="hudFrame"
    :game-text
    :gadget-cooldown-seconds="gadgetCooldownSeconds"
    :input
    :interface-rects="hudInterfaceRects"
    :is-touch
    :landmarks="unlockedLandmarks"
    :max-stamina="STAMINA_MAX"
    :near-oculus-places="nearOculusPlaces"
    :member="hudMember"
    :name-text-map="nameText"
    :party
    :quest-mark="questMark"
    :quest-progress="questProgress"
    :quest-text-map="questTextMap"
    :quick-swap-open="quickSwapOpen"
    :tracked-quest="trackedQuest"
    :traveler-name="travelerName"
    :trial-seconds-remaining="trialSecondsRemaining"
    @map="emit('map')"
    @menu="emit('menu')"
  >
    <template #prompts>
      <InteractionPromptList :interaction-prompts :is-touch @press="(id) => emit('press', id)" />
      <TipPopup
        v-if="showingTip"
        :game-text
        :subtitle="tipText[showingTip.subtitleTextId] || ''"
        :title="tipText[showingTip.titleTextId] || ''"
        @close="emit('closeTip')"
      />
      <OfferChoice
        v-if="claimPrompt"
        :can-restore="claimPrompt.canRestore"
        :game-text
        :offers="claimPrompt.offers"
        @choose="(offer) => emit('chooseOutcrop', offer)"
        @close="emit('closeOutcrop')"
        @restore="emit('restoreOutcrop')"
      />
      <OfferChoice
        v-if="trounceClaimPrompt"
        :game-text
        :offers="trounceClaimPrompt.offers"
        @choose="emit('chooseTrounce')"
        @close="emit('closeTrounce')"
      />
      <OfferChoice
        v-if="domainClaimOffers"
        :game-text
        :offers="domainClaimOffers"
        @choose="(offer) => emit('chooseDomain', offer)"
        @close="emit('closeDomain')"
      />
      <p v-if="bagFullHint" class="bag-full-hint">{{ bagFullHint }}</p>
    </template>
  </HudScreen>
</template>

<style scoped>
/* Provisional: where the game's hint sits and how long it stays wait on a recording of the English client at 1080 high */
.bag-full-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: #ece5d8;
  text-shadow: 0 0 4px rgb(0 0 0 / 0.8);
}

/* The shortcut wheel centred over the world, its size the shorter side of the view so it fits any window */
.shortcut-wheel {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(60vh, 60vw);
  aspect-ratio: 1;
  pointer-events: none;
  transform: translate(-50%, -50%);
}
</style>
