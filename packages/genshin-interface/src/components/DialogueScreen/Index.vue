<script setup lang="ts">
import type { DialogueChoice } from "#src/models/DialogueChoice";

interface Props {
  // The replies on offer, shown once the line is written out, none while the talk only goes on
  choices: DialogueChoice[];
  line: string;
  // How many of the line's characters are written out so far; the rest keep their place unseen, so the line never
  // Rewraps as it is written
  revealedLength: number;
  // The speaker's name over the line, none for a narration
  speakerName: string;
}

const { choices, line, revealedLength, speakerName } = defineProps<Props>();
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
       Screen, and the replies down the right. Provisional: every size, place and colour here waits on the parity pass
       Against a recording of the English client's dialogue -->
  <div class="dialogue-screen" @click="emit('advance')">
    <div class="band" aria-live="polite">
      <p v-if="speakerName" class="speaker">{{ speakerName }}</p>
      <p class="line">
        <span aria-hidden="true">{{ lineParts.revealed }}</span>
        <span class="unrevealed" aria-hidden="true">{{ lineParts.unrevealed }}</span>
        <span class="spoken">{{ line }}</span>
      </p>
    </div>
    <ul v-if="choices.length > 0" class="choices">
      <li v-for="{ icon, id, text } of choices" :key="id">
        <button class="choice" :data-icon="icon" type="button" @click.stop="emit('choose', id)">
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
  padding-top: calc(var(--unit) * 96);
  background: linear-gradient(transparent, rgb(0 0 0 / 0.6));
}

.speaker {
  margin: 0;
  color: #d3bc8e;
  font-size: calc(var(--unit) * 34);
  font-weight: 600;
  line-height: 1;
}

.line {
  max-width: calc(var(--unit) * 1200);
  margin: calc(var(--unit) * 20) 0 0;
  color: #fff;
  font-size: calc(var(--unit) * 32);
  font-weight: 600;
  line-height: calc(var(--unit) * 44);
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

.choices {
  position: absolute;
  top: calc(var(--unit) * 560);
  right: calc(var(--unit) * 200);
  display: flex;
  width: calc(var(--unit) * 560);
  flex-direction: column;
  gap: calc(var(--unit) * 12);
  margin: 0;
  padding: 0;
  list-style: none;
}

.choice {
  display: flex;
  width: 100%;
  min-height: calc(var(--unit) * 60);
  align-items: center;
  gap: calc(var(--unit) * 16);
  padding: 0 calc(var(--unit) * 24);
  border: none;
  border-radius: calc(var(--unit) * 30);
  background: rgb(0 0 0 / 0.45);
  color: #ece5d8;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  text-align: start;
}

.choice:hover,
.choice:focus-visible {
  background: rgb(255 255 255 / 0.85);
  color: #3b4255;
  outline: none;
}

/* The mark's place, its glyph to come from the trace of the game's own */
.icon {
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
  flex: none;
}
</style>
