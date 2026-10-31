<script setup lang="ts">
import type { DialogueChoice } from "#src/models/DialogueChoice";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_DIALOGUE_GOLD, ROLE_FLOURISH_PATH } from "#src/services/constants";
import { DialogueChoiceIconPathMap } from "#src/services/DialogueChoiceIconPathMap";

interface Props {
  // The replies on offer, shown once the line is written out, none while the talk only goes on
  choices: DialogueChoice[];
  // The word the advance key's hint reads once the line is written out with no reply on offer
  confirmLabel: string;
  line: string;
  // How many of the line's characters are written out so far; the rest keep their place unseen, so the line never
  // Rewraps as it is written
  revealedLength: number;
  // The reply F would choose, lit as the pointer lights one
  selectedChoiceId: string;
  // The speaker's name over the line, none for a narration, which is drawn centred on black
  speakerName: string;
  // The speaker's role under the name, "" for none
  speakerRole: string;
}

const { choices, confirmLabel, line, revealedLength, selectedChoiceId, speakerName, speakerRole } =
  defineProps<Props>();
const emit = defineEmits<{ advance: []; choose: [id: string] }>();
// The line split by character, so a pair of code units is never cut
const characters = computed(() => [...line]);
// Whole with no reply to choose, the game marks the line as one the reader goes on from
const isWhole = computed(() => line !== "" && choices.length === 0 && revealedLength >= characters.value.length);
// The line split where it is written out to
const lineParts = computed(() => ({
  revealed: characters.value.slice(0, revealedLength).join(""),
  unrevealed: characters.value.slice(revealedLength).join(""),
}));
</script>

<template>
  <!-- The game's dialogue over the world: a click anywhere goes on, the speaker's name over the line at the foot of the
       Screen, and the replies down the right. Sized and placed off the English client's recording of its dialogue
       choices; the selected reply's look and a narration's place wait on recordings still owed -->
  <div class="dialogue-screen" @click="emit('advance')">
    <div class="band" :class="{ narration: !speakerName }" aria-live="polite">
      <p v-if="speakerName" class="speaker" :class="{ 'no-role': !speakerRole }">{{ speakerName }}</p>
      <p v-if="speakerRole" class="role">
        {{ speakerRole }}
        <svg class="flourish" aria-hidden="true" viewBox="0 0 208 128"><path :d="ROLE_FLOURISH_PATH" /></svg>
        <svg class="flourish right" aria-hidden="true" viewBox="0 0 208 128"><path :d="ROLE_FLOURISH_PATH" /></svg>
      </p>
      <p class="line">
        <span aria-hidden="true">{{ lineParts.revealed }}</span>
        <span class="unrevealed" aria-hidden="true">{{ lineParts.unrevealed }}</span>
        <span class="spoken">{{ line }}</span>
      </p>
    </div>
    <ul v-if="choices.length > 0" class="choices">
      <li
        v-for="{ icon, id, text } of choices"
        :key="id"
        :data-interaction-state="id === selectedChoiceId ? 'Hover' : undefined"
      >
        <GameButton
          class="choice"
          :data-icon="icon"
          :kind="GameButtonKind.Reply"
          tip=""
          @click.stop="emit('choose', id)"
        >
          <svg class="icon" aria-hidden="true" :viewBox="DialogueChoiceIconPathMap[icon].viewBox">
            <path :d="DialogueChoiceIconPathMap[icon].d" fill="currentColor" fill-rule="evenodd" />
          </svg>
          {{ text }}
        </GameButton>
      </li>
    </ul>
    <svg v-if="isWhole" class="advance" aria-hidden="true" viewBox="0 0 24 24">
      <path class="ring" d="M12 0L24 12L12 24L0 12ZM12 4L4 12L12 20L20 12Z" fill-rule="evenodd" />
      <path class="core" d="M12 8L16 12L12 16L8 12Z" />
    </svg>
    <p v-if="isWhole" class="confirm">
      <svg class="key" aria-hidden="true" viewBox="0 0 35 35">
        <circle class="key-ground" cx="17.5" cy="17.5" r="17" />
        <path class="key-cross" d="M9 9L26 26M26 9L9 26" />
      </svg>
      {{ confirmLabel }}
    </p>
  </div>
</template>

<style scoped>
.dialogue-screen {
  position: absolute;
  inset: 0;
}

.band {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  height: calc(var(--unit) * 300);
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  padding-top: calc(var(--unit) * 42);
}

/* Provisional: a narration, which names no speaker and no role, is drawn centred on a black screen, the middle of the
   screen being a best estimate of where the game's black screen sets its line, until a recording of one is read for
   its place and darkness */
.band.narration {
  inset: 0;
  height: auto;
  justify-content: center;
  padding-top: 0;
  background: #000;
}

.speaker {
  position: relative;
  margin: 0;
  color: v-bind(GAME_DIALOGUE_GOLD);
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.8);
  line-height: 1;
}

/* A speaker with no role has the gold rule under the name instead, 645 units wide and centred, its middle 5 units under
   the name's foot, read off the English client's recording of Paimon's line (`dialogue-paimon-line`) */
.speaker.no-role::after {
  position: absolute;
  top: calc(100% + var(--unit) * 3.5);
  left: 50%;
  width: calc(var(--unit) * 645);
  height: calc(var(--unit) * 3);
  background: color-mix(in srgb, v-bind(GAME_DIALOGUE_GOLD) 28%, transparent);
  content: "";
  translate: -50% 0;
}

/* The role under the name in the recording's smaller gold, its cap height and width read off the English client's
   recording at 720 high (`dialogue-choices-line`). Its gold rule runs the band's width through the role's middle, under
   the words, with a gold curl either side of them, measured off the same recording (`dialogue-line`) */
.role {
  position: relative;
  z-index: 0;
  margin: 0;
  color: v-bind(GAME_DIALOGUE_GOLD);
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  line-height: calc(var(--unit) * 28);
}

.role::before {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;
  width: calc(var(--unit) * 1263);
  height: calc(var(--unit) * 3);
  background: color-mix(in srgb, v-bind(GAME_DIALOGUE_GOLD) 28%, transparent);
  content: "";
  translate: -50% -50%;
}

/* Each curl is drawn in a 39 by 24 unit box at the rule's height: the left one's left edge 153 units left of the band's
   middle, and the right one, its mirror, starts 115 units right of it. Read off the recording's frame */
.flourish {
  position: absolute;
  top: calc(50% + var(--unit) * -12.5);
  left: calc(50% + var(--unit) * -153);
  width: calc(var(--unit) * 39);
  height: calc(var(--unit) * 24);
  fill: v-bind(GAME_DIALOGUE_GOLD);
  opacity: 0.4;
}

.flourish.right {
  left: calc(50% + var(--unit) * 115);
  scale: -1 1;
}

/* The letter-space is the one that keeps the line's width closest to the game's; the face's own letter widths are
   the remaining gap */
.line {
  max-width: calc(var(--unit) * 1200);
  margin: calc(var(--unit) * 15) 0 0;
  color: #fff;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 2.35);
  line-height: calc(var(--unit) * 32);
  text-align: center;
}

/* The role's box is 28 units, so the line under one takes a 2-unit gap: the two hold the 30-unit place the line has
   under a role, which is where the English client's recording puts it */
.role + .line {
  margin-top: calc(var(--unit) * 2);
}

.unrevealed {
  visibility: hidden;
}

/* The whole line once, for a screen reader, which the written-out halves are hidden from */
.spoken {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* The replies' place is read off the English client's recording: the first pill's left edge at 1275 of 1920 and its top
   at 698 of 1080, each pill 45 high and 15 apart */
.choices {
  position: absolute;
  top: calc(var(--unit) * 698);
  right: calc(var(--unit) * 273);
  display: flex;
  width: calc(var(--unit) * 372);
  flex-direction: column;
  gap: calc(var(--unit) * 15);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The reply's look and its states are its GameButton kind's, so the screen places each and sets only its layout */
.choice {
  display: flex;
  width: 100%;
  min-height: calc(var(--unit) * 45);
  align-items: center;
  gap: calc(var(--unit) * 7.5);
  padding: 0 calc(var(--unit) * 10.5);
  text-align: start;
}

/* The mark's place, its traced glyph from the game's own file, drawn in the pill's colour */
.icon {
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  flex: none;
}

/* The continue mark under the line's middle: a gold diamond ring with a brighter core, 24 units across, its centre at the
   screen's middle 1000 units down, read off the English client's recording (`dialogue-line`) */
.advance {
  position: absolute;
  top: calc(var(--unit) * 988);
  left: calc(var(--unit) * 948);
  width: calc(var(--unit) * 24);
  height: calc(var(--unit) * 24);
}

.ring {
  fill: v-bind(GAME_DIALOGUE_GOLD);
  opacity: 0.5;
}

.core {
  fill: v-bind(GAME_DIALOGUE_GOLD);
  opacity: 0.75;
}

/* The advance key's hint at the foot right: a 35-unit key, a dark round ground with a light rim and a blue cross, and its
   word after 12 units, all read off the same recording */
.confirm {
  position: absolute;
  top: calc(var(--unit) * 990);
  left: calc(var(--unit) * 1659);
  display: flex;
  margin: 0;
  align-items: center;
  gap: calc(var(--unit) * 12);
  color: #fff;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  line-height: calc(var(--unit) * 35);
}

.key {
  width: calc(var(--unit) * 35);
  height: calc(var(--unit) * 35);
  flex: none;
}

.key-ground {
  fill: rgb(0 0 0 / 0.6);
  stroke: rgb(255 255 255 / 0.5);
  stroke-width: 1.5;
}

.key-cross {
  fill: none;
  stroke: rgb(95 156 204);
  stroke-linecap: round;
  stroke-width: 4.5;
}
</style>
