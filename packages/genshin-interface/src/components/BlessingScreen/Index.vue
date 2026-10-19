<script setup lang="ts">
interface Props {
  // The members of the deployed team, each named in the reader's language with the share of its Max HP it holds
  members: { healthShare: number; id: number; name: string }[];
  // The Restorative Power the pool holds now, and the most it holds
  poolAmount: number;
  poolMaximum: number;
  // The title the game shows at the top left, and the title of the Worship screen the screen switches to
  title: string;
  worshipTitle: string;
}

const { members, poolAmount, poolMaximum, title, worshipTitle } = defineProps<Props>();
const emit = defineEmits<{ close: []; heal: [characterId: number]; worship: [] }>();
</script>

<template>
  <!-- The layout is provisional until the recording of the Blessing screen shows it -->
  <div class="blessing-screen">
    <h1 class="title">{{ title }}</h1>
    <button class="close" type="button" @click="emit('close')">×</button>
    <button class="worship" type="button" @click="emit('worship')">{{ worshipTitle }}</button>
    <p class="pool">{{ Math.floor(poolAmount) }} / {{ poolMaximum }}</p>
    <ul class="members">
      <li v-for="{ healthShare, id, name } of members" :key="id">
        <button type="button" @click="emit('heal', id)">
          <span class="name">{{ name }}</span>
          <span class="health">{{ Math.round(healthShare * 100) }}%</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.members button {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  min-width: 16rem;
  padding: 0.5rem 1rem;
  background: rgb(255 255 255 / 8%);
}
</style>

<style scoped src="../../styles/blessingWorship.css"></style>
