<script setup lang="ts">
import type { CharacterData } from "#src/models/character/CharacterData";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { HudInterfaceRects } from "#src/models/hud/HudInterfaceRects";
import type { HudMember } from "#src/models/hud/HudMember";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Party } from "#src/models/party/Party";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";
import type { VNode } from "vue";

import HudActions from "#src/components/Hud/Actions/Index.vue";
import HudHealth from "#src/components/Hud/Health/Index.vue";
import HudMinimap from "#src/components/Hud/Minimap/Index.vue";
import HudPaimonButton from "#src/components/Hud/PaimonButton/Index.vue";
import HudParty from "#src/components/Hud/Party/Index.vue";
import HudQuest from "#src/components/Hud/Quest/Index.vue";
import HudSkills from "#src/components/Hud/Skills/Index.vue";
import HudStamina from "#src/components/Hud/Stamina/Index.vue";
import HudTouch from "#src/components/Hud/Touch/Index.vue";
import { HudInterfaceRectName } from "#src/models/hud/HudInterfaceRectName";
import { STAMINA_MAX } from "genshin-engine";
import { GameRect, GameScreen } from "genshin-interface";

interface Props {
  camera: MapCamera;
  // The regions and their areas, whose drawn outlines the minimap shows
  catalogue: Catalogue;
  // The deployed team's characters' data, which the team stays hidden without until the stat tables arrive
  characterDataMap?: ReadonlyMap<number, CharacterData>;
  // The world's frame: the stamina the meter fills by, where the follow camera's pivot stands, and the world's clock
  frame: HudFrame;
  // The game's words in the reader's language
  gameText: GameText;
  input: Input;
  // The HUD's pieces' rects as the game's tree places them, read before the world opens
  interfaceRects: HudInterfaceRects;
  // Whether the main pointer is a finger, which has no keys or mouse to move, look and act with, so the touch controls
  // And the touch layout's action buttons are drawn
  isTouch: boolean;
  landmarks: Landmark[];
  // The field member's HP, level and cooldowns, hidden until the character on the field is known
  member?: HudMember;
  // The names the deployed team's text ids cite in the reader's language, which stay blank until they load
  nameTextMap?: Readonly<Record<string, string>>;
  party: Party;
  // The tracked quest's progress, none for a quest just started
  questProgress?: QuestProgress;
  // The quests' own words in the reader's language, by the game's text id
  questTextMap: Readonly<Record<string, string>>;
  // The quest on the tracker under the minimap, none while no quest is tracked
  trackedQuest?: Quest;
}

defineSlots<{
  // The prompts of what the character can act on, beside the centre
  prompts?: () => VNode;
}>();
const {
  camera,
  catalogue,
  characterDataMap,
  frame,
  gameText,
  input,
  interfaceRects,
  isTouch,
  landmarks,
  member,
  nameTextMap,
  party,
  questProgress,
  questTextMap,
  trackedQuest,
} = defineProps<Props>();
const emit = defineEmits<{ map: []; menu: [] }>();
</script>

<template>
  <!-- The heads-up display over the world: only the pieces the world backs, each in its place. The Paimon button and
       The minimap in the top left with the quest tracker under them, the party down the right, the member on the
       Field's health at the bottom's middle, the skill and burst at the bottom right, the stamina meter where it places
       Itself, and on a touch screen the touch layout's action buttons beside the skill and burst and the touch controls
       Under them all. Everything between the pieces lets the pointer through to the world, and a press on a piece stays
       The piece's, never reaching the world's input as an attack -->
  <GameScreen class="hud" @mousedown.stop>
    <HudTouch v-if="isTouch" :input />
    <!-- The page as the game's tree under `GrpMainPage` nests it: each piece a `GameRect` placed by its RectTransform
         inside its game parent's -->
    <GameRect #default="{ rect: hudRect }" :rect="interfaceRects[HudInterfaceRectName.MainPage]">
      <GameRect #default="{ rect: mapInfoRect }" :parent="hudRect" :rect="interfaceRects[HudInterfaceRectName.MapInfo]">
        <GameRect :parent="mapInfoRect" :rect="interfaceRects[HudInterfaceRectName.PlayerProfileButton]">
          <HudPaimonButton :game-text @press="emit('menu')" />
        </GameRect>
        <GameRect
          #default="{ rect: miniMapRect }"
          :parent="mapInfoRect"
          :rect="interfaceRects[HudInterfaceRectName.MiniMap]"
        >
          <GameRect :parent="miniMapRect" :rect="interfaceRects[HudInterfaceRectName.BackMap]">
            <HudMinimap :camera :catalogue :game-text :landmarks @open="emit('map')" />
          </GameRect>
        </GameRect>
      </GameRect>
      <div v-if="trackedQuest" class="quest">
        <HudQuest :input :quest="trackedQuest" :quest-progress :text-map="questTextMap" />
      </div>
      <GameRect
        v-if="characterDataMap"
        :parent="hudRect"
        :rect="interfaceRects[HudInterfaceRectName.TeamButtonContainer]"
      >
        <HudParty :character-data-map :frame :input :name-text-map :party />
      </GameRect>
      <GameRect v-if="member" :parent="hudRect" :rect="interfaceRects[HudInterfaceRectName.HealthBarContainer]">
        <HudHealth :game-text :health="member.health" :level="member.level" :max-health="member.maxHealth" />
      </GameRect>
      <GameRect v-if="isTouch || member" :parent="hudRect" :rect="interfaceRects[HudInterfaceRectName.ActionButtons]">
        <HudActions v-if="isTouch" :game-text :input :weapon-type="member?.weaponType" />
        <HudSkills
          v-if="member"
          :burst-cooldown="member.burstCooldown"
          :burst-cooldown-seconds="member.burstCooldownSeconds"
          :energy="member.energy"
          :energy-cost="member.energyCost"
          :game-text
          :input
          :is-touch
          :skill-cooldown="member.skillCooldown"
          :skill-cooldown-seconds="member.skillCooldownSeconds"
        />
      </GameRect>
    </GameRect>
    <!-- The stamina meter stands on the screen itself rather than in its rect of the tree, which sits at the screen's
         Middle, since the recordings show it beside the character wherever the character stands -->
    <HudStamina :frame :game-text :max-stamina="STAMINA_MAX" />
    <slot name="prompts" />
  </GameScreen>
</template>

<style scoped>
.hud {
  pointer-events: none;
}

/* Provisional: the quest tracker has no rect of its own in the HUD's tree, so it stays at its measured place under the
   Minimap until the tree's rect for it is found */
.quest {
  position: absolute;
  top: calc(var(--unit) * 270);
  left: calc(var(--canvas-inset) + var(--unit) * 32);
}
</style>
