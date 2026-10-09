<script setup lang="ts">
import type { DialogueChoice } from "#src/models/DialogueChoice";

import { computed } from "vue";

interface Props {
  // The replies on offer, shown once the line is written out, none while the talk only goes on
  choices: DialogueChoice[];
  line: string;
  // How many of the line's characters are written out so far; the rest keep their place unseen, so the line never
  // Rewraps as it is written
  revealedLength: number;
  // The reply F would choose, lit as the pointer lights one
  selectedChoiceId: string;
  // The speaker's name over the line, none for a narration
  speakerName: string;
  // The speaker's role under the name, "" for none
  speakerRole: string;
}

const { choices, line, revealedLength, selectedChoiceId, speakerName, speakerRole } = defineProps<Props>();
const emit = defineEmits<{ advance: []; choose: [id: string] }>();
// The line split where it is written out to, by character so a pair of code units is never cut
const lineParts = computed(() => {
  const characters = [...line];
  return {
    revealed: characters.slice(0, revealedLength).join(""),
    unrevealed: characters.slice(revealedLength).join(""),
  };
});
</script>

<template>
  <!-- The game's dialogue over the world: a click anywhere goes on, the speaker's name over the line at the foot of the
       Screen, and the replies down the right. Sized and placed off the English client's recording of its dialogue
       choices; the selected reply's look and the speaker's role line wait on recordings still owed -->
  <div class="dialogue-screen" @click="emit('advance')">
    <div class="band" aria-live="polite">
      <p v-if="speakerName" class="speaker">{{ speakerName }}</p>
      <p v-if="speakerRole" class="role">{{ speakerRole }}</p>
      <p class="line">
        <span aria-hidden="true">{{ lineParts.revealed }}</span>
        <span class="unrevealed" aria-hidden="true">{{ lineParts.unrevealed }}</span>
        <span class="spoken">{{ line }}</span>
      </p>
    </div>
    <ul v-if="choices.length > 0" class="choices">
      <li v-for="{ icon, id, text } of choices" :key="id">
        <button
          class="choice"
          :class="{ selected: id === selectedChoiceId }"
          :data-icon="icon"
          type="button"
          @click.stop="emit('choose', id)"
        >
          <span class="icon" aria-hidden="true" />
          {{ text }}
        </button>
      </li>
    </ul>
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

/* The name's gold is the brightest saturated pixel of its letters in the English client's recording */
.speaker {
  margin: 0;
  color: #ffc700;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: 1;
}

/* The role under the name in the recording's smaller gold; its slot is the line's offset between a speaker with one and
   one without, so the line keeps its place either way */
.role {
  margin: 0;
  color: #ffc700;
  font-size: calc(var(--unit) * 13);
  font-weight: 600;
  line-height: calc(var(--unit) * 16.5);
}

.line {
  max-width: calc(var(--unit) * 1200);
  margin: calc(var(--unit) * 13.5) 0 0;
  color: #fff;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 2.3);
  line-height: calc(var(--unit) * 32);
  text-align: center;
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

.choice {
  display: flex;
  width: 100%;
  min-height: calc(var(--unit) * 45);
  align-items: center;
  gap: calc(var(--unit) * 7.5);
  padding: 0 calc(var(--unit) * 10.5);
  letter-spacing: calc(var(--unit) * 0.5);
  border: none;
  border-radius: calc(var(--unit) * 23);
  /* A pill is a fifth black over the scene, the darkness that scored best against the recording */
  background: rgb(0 0 0 / 0.22);
  color: #fff;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  text-align: start;
}

.choice:hover,
.choice:focus-visible,
.choice.selected {
  background: rgb(255 255 255 / 0.85);
  color: #3b4255;
  outline: none;
}

/* The mark's place, its glyph to come from the trace of the game's own */
.icon {
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  flex: none;
}
</style>
