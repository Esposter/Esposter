<script setup lang="ts">
import type { TextChunk } from "#src/models/data/TextChunk";
import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { GameText } from "genshin-text";

import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The Benedictions the chamber's list offers, each with its description's text hash and its id in the buff table
  choices: AbyssBenedictionChoice[];
  // The game's words in the reader's language
  gameText: GameText;
  // The Benediction the pointer rests on, drawn lit at rest as the game lights it; a fixture sets the one its reference shows
  litTowerBuffId?: number;
  // The names in the reader's language, each by its text id
  nameText: TextChunk;
}

const { choices, gameText, litTowerBuffId, nameText } = defineProps<Props>();
const emit = defineEmits<{ choose: [towerBuffId: number] }>();
</script>

<template>
  <!-- The Benediction the player takes into a chamber, offered at its start: the game's own hint over a card per
       Benediction in the list, its name in the reader's language, and a press chooses it -->
  <GameScreen
    class="abyss-benediction"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.AbyssBenedictionHint]"
  >
    <span class="rule top" aria-hidden="true" />
    <span class="rule bottom" aria-hidden="true" />
    <p class="hint">{{ gameText[GameTextKey.AbyssBenedictionHint] }}</p>
    <div class="cards">
      <button
        v-for="{ descriptionTextHash, towerBuffId } in choices"
        :key="towerBuffId"
        class="card"
        :class="{ lit: towerBuffId === litTowerBuffId }"
        type="button"
        @click="emit('choose', towerBuffId)"
      >
        <span class="diamond" aria-hidden="true" />
        <span class="divider" aria-hidden="true" />
        <span class="name">{{ nameText[String(descriptionTextHash)] }}</span>
      </button>
    </div>
  </GameScreen>
</template>

<style scoped>
/* Every place and size is in the game's 1080-high units, read off the reference's English PC client at 1920 by 1080:
   the cards 240 wide and 397 high at 528 and 1152 either side of the centre, the lit one 1.035 times larger */
.rule {
  position: absolute;
  left: calc(var(--unit) * 100);
  width: calc(var(--unit) * 1720);
  height: calc(var(--unit) * 2);
  background: rgb(236 226 200 / 30%);
}

.rule.top {
  top: calc(var(--unit) * 146);
}

.rule.bottom {
  top: calc(var(--unit) * 903);
}

.hint {
  position: absolute;
  top: calc(var(--unit) * 261);
  left: 50%;
  width: calc(var(--unit) * 1440);
  margin: 0;
  transform: translateX(-50%);
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 32);
  text-align: center;
  color: #dcc394;
}

.cards {
  position: absolute;
  top: calc(var(--unit) * 337);
  left: 50%;
  display: flex;
  gap: calc(var(--unit) * 72);
  transform: translateX(-50%);
}

.card {
  position: relative;
  box-sizing: border-box;
  width: calc(var(--unit) * 240);
  height: calc(var(--unit) * 397);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: #faf6ee;
  color: #3f3f52;
  font: inherit;
  cursor: inherit;
  outline: none;
}

/* The card's tan frame, five in from its edge */
.card::before {
  content: "";
  position: absolute;
  inset: calc(var(--unit) * 5);
  border: calc(var(--unit) * 2) solid #cdbca6;
  border-radius: calc(var(--unit) * 6);
}

.card.lit,
.card:is(:hover, :focus-visible) {
  transform: scale(1.035);
  border: calc(var(--unit) * 4) solid #263d57;
  box-shadow:
    0 0 0 calc(var(--unit) * 2) #8599a9,
    0 0 calc(var(--unit) * 12) calc(var(--unit) * 2) rgb(70 120 180 / 40%);
}

.diamond {
  position: absolute;
  top: calc(var(--unit) * 61);
  left: calc(var(--unit) * 65);
  box-sizing: border-box;
  width: calc(var(--unit) * 110);
  height: calc(var(--unit) * 110);
  border: calc(var(--unit) * 3) solid #cdbc98;
  transform: rotate(45deg);
}

.divider {
  position: absolute;
  top: calc(var(--unit) * 235);
  left: calc(var(--unit) * 27);
  width: calc(var(--unit) * 186);
  height: calc(var(--unit) * 1);
  background: #cfc5ba;
}

.name {
  position: absolute;
  top: calc(var(--unit) * 252);
  left: calc(var(--unit) * 18);
  width: calc(var(--unit) * 204);
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: calc(var(--unit) * 26.5);
  text-align: center;
}
</style>
