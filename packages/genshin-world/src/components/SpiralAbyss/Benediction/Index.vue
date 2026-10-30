<script setup lang="ts">
import type { TextChunk } from "#src/models/data/TextChunk";
import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { GameText } from "genshin-text";

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

const { chamber, choices, floor, gameText, litTowerBuffId, nameText } = defineProps<Props>();
const emit = defineEmits<{ choose: [towerBuffId: number] }>();
const SCOPE_TEXT_KEYS = {
  chamber: GameTextKey.AbyssBenedictionEffectiveChamber,
  floor: GameTextKey.AbyssBenedictionEffectiveFloor,
} as const;
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
      <button
        v-for="{ descriptionTextHash, icon, scope, towerBuffId } in choices"
        :key="towerBuffId"
        class="card"
        :class="{ lit: towerBuffId === litTowerBuffId }"
        type="button"
        @click="emit('choose', towerBuffId)"
      >
        <span class="field" aria-hidden="true" />
        <span class="diamond" aria-hidden="true" />
        <svg v-if="icon === 'sword'" class="glyph sword" viewBox="0 0 37 108" aria-hidden="true">
          <path
            d="M24 5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 1 0 11 0zM15 10h7v20h-7zM0 33 7 30h23l7 3-5 8H5zM11 41h15v44l-7.5 21-7.5-21z"
          />
        </svg>
        <svg v-else-if="icon === 'shield'" class="glyph shield" viewBox="0 0 304 296" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M125.5 48h55l1 1h15l1 1h10l1 1 4.5.5q-2.5 1-2 3.5l4.5 1 1.5-2.5-3-2 21.5-.5q1 2 2 0h9l9 5h4l1-1h10l3 2h2l2-1q1 2.5 3.5 2 .62 4.12-2.5 6-2.25.75-1.5-1.5-.5-2-3.5-1.5-2 .5-1.5 3.5l1 1v6.5l2.5 1h4.5q-1-3 2-2l1 2.5v23l1 1v98l-1 1v11l-1 1v8q2 1 1 5l-4 3-1.5 2.5q-3.75-.75-4.5 1.5v3l-2 6-5.5 5.5-3.5 1v1.5l-4 4v3l-3 5-7 7-1 5.5h-3.5l-4-2h-6l-1.5 2.5 1 1v7l-4.5 2.5-4.5 4.5q.75 2.25-1.5 1.5l-8.5 5.5-1 3.5h-53.5q-.87.13-.5-3.5l-1-3q2-1 1-5-1.75-.75-1-4l1-1 .5-22.5 1.5 4.5v18l1 1v8.5l5 1 1-2.5v-159l1-1v-39q-1.75-.75-1-4 1.75-.75 1-4l-1-3q2-1 1-5-1.19-2.5-5-1.5l-1 3.5 2 4-4 4v7l-1 1-.5 6.5-1.5-15.5q2.25-1.25 1-6l-1-1v-10l-1.5-1.5q-5.3-.8-7 2h-11q-1-2-5-1l-5 2h-20l-1 1h-8l-1-1h-6l-3 1-1-1h-14l-3 4h-14l-3-3-9 8h-4q-1.13 2-4.5 1v4h1.5q1-2 2 0 4.5-1 5.5 1.5v6l1 1v113l1 1v11l1 3 5 5 2.5 4.5 5.5 4.5q.63 3.88 3.5 5.5l4.5 3.5 4.5 8.5 4.5 2.5v2l-2 3q1 2.5 5.5 1.5l4.5 3.5 2 5.5h4.5l7 7q3.87.63 5.5 3.5l1 5-3.5 3.5h-2.5v3h1.5q1-2 2 0l6-1 1 1 8 1 1 1h8l1.5 1.5-1 4.5h-4v-1.5q-.5-2-3.5-1.5l-1.5 3h-17.5q-.75.25-.5-2.5l-2.5-5.5q-1.25 2.25-6 1l-3-2-4.5-1v-1.5l-8.5-10.5-4.5-2.5q-.96-5.04-4.5-7.5l-3.5-2.5-1-3.5q-2.67 1.13-2-1.5l-3.5-3.5q-4.75.75-5.5-2.5l-9-12-6.5-6.5-3.5-2.5-4-8 1-1v-12l-1-2 2-2 1-7-2-2v-10.5q-3 .75-4-1.5v-54l1-1v-15q-1.75-.75-1-4 1.75-.75 1-4l-1-1v-14l3-9-2-6v-11l2-3v-2l2.5-2.5h9q1 2 5 1l3-3 3-1 19-1 1-1q3.25.75 4-1h6l1-1h22l1-1h18l1-1zm-78.5 11-4 3 1 5 3 1 3-4-3-5zm50 216-4 2q-3-1-2 2l2 1 6 2q2-1 1-4l-3-3z M159.5 136l.5 24.5h-1l.5-24.5z"
          />
        </svg>
        <span class="divider" aria-hidden="true" />
        <span class="name">{{ nameText[String(descriptionTextHash)] }}</span>
        <span v-if="scope" class="tag" :class="scope">{{ gameText[SCOPE_TEXT_KEYS[scope]] }}</span>
      </button>
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
  inset: calc(var(--unit) * 4.5);
  border: calc(var(--unit) * 3) solid #cbb8a8;
  border-radius: calc(var(--unit) * 12);
}

.card.lit,
.card:is(:hover, :focus-visible) {
  transform: scale(1.035);
  border: calc(var(--unit) * 4) solid #263d57;
  box-shadow:
    0 0 0 calc(var(--unit) * 2) #8599a9,
    0 0 calc(var(--unit) * 12) calc(var(--unit) * 2) rgb(70 120 180 / 40%);
}

/* The faint square behind the diamond */
.field {
  position: absolute;
  top: calc(var(--unit) * 52);
  left: calc(var(--unit) * 56);
  width: calc(var(--unit) * 131);
  height: calc(var(--unit) * 130);
  background: #f2ebe2;
}

.diamond {
  position: absolute;
  top: calc(var(--unit) * 61);
  left: calc(var(--unit) * 65);
  box-sizing: border-box;
  width: calc(var(--unit) * 110);
  height: calc(var(--unit) * 110);
  border: calc(var(--unit) * 4) solid #ccbfa8;
  transform: rotate(45deg);
}

.glyph {
  position: absolute;
  fill: #8797a6;
}

.glyph.sword {
  top: calc(var(--unit) * 63);
  left: calc(var(--unit) * 101);
  width: calc(var(--unit) * 37);
  height: calc(var(--unit) * 108);
}

.glyph.shield {
  top: calc(var(--unit) * 79);
  left: calc(var(--unit) * 82);
  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 74);
}

.divider {
  position: absolute;
  top: calc(var(--unit) * 235);
  left: calc(var(--unit) * 27);
  width: calc(var(--unit) * 186);
  height: calc(var(--unit) * 1);
  background: #cfc5ba;
}

/* The divider's centre diamond */
.divider::before {
  content: "";
  position: absolute;
  top: calc(var(--unit) * -2.5);
  left: calc(var(--unit) * 117.5);
  width: calc(var(--unit) * 4.5);
  height: calc(var(--unit) * 4.5);
  background: #cfc5ba;
  transform: rotate(45deg);
}

.name {
  position: absolute;
  top: calc(var(--unit) * 251);
  left: calc(var(--unit) * 23);
  width: calc(var(--unit) * 194);
  font-size: calc(var(--unit) * 22);
  font-weight: 700;
  letter-spacing: calc(var(--unit) * 1.2);
  line-height: calc(var(--unit) * 25);
  text-align: center;
}

.tag {
  position: absolute;
  top: calc(var(--unit) * 346);
  left: calc(var(--unit) * 30);
  box-sizing: border-box;
  width: calc(var(--unit) * 180);
  height: calc(var(--unit) * 30);
  border-radius: calc(var(--unit) * 4);
  font-size: calc(var(--unit) * 16);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.4);
  line-height: calc(var(--unit) * 30);
  text-align: center;
  white-space: nowrap;
  color: #fff;
}

.tag.floor {
  background: #62a6b6;
}

.tag.chamber {
  background: #bca690;
}
</style>
