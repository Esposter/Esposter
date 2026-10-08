<script setup lang="ts">
import type { Landmark } from "#src/models/world/Landmark";
import type { GameText } from "genshin-text";

import { catalogue } from "#src/services/world/catalogue";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  landmarks: Landmark[];
}

const { gameText, landmarks } = defineProps<Props>();
const emit = defineEmits<{ jump: [landmark: Landmark] }>();
// Every region with somewhere to jump to, in the catalogue's order, each landmark named by its area
const regionJumps = computed(() =>
  catalogue.regions
    .map(({ areas, id, name }) => ({
      id,
      jumps: areas.flatMap((area) =>
        landmarks.filter(({ areaId }) => areaId === area.id).map((landmark) => ({ areaName: area.name, landmark })),
      ),
      name,
    }))
    .filter(({ jumps }) => jumps.length > 0),
);
</script>

<template>
  <!-- Every place a jump lands, grouped by region, so the whole map is reached by the keyboard and named for a screen
       Reader: each a button carrying its area's name and the kind of place it is -->
  <nav class="jump-list" :aria-label="gameText[GameTextKey.Teleport]">
    <section v-for="{ id, jumps, name } of regionJumps" :key="id">
      <h2 class="region">{{ name }}</h2>
      <button
        v-for="{ areaName, landmark } of jumps"
        :key="landmark.id"
        class="jump"
        type="button"
        @click="emit('jump', landmark)"
      >
        <span>{{ areaName }}</span>
        <span class="kind">{{ gameText[GameTextKey.StatueOfTheSeven] }}</span>
      </button>
    </section>
  </nav>
</template>

<style scoped>
/* Provisional: the list's look, measured off the game's map with the HUD's reference */
.jump-list {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 24);
  overflow-y: auto;
  color: #ece5d8;
}

.region {
  margin: 0 0 calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 28);
  font-weight: normal;
}

.jump {
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: calc(var(--unit) * 12) calc(var(--unit) * 16);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.08);
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 24);
  text-align: start;
}

.jump:hover,
.jump:focus-visible {
  background: rgb(255 255 255 / 0.2);
}

.kind {
  font-size: calc(var(--unit) * 18);
  opacity: 0.7;
}
</style>
