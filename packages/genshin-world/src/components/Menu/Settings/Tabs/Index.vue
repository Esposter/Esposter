<script setup lang="ts">
import type { SettingsTab } from "#src/models/menu/SettingsTab";
import type { GameText } from "genshin-text";

import { SETTINGS_DIMMED_TABS, SETTINGS_TABS } from "#src/services/menu/constants";
import { SettingsTabGameTextKeyMap } from "#src/services/menu/SettingsTabGameTextKeyMap";
import { SettingsTabSectionsMap } from "#src/services/menu/SettingsTabSectionsMap";
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The game's words in the reader's language, which each tab's name is drawn in
  gameText: GameText;
}

// The tab the screen shows, which a tab's own press chooses
const tab = defineModel<SettingsTab>("tab", { required: true });
defineProps<Props>();
</script>

<template>
  <div class="tabs" role="tablist" aria-orientation="vertical">
    <GameButton
      v-for="settingsTab of SETTINGS_TABS"
      :key="settingsTab"
      class="tab"
      :aria-selected="settingsTab === tab"
      :class="{ dimmed: SETTINGS_DIMMED_TABS.includes(settingsTab) }"
      :disabled="!SettingsTabSectionsMap[settingsTab]"
      :kind="GameButtonKind.Row"
      role="tab"
      tip=""
      @click="tab = settingsTab"
    >
      <svg v-if="settingsTab === tab" class="selected-bullet" aria-hidden="true" viewBox="0 0 28 28">
        <path d="M 14 1.5 L 26.5 14 L 14 26.5 L 1.5 14 Z" />
        <path class="arrow" d="M 12 9 L 17.5 14 L 12 19 Z" />
      </svg>
      <span v-else class="bullet" />
      <span class="name">{{ gameText[SettingsTabGameTextKeyMap[settingsTab]] }}</span>
    </GameButton>
  </div>
</template>

<style scoped>
.tabs {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: 0;
  display: flex;
  flex-direction: column;
}

.tab {
  position: relative;
  height: calc(var(--unit) * 69.5);
  padding: 0 0 0 calc(var(--unit) * 144);
  border: none;
  background: none;
  color: rgb(232 232 230 / 0.74);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.2);
  line-height: 1;
  text-align: start;
  text-shadow: 0 0 calc(var(--unit) * 4) rgb(30 30 40 / 0.3);
  white-space: nowrap;
}

.tab[aria-selected="true"] {
  padding-bottom: calc(var(--unit) * 3);
  padding-left: calc(var(--unit) * 154);
  color: #edeae7;
  font-size: calc(var(--unit) * 41);
  letter-spacing: calc(var(--unit) * 2.4);
}

/* The last two tabs, Resources and Other, are dimmer than the rest: set by eye off the clip's tab column
   (`yt-5EmJX_RyuY8-menu-settings`, 1920 wide), where they are barely above the sand behind them */
.tab.dimmed {
  opacity: 0.5;
}

/* The open tab is held selected by GameButton's row tint, which the game does not draw here: the reference's Graphics tab
   Has no band behind its name, only the light below, so the tint is turned off on the tabs. Measured on the clip's sidebar
   (`yt-5EmJX_RyuY8-menu-settings`, 1920 wide), where the band scored the sidebar's cell at 5% */
.tabs .tab[aria-selected="true"]::before {
  opacity: 0;
}

/* Provisional: the light the open tab's name trails to its right, behind its last letters, solved from the clip's glow
   Over its world, without the sparkles that drift along it */
.name {
  position: relative;
}

.tab[aria-selected="true"] .name::after {
  position: absolute;
  top: calc(50% - var(--unit) * 12.5);
  left: calc(100% - var(--unit) * 36);
  z-index: -1;
  width: calc(var(--unit) * 170);
  height: calc(var(--unit) * 24);
  background: linear-gradient(to right, rgb(255 255 255 / 0.45), rgb(255 255 255 / 0.2) 50%, rgb(255 255 255 / 0));
  content: "";
  mask-image: linear-gradient(transparent, #000, transparent);
}

/* Dimmer than the name beside it */
.bullet {
  position: absolute;
  top: calc(50% - var(--unit));
  left: calc(var(--unit) * 124.5);
  width: calc(var(--unit) * 10.5);
  height: calc(var(--unit) * 10.5);
  background: rgb(232 232 230 / 0.52);
  transform: translate(-50%, -50%) rotate(45deg);
}

.selected-bullet {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 110.5);
  width: calc(var(--unit) * 28);
  height: calc(var(--unit) * 28);
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.5;
  transform: translateY(-50%);
}

.selected-bullet .arrow {
  fill: currentcolor;
  stroke: none;
}
</style>
