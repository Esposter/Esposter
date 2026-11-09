<script setup lang="ts">
import type { TextChunk } from "#src/models/data/TextChunk";
import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { GameText } from "genshin-text";

import SpiralAbyssBenedictionCard from "#src/components/SpiralAbyss/Benediction/Card/Index.vue";
import { GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The chamber the title names, counted from its floor's first; the title is absent until the screen is given it
  chamber?: number;
  // The Benedictions the chamber's list offers, each with its description's text hash and its id in the buff table
  choices: AbyssBenedictionChoice[];
  // The floor the title names; the title is absent until the screen is given it
  floor?: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The Benediction the pointer rests on, drawn lit at rest as the game lights it; a fixture sets the one its reference shows
  litTowerBuffId?: number;
  // The names in the reader's language, each by its text id
  nameText: TextChunk;
}

const { chamber, floor, gameText } = defineProps<Props>();
const emit = defineEmits<{ choose: [towerBuffId: number] }>();
const title = computed(() =>
  floor === undefined || chamber === undefined
    ? undefined
    : fillGameTextValues(gameText[GameTextKey.AbyssFloorChamberTitle], floor, chamber),
);
</script>

<template>
  <!-- The Benediction the player takes into a chamber, offered at its start: the game's own hint over a card per
       Benediction in the list, its name in the reader's language, the span it lasts and its glyph, and a press chooses it -->
  <GameScreen
    class="abyss-benediction"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.AbyssBenedictionHint]"
  >
    <p v-if="title" class="title" role="heading" aria-level="1">{{ title }}</p>
    <span class="rule top" aria-hidden="true" />
    <span class="rule bottom" aria-hidden="true" />
    <p class="hint">{{ gameText[GameTextKey.AbyssBenedictionHint] }}</p>
    <div class="cards">
      <SpiralAbyssBenedictionCard
        v-for="{ descriptionTextHash, icon, scope, towerBuffId } in choices"
        :key="towerBuffId"
        :game-text
        :icon
        :is-lit="towerBuffId === litTowerBuffId"
        :name="nameText[String(descriptionTextHash)]"
        :scope
        @choose="emit('choose', towerBuffId)"
      />
    </div>
  </GameScreen>
</template>

<style scoped>
/* Every place and size is in the game's 1080-high units, read off the reference's English PC client at 1920 by 1080:
   the cards 240 wide and 397 high at 528 and 1152 either side of the centre, the lit one 1.035 times larger */
.title {
  position: absolute;
  top: calc(var(--unit) * 68);
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  font-size: calc(var(--unit) * 52);
  font-weight: 700;
  line-height: calc(var(--unit) * 56);
  white-space: nowrap;
  color: #f3ecdc;
}

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
  top: calc(var(--unit) * 262);
  left: 50%;
  width: calc(var(--unit) * 1440);
  margin: 0;
  transform: translateX(-50%);
  font-size: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 1.5);
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
</style>
