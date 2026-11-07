<script setup lang="ts">
import type { Catalogue } from "#src/models/world/Catalogue";
import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";
import type { GameText } from "genshin-text";

import MapJumpListItem from "#src/components/Map/JumpList/Item/Index.vue";
import { GAME_CREAM } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The regions and their areas, which group the jumps and name each one
  catalogue: Catalogue;
  // The game's words in the reader's language
  gameText: GameText;
  landmarks: PlaceLandmark[];
}

const { catalogue, gameText, landmarks } = defineProps<Props>();
const emit = defineEmits<{ jump: [landmark: PlaceLandmark] }>();
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
      <MapJumpListItem
        v-for="{ areaName, landmark } of jumps"
        :key="landmark.id"
        :area-name
        :game-text
        :landmark
        @jump="emit('jump', landmark)"
      />
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
  color: v-bind(GAME_CREAM);
}

.region {
  margin: 0 0 calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 28);
  font-weight: normal;
}
</style>
