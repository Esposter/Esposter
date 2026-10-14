<script setup lang="ts">
import type { TextSegment } from "#src/models/TextSegment";
import type { WishPoolCell } from "#src/models/WishPoolCell";

import WishPath from "#src/components/WishPath/Index.vue";
import { computed } from "vue";

interface Props {
  // The way out of the popup in the reader's language
  closeLabel: string;
  // The Fate Points the Epitomized Path holds as the game words and colours them, "[]" on every banner but the weapon wish's
  fatePoints: TextSegment[];
  // The Epitomized Path's name, "" on every banner but the weapon wish's
  pathLabel: string;
  // What the open banner can draw, the highest rarity first and the featured first of each rarity
  pool: WishPoolCell[];
  title: string;
}

const { closeLabel, fatePoints, pathLabel, pool, title } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const poolRarityCellsMap = computed(() => Map.groupBy(pool, ({ rarity }) => rarity));
</script>

<template>
  <!-- The Details popup the wish screen's Details opens: the open banner's Pool by rarity, its Epitomized Path on the weapon
       Wish, over the wish screen until its close is clicked. Provisional: its place and size wait on a recording of the
       English Client's popup at 1080 high -->
  <div class="wish-details" role="dialog" :aria-label="title">
    <div class="panel">
      <p class="title">{{ title }}</p>
      <button class="close" type="button" :aria-label="closeLabel" @click="emit('close')">✕</button>
      <ul class="pool">
        <li v-for="[rarity, cells] of poolRarityCellsMap" :key="rarity" class="pool-rarity">
          <span class="stars">{{ "★".repeat(rarity) }}</span>
          <ul class="pool-items">
            <li v-for="{ id, isFeatured, name } of cells" :key="id" class="pool-item" :data-featured="isFeatured">
              {{ name }}
            </li>
          </ul>
        </li>
      </ul>
      <WishPath v-if="pathLabel" :path-label :fate-points />
    </div>
  </div>
</template>

<style scoped>
.wish-details {
  position: absolute;
  inset: 0;
  display: grid;
  background: rgb(0 0 0 / 0.5);
  place-items: center;
}

.panel {
  position: relative;
  display: flex;
  width: calc(var(--unit) * 1200);
  flex-direction: column;
  gap: calc(var(--unit) * 12);
  padding: calc(var(--unit) * 32) calc(var(--unit) * 40);
  box-sizing: border-box;
  border-radius: calc(var(--unit) * 8);
  background: rgb(28 32 42 / 0.96);
  color: #ece5d8;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 28);
}

.close {
  position: absolute;
  top: calc(var(--unit) * 24);
  right: calc(var(--unit) * 24);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
}

.pool,
.pool-items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pool {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 12);
  font-size: calc(var(--unit) * 18);
}

.pool-rarity {
  display: flex;
  gap: calc(var(--unit) * 16);
}

.pool-items {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--unit) * 4) calc(var(--unit) * 16);
}

.pool-item[data-featured="true"] {
  color: #ffd780;
}

.stars {
  color: #ffcc32;
  white-space: nowrap;
}
</style>
