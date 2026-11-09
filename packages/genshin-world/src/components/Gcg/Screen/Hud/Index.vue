<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameTextKey } from "genshin-text";

interface Props {
  // The battle of the challenge the duel is, as the counter names it in the reader's language
  battleLabel: string;
  // The game's words in the reader's language
  gameText: GameText;
}

defineProps<Props>();
const emit = defineEmits<{ concede: [] }>();
</script>

<template>
  <!-- The battle counter under the host's name at the top left, and the three round discs at the top right: the record and
       the history, their icons not drawn, and the concede that leaves the duel -->
  <div class="battle">{{ battleLabel }}</div>
  <div class="hud-disc record" />
  <div class="hud-disc history" />
  <button
    class="hud-disc concede ring-button"
    :aria-label="gameText[GameTextKey.GcgConcede]"
    type="button"
    @click="emit('concede')"
  />
</template>

<style scoped src="genshin-interface/styles/ringButton.css"></style>

<style scoped src="../../../../styles/gcgBoardButton.css"></style>

<style scoped>
/* The battle counter sits under the host's name at the top left, its words cap-high at 74 and on the baseline at 87 */
.battle {
  position: absolute;
  top: calc(var(--unit) * 69.5);
  left: calc(var(--unit) * 148);
  color: #c8d6e8;
  font-size: calc(var(--unit) * 19);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * -0.3);
  line-height: calc(var(--unit) * 22);
}

/* The three round buttons of the top right: the concede beside a record and a history disc the frame shows, their icons not drawn */
.hud-disc {
  position: absolute;
  top: calc(var(--unit) * 20);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border: calc(var(--unit) * 3) solid #c99a4a;
  border-radius: 50%;
  background: #a8a094;
}

.record {
  left: calc(var(--unit) * 1672);
}

.history {
  left: calc(var(--unit) * 1747);
}

.concede {
  right: calc(var(--unit) * 26);
}
</style>
