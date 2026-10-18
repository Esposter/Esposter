<script setup lang="ts">
interface Props {
  // The members of the deployed team, each named in the reader's language with the share of its Max HP it holds
  members: { healthShare: number; id: number; name: string }[];
  // The Restorative Power the pool holds now, and the most it holds
  poolAmount: number;
  poolMaximum: number;
  // The title the game shows at the top left
  title: string;
}

const { members, poolAmount, poolMaximum, title } = defineProps<Props>();
const emit = defineEmits<{ close: []; heal: [characterId: number] }>();
</script>

<template>
  <!-- The layout is provisional until the recording of the Blessing screen shows it -->
  <div class="blessing-screen">
    <h1 class="title">{{ title }}</h1>
    <button class="close" type="button" @click="emit('close')">×</button>
    <p class="pool">{{ Math.floor(poolAmount) }} / {{ poolMaximum }}</p>
    <ul class="members">
      <li v-for="member in members" :key="member.id">
        <button type="button" @click="emit('heal', member.id)">
          <span class="name">{{ member.name }}</span>
          <span class="health">{{ Math.round(member.healthShare * 100) }}%</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* The screen's colours and placement are provisional until the recording shows them */
.blessing-screen {
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

.pool {
  position: absolute;
  top: 16%;
  left: 6%;
  font-size: 1.25rem;
}

.members {
  position: absolute;
  top: 26%;
  left: 6%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.members button {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  min-width: 16rem;
  padding: 0.5rem 1rem;
  background: rgb(255 255 255 / 8%);
}
</style>
