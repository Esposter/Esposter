<script setup lang="ts">
import type { CharacterData } from "#src/models/character/CharacterData";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { HudMember } from "#src/models/hud/HudMember";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Party } from "#src/models/party/Party";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Landmark } from "#src/models/world/Landmark";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";
import type { VNode } from "vue";

import HudHealth from "#src/components/Hud/Health/Index.vue";
import HudMinimap from "#src/components/Hud/Minimap/Index.vue";
import HudPaimonButton from "#src/components/Hud/PaimonButton/Index.vue";
import HudParty from "#src/components/Hud/Party/Index.vue";
import HudQuest from "#src/components/Hud/Quest/Index.vue";
import HudSkills from "#src/components/Hud/Skills/Index.vue";
import HudStamina from "#src/components/Hud/Stamina/Index.vue";
import HudTouch from "#src/components/Hud/Touch/Index.vue";
import { useMediaQuery } from "@vueuse/core";
import { STAMINA_MAX } from "genshin-engine";
import { GameScreen } from "genshin-interface";

interface Props {
  camera: MapCamera;
  // The deployed team's characters' data, which the team stays hidden without until the stat tables arrive
  characterDataMap?: ReadonlyMap<number, CharacterData>;
  // The world's frame: the stamina the meter fills by, where the follow camera's pivot stands, and the world's clock
  frame: HudFrame;
  // The game's words in the reader's language
  gameText: GameText;
  input: Input;
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
  characterDataMap,
  frame,
  gameText,
  input,
  landmarks,
  member,
  nameTextMap,
  party,
  questProgress,
  questTextMap,
  trackedQuest,
} = defineProps<Props>();
const emit = defineEmits<{ map: []; menu: [] }>();
// A device whose main pointer is a finger has no keys or mouse to move and look with, so the touch controls are drawn
const isTouch = useMediaQuery("(pointer: coarse)");
</script>

<template>
  <!-- The heads-up display over the world: only the pieces the world backs, each in its place. The Paimon button and
       The minimap in the top left with the quest tracker under them, the party down the right, the member on the
       Field's health at the bottom's middle, the skill and burst at the bottom right, the stamina meter where it places
       Itself, and on a touch screen the touch controls under them all. Everything between the pieces lets the pointer
       Through to the world, and a press on a piece stays the piece's, never reaching the world's input as an attack -->
  <GameScreen class="hud" @mousedown.stop>
    <HudTouch v-if="isTouch" :game-text :input />
    <div class="corner">
      <HudPaimonButton :game-text @press="emit('menu')" />
      <HudMinimap :camera :game-text :landmarks @open="emit('map')" />
    </div>
    <div v-if="trackedQuest" class="quest">
      <HudQuest :input :quest="trackedQuest" :quest-progress :text-map="questTextMap" />
    </div>
    <div v-if="characterDataMap" class="party">
      <HudParty :character-data-map :frame :input :name-text-map :party />
    </div>
    <div v-if="member" class="health">
      <HudHealth :game-text :health="member.health" :level="member.level" :max-health="member.maxHealth" />
    </div>
    <div v-if="member" class="skills">
      <HudSkills
        :burst-cooldown="member.burstCooldown"
        :burst-cooldown-seconds="member.burstCooldownSeconds"
        :energy="member.energy"
        :energy-cost="member.energyCost"
        :game-text
        :input
        :skill-cooldown="member.skillCooldown"
        :skill-cooldown-seconds="member.skillCooldownSeconds"
      />
    </div>
    <HudStamina :frame :game-text :max-stamina="STAMINA_MAX" />
    <slot name="prompts" />
  </GameScreen>
</template>

<style scoped>
.hud {
  pointer-events: none;
}

/* Provisional: each piece's place, read off the HUD's RectTransform tree once its block is found, and measured off a
   Recording of the English PC client's world HUD until then */
.corner {
  position: absolute;
  top: calc(var(--unit) * 24);
  left: calc(var(--canvas-inset) + var(--unit) * 32);
  display: flex;
  align-items: flex-start;
  gap: calc(var(--unit) * 24);
}

.quest {
  position: absolute;
  top: calc(var(--unit) * 270);
  left: calc(var(--canvas-inset) + var(--unit) * 32);
}

.party {
  position: absolute;
  top: 50%;
  right: calc(var(--canvas-inset) + var(--unit) * 32);
  translate: 0 -50%;
}

.health {
  position: absolute;
  bottom: calc(var(--unit) * 40);
  left: 50%;
  translate: -50% 0;
}

.skills {
  position: absolute;
  right: calc(var(--canvas-inset) + var(--unit) * 64);
  bottom: calc(var(--unit) * 40);
}
</style>
