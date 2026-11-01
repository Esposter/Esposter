<script setup lang="ts">
import type { GameText } from "genshin-text";

import { CharacterMenuTab, GAME_CREAM } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The tab the screen shows, whose Training Guide and UID the foot draws on the Attributes tab alone
  tab: CharacterMenuTab;
  // The game's words in the reader's language
  gameText: GameText;
  // The player's UID, which the Attributes tab draws at the foot of the frame, none until the host gives it
  uid?: number;
}

const { gameText, tab, uid } = defineProps<Props>();
</script>

<template>
  <span class="grid" />
  <p v-if="tab === CharacterMenuTab.Attributes" class="training-guide cream-pill">
    {{ gameText[GameTextKey.TrainingGuide] }}
  </p>
  <p v-if="uid !== undefined && tab === CharacterMenuTab.Attributes" class="uid">
    {{ gameText[GameTextKey.Uid] }}: {{ uid }}
  </p>
</template>

<style scoped src="genshin-interface/styles/creamPill.css"></style>

<style scoped>
/* The foot's pieces, measured off the same frame: the grid's disc centred 148 units from the left and 1006 from the top,
   and the Training Guide pill from 200 units, 49 high. Their colours are provisional */
.grid {
  position: absolute;
  top: calc(var(--unit) * 978);
  left: calc(var(--unit) * 120);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border-radius: 50%;
  background-color: v-bind(GAME_CREAM);
  background-image:
    linear-gradient(#3b4255, #3b4255), linear-gradient(#3b4255, #3b4255), linear-gradient(#3b4255, #3b4255),
    linear-gradient(#3b4255, #3b4255);
  background-position:
    30% 30%,
    70% 30%,
    30% 70%,
    70% 70%;
  background-repeat: no-repeat;
  background-size: 20% 20%;
}

.training-guide {
  position: absolute;
  top: calc(var(--unit) * 983);
  left: calc(var(--unit) * 200);
  margin: 0;
  padding: 0 calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 49);
}

/* The UID at the frame's foot, its right edge 150 units in from the frame's right and its line centred 1065 units down,
   measured off the reference frame (`references/character-attributes.png`, 0.75 units a pixel at 1440 high) */
.uid {
  position: absolute;
  top: calc(var(--unit) * 1052);
  right: calc(var(--unit) * 150);
  margin: 0;
  color: v-bind(GAME_CREAM);
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
}
</style>
