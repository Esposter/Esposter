<script setup lang="ts">
import type { TextSegment } from "#src/models/TextSegment";
import type { WishPoolCell } from "#src/models/WishPoolCell";

import CloseButton from "#src/components/CloseButton/Index.vue";
import RarityStars from "#src/components/RarityStars/Index.vue";
import WishPath from "#src/components/WishPath/Index.vue";
import { CloseButtonMark } from "#src/models/CloseButtonMark";
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
      <CloseButton class="close" :label="closeLabel" :mark="CloseButtonMark.Cross" @click="emit('close')" />
      <ul class="pool">
        <li v-for="[rarity, cells] of poolRarityCellsMap" :key="rarity" class="pool-rarity">
          <RarityStars :rarity />
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
</style>

<style scoped src="../../styles/wishOverlay.css"></style>
