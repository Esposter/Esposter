<script setup lang="ts">
interface Props {
  // The Oculi the region has collected and not yet offered
  collectedCount: number;
  // The region's level, which an offer raises
  level: number;
  // Each of the region's levels, its rewards named, and whether the region has reached it
  levels: { isReached: boolean; level: number; rewards: { label: string }[] }[];
  // The label of the button that offers the collected Oculi
  offerLabel: string;
  // The title the game shows at the top left
  title: string;
}

const { collectedCount, level, levels, offerLabel, title } = defineProps<Props>();
const emit = defineEmits<{ close: []; offer: [] }>();
</script>

<template>
  <!-- The layout is provisional until the recording of the Worship Statue screen shows it -->
  <div class="worship-screen">
    <h1 class="title">{{ title }}</h1>
    <button class="close" type="button" @click="emit('close')">×</button>
    <p class="level">{{ level }}</p>
    <p class="collected">{{ collectedCount }}</p>
    <button class="offer" type="button" @click="emit('offer')">{{ offerLabel }}</button>
    <ol class="levels">
      <li v-for="row in levels" :key="row.level" :class="{ reached: row.isReached }">
        <span class="number">{{ row.level }}</span>
        <span v-for="reward in row.rewards" :key="reward.label" class="reward">{{ reward.label }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
/* The screen's colours and placement are provisional until the recording shows them */
.worship-screen {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgb(20 18 16 / 55%);
  color: rgb(245 240 230);
}

.title {
  position: absolute;
  top: 6%;
  left: 6%;
  font-size: 2rem;
}

.close {
  position: absolute;
  top: 6%;
  right: 6%;
  font-size: 2rem;
}

.level {
  position: absolute;
  top: 16%;
  left: 6%;
  font-size: 1.25rem;
}

.collected {
  position: absolute;
  top: 22%;
  left: 6%;
  font-size: 1.25rem;
}

.offer {
  position: absolute;
  top: 16%;
  right: 6%;
  padding: 0.5rem 1rem;
  background: rgb(255 255 255 / 8%);
}

.levels {
  position: absolute;
  top: 32%;
  left: 6%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.levels li {
  display: flex;
  gap: 1.5rem;
  opacity: 0.5;
}

.levels li.reached {
  opacity: 1;
}
</style>
