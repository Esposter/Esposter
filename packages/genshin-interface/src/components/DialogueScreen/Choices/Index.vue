<script setup lang="ts">
import type { DialogueChoice } from "#src/models/DialogueChoice";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { DialogueChoiceIconPathMap } from "#src/services/DialogueChoiceIconPathMap";

interface Props {
  // The replies on offer, down the right of the screen
  choices: DialogueChoice[];
  // The reply F would choose, lit as the pointer lights one
  selectedChoiceId: string;
}

const { choices, selectedChoiceId } = defineProps<Props>();
const emit = defineEmits<{ choose: [id: string] }>();
</script>

<template>
  <ul class="choices">
    <li
      v-for="{ icon, id, text } of choices"
      :key="id"
      :data-interaction-state="id === selectedChoiceId ? 'Hover' : undefined"
    >
      <GameButton class="choice" :data-icon="icon" :kind="GameButtonKind.Reply" tip="" @click.stop="emit('choose', id)">
        <svg class="icon" aria-hidden="true" :viewBox="DialogueChoiceIconPathMap[icon].viewBox">
          <path :d="DialogueChoiceIconPathMap[icon].d" fill="currentColor" fill-rule="evenodd" />
        </svg>
        {{ text }}
      </GameButton>
    </li>
  </ul>
</template>

<style scoped>
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
</style>
