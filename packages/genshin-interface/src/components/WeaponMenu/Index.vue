<script setup lang="ts">
import type { WeaponMenuTab } from "#src/models/WeaponMenuTab";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The action the panel's button takes, in the game's words for the open tab
  actionLabel: string;
  // The way back's name for assistive tech, the game's "Back" line
  closeLabel: string;
  // The tab column's first row, the game's Details, which opens no panel of its own
  detailsLabel: string;
  // Whether the open tab's action is refused now, its button disabled
  isActionDisabled: boolean;
  // The weapon's kind in the reader's language, the word the header puts before its slash
  kind: string;
  // The weapon's name in the reader's language
  name: string;
  // The tabs offered, in the game's order, each with its label in the reader's language
  tabs: { label: string; tab: WeaponMenuTab }[];
}

defineSlots<{ default: () => unknown }>();
const tab = defineModel<WeaponMenuTab>("tab", { required: true });
const { actionLabel, closeLabel, detailsLabel, isActionDisabled, kind, name, tabs } = defineProps<Props>();
const emit = defineEmits<{ action: []; close: [] }>();
</script>

<template>
  <!-- The weapon screen's frame, drawn on the game's 1920 by 864 reference: the weapon's name at the top left, the tab column
       down the left with its Details row and the open tab lit, the open tab's body in the slot, and its action at the foot -->
  <div class="weapon-menu" :data-tab="tab">
    <p class="kind">{{ kind }} /</p>
    <p class="breadcrumb">{{ name }}</p>
    <ul class="tabs">
      <li class="row">
        <span class="diamond" />
        <span class="label">{{ detailsLabel }}</span>
      </li>
      <li v-for="menuTab of tabs" :key="menuTab.tab" class="row">
        <button class="tab" :aria-pressed="menuTab.tab === tab" type="button" @click="tab = menuTab.tab">
          <span class="diamond" />
          <span class="label">{{ menuTab.label }}</span>
        </button>
      </li>
    </ul>
    <slot />
    <GameButton class="action" :disabled="isActionDisabled" :kind="GameButtonKind.Pill" @click="emit('action')">
      {{ actionLabel }}
    </GameButton>
    <button class="close" :aria-label="closeLabel" type="button" @click="emit('close')">↶</button>
  </div>
</template>

<style scoped>
/* Every measure is a pixel of the reference's 1920 by 864 still, which a unit of the 1080 high frame is 1.25 of */
.weapon-menu {
  --reference-pixel: calc(var(--unit) * 1.25);
  position: absolute;
  inset: 0;
  color: #fff;
}

/* The kind sits at the header's left, its slash after it, and the name starts where the reference sets it */
.kind,
.breadcrumb {
  position: absolute;
  top: calc(var(--reference-pixel) * 33);
  margin: 0;
  color: #e9d8a6;
  font-size: calc(var(--reference-pixel) * 28);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.kind {
  left: calc(var(--reference-pixel) * 216);
}

.breadcrumb {
  left: calc(var(--reference-pixel) * 323);
}

/* The tab column's rows are 70 pixels apart, centred on 152, 222 and 292, the open one at the larger size */
.tabs {
  position: absolute;
  top: calc(var(--reference-pixel) * 117);
  left: calc(var(--reference-pixel) * 143);
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  width: calc(var(--reference-pixel) * 300);
  height: calc(var(--reference-pixel) * 70);
  color: #d6cfdd;
  font-size: calc(var(--reference-pixel) * 33);
  font-weight: 600;
  line-height: 1;
}

.tab {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: inherit;
  font: inherit;
  text-align: left;
}

.tab[aria-pressed="true"] {
  color: #fff;
  font-size: calc(var(--reference-pixel) * 43);
}

.diamond {
  flex: none;
  width: calc(var(--reference-pixel) * 9);
  height: calc(var(--reference-pixel) * 9);
  margin-right: calc(var(--reference-pixel) * 15.5);
  background: #cfc8d8;
  rotate: 45deg;
}

.tab[aria-pressed="true"] .diamond {
  width: calc(var(--reference-pixel) * 12);
  height: calc(var(--reference-pixel) * 12);
  margin-right: calc(var(--reference-pixel) * 24.5);
  margin-left: calc(var(--reference-pixel) * -1.5);
  border: calc(var(--reference-pixel) * 2) solid #fff;
  background: none;
}

.action {
  position: absolute;
  top: calc(var(--reference-pixel) * 771);
  left: calc(var(--reference-pixel) * 1511);
  width: calc(var(--reference-pixel) * 289);
  height: calc(var(--reference-pixel) * 65);
  padding-left: calc(var(--reference-pixel) * 34);
  color: #3b4354;
  font-size: calc(var(--reference-pixel) * 32);
  font-weight: 600;
  line-height: 1;
}

/* The way back at the top right, its round disc light over the scene */
.close {
  position: absolute;
  top: calc(var(--reference-pixel) * 19);
  left: calc(var(--reference-pixel) * 1742);
  width: calc(var(--reference-pixel) * 58);
  height: calc(var(--reference-pixel) * 56);
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.35);
  color: #fff;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--reference-pixel) * 30);
  line-height: 1;
}
</style>
