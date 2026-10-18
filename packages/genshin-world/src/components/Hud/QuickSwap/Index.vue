<script setup lang="ts">
import type { GameText } from "genshin-text";

import { QUICK_SWAP_GADGET_LIMIT } from "#src/services/gadget/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
</script>

<template>
  <!-- The quick swap menu drawn over the world's centre while Z is held past its hold: a cyan band of the menu's slots
       under a tag asking for one, and the prompts of its switch and cancel below. Its slots stand empty until a gadget
       is added to the menu, and the menu passes no clicks through to the world -->
  <div class="quick-swap" :aria-label="gameText[GameTextKey.QuickSwapSelect]" role="dialog">
    <div class="tag">{{ gameText[GameTextKey.QuickSwapSelect] }}</div>
    <div class="slots">
      <div v-for="slot in QUICK_SWAP_GADGET_LIMIT" :key="slot" class="slot" />
    </div>
    <div class="prompts">
      <span>{{ gameText[GameTextKey.QuickSwapSwitch] }}</span>
      <span>{{ gameText[GameTextKey.Cancel] }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Centred on the screen, as the menu sits in the recording: a band 720 wide and 166 high, its slots 128 across a pitch
   of 176 with 32 at either end, its tag 256 by 51 on its top edge and its prompts 125 below the centre. Measured from a
   1920 by 1080 frame of the 2023 recording, the menu's look at its era, so provisional until a current frame is read */
.quick-swap {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--unit) * 720);
  height: calc(var(--unit) * 166);
  transform: translate(-50%, -50%);
  border: calc(var(--unit) * 2) solid rgb(115 203 233 / 0.85);
  background: rgb(40 62 82 / 0.72);
  pointer-events: none;
}

/* The tag stands on the band's top edge, its prompt in two lines of white */
.tag {
  position: absolute;
  bottom: 100%;
  left: 50%;
  display: grid;
  place-items: center;
  width: calc(var(--unit) * 256);
  height: calc(var(--unit) * 51);
  transform: translateX(-50%);
  background: rgb(115 206 233);
  color: #fff;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: 1.1;
  text-align: center;
}

.slots {
  display: flex;
  gap: calc(var(--unit) * 48);
}

/* An empty slot is a disc of the band's own dark tone, ringed in the pale grey the recording shows its slots in */
.slot {
  width: calc(var(--unit) * 128);
  height: calc(var(--unit) * 128);
  border: calc(var(--unit) * 2) solid rgb(183 199 198 / 0.7);
  border-radius: 50%;
  background: rgb(48 73 95 / 0.8);
}

/* The prompts sit 125 below the centre, the switch on the left of the cancel, each in white with a shadow for the
   world behind it */
.prompts {
  position: absolute;
  top: calc(50% + var(--unit) * 125);
  left: 50%;
  display: flex;
  gap: calc(var(--unit) * 40);
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: calc(var(--unit) * 30);
  text-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.8);
  white-space: nowrap;
}
</style>
