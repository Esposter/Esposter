<script setup lang="ts">
import type { CharacterData } from "#src/models/character/CharacterData";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { BlossomClaimPrompt } from "#src/models/originalResin/BlossomClaimPrompt";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { HudMember } from "#src/models/hud/HudMember";
import type { SkillGlyphs } from "#src/models/hud/SkillGlyphs";
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { Party } from "#src/models/party/Party";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestMark } from "#src/models/quest/QuestMark";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { ShortcutWheelDirectionCount } from "#src/models/shortcutWheel/ShortcutWheelDirectionCount";
import type { Tip } from "#src/models/tip/Tip";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";
import type { Camera, Vector3 } from "three";

import HudNavigation from "#src/components/Hud/Navigation/Index.vue";
import HudScreen from "#src/components/Hud/Screen/Index.vue";
import HudShortcutWheel from "#src/components/Hud/ShortcutWheel/Index.vue";
import OfferChoice from "#src/components/Interaction/OfferChoice/Index.vue";
import TipPopup from "#src/components/World/Tip/Index.vue";
import { GAME_CREAM } from "genshin-interface";

interface Props {
  // The hint a full bag draws over the centre, empty while the bag has room
  bagFullHint: string;
  camera: MapCamera;
  catalogue: Catalogue;
  characterDataMap: ReadonlyMap<number, CharacterData>;
  characterIdSkillGlyphsMap: ReadonlyMap<number, SkillGlyphs>;
  // The Original Resin claim of the outcrop the character stands at, none while no claim is offered
  claimPrompt?: BlossomClaimPrompt;
  // The Domain's claim offers, none while the tree offers none
  domainClaimOffers?: BlossomClaimOffer[];
  frame: HudFrame;
  gadgetCooldownSeconds?: number;
  gameText: GameText;
  getCamera: () => Camera | undefined;
  getGroundHeight: (x: number, z: number) => number;
  input: Input;
  interactionPrompts?: InteractionPrompts;
  interfaceRects: HudInterfaceRects;
  isHudShown: boolean;
  isShortcutWheelOpen: boolean;
  isTouch: boolean;
  landmarks: Landmark[];
  maxStamina: number;
  member?: HudMember;
  nameTextMap: Readonly<Record<string, string>>;
  nearOculusPlaces: OculusPlace[];
  origin: Vector3;
  party: Party;
  pointedLandmark?: Landmark;
  questMark?: QuestMark;
  questProgress?: QuestProgress;
  questTextMap: Readonly<Record<string, string>>;
  isQuickSwapOpen: boolean;
  shortcutWheelDirectionCount: ShortcutWheelDirectionCount;
  shortcutWheelPickedIndex?: number;
  showingTip?: Tip;
  tipText: Readonly<Record<string, string>>;
  trackedQuest?: Quest;
  travelerName: string;
  trialSecondsRemaining?: number;
  // The Trounce Blossom's claim offers, none while no blossom is claimable
  trounceClaimPrompt?: { offers: BlossomClaimOffer[] };
}

const emit = defineEmits<{
  map: [];
  menu: [];
  // A row of the prompts pressed itself, which acts on it as F acts on the selected row
  press: [id: string];
  closeTip: [];
  // An outcrop's claim: a row chosen, the choice left unmade, and the restore row chosen
  chooseOutcrop: [offer: BlossomClaimOffer];
  closeOutcrop: [];
  restoreOutcrop: [];
  chooseTrounce: [];
  closeTrounce: [];
  chooseDomain: [offer: BlossomClaimOffer];
  closeDomain: [];
}>();

const {
  bagFullHint,
  camera,
  catalogue,
  characterDataMap,
  characterIdSkillGlyphsMap,
  claimPrompt,
  domainClaimOffers,
  frame,
  gadgetCooldownSeconds,
  gameText,
  getCamera,
  getGroundHeight,
  input,
  interactionPrompts,
  interfaceRects,
  isHudShown,
  isShortcutWheelOpen,
  isTouch,
  landmarks,
  maxStamina,
  member,
  nameTextMap,
  nearOculusPlaces,
  origin,
  party,
  pointedLandmark,
  questMark,
  questProgress,
  questTextMap,
  isQuickSwapOpen,
  shortcutWheelDirectionCount,
  shortcutWheelPickedIndex,
  showingTip,
  tipText,
  trackedQuest,
  travelerName,
  trialSecondsRemaining,
  trounceClaimPrompt,
} = defineProps<Props>();
</script>

<template>
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
    :camera
    :catalogue
    :character-data-map="characterDataMap"
    :character-id-skill-glyphs-map="characterIdSkillGlyphsMap"
    :frame
    :game-text
    :gadget-cooldown-seconds="gadgetCooldownSeconds"
    :input
    :interaction-prompts="interactionPrompts"
    :interface-rects="interfaceRects"
    :is-touch="isTouch"
    :landmarks
    :max-stamina="maxStamina"
    :near-oculus-places="nearOculusPlaces"
    :member
    :name-text-map="nameTextMap"
    :party
    :quest-mark="questMark"
    :quest-progress="questProgress"
    :quest-text-map="questTextMap"
    :quick-swap-open="isQuickSwapOpen"
    :tracked-quest="trackedQuest"
    :traveler-name="travelerName"
    :trial-seconds-remaining="trialSecondsRemaining"
    @map="emit('map')"
    @menu="emit('menu')"
    @press="(id) => emit('press', id)"
  >
    <template #prompts>
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
  color: v-bind(GAME_CREAM);
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
