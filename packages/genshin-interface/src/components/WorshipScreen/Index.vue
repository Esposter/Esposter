<script setup lang="ts">
import { computed } from "vue";

interface Props {
  // The Oculi the region holds toward its next level, which an offer reaches the levels they complete with
  heldCount: number;
  // The region's levels, each with the Oculi it takes, the rewards it pays and its state on the Worship Statue
  levels: {
    level: number;
    oculusCount: number;
    rewards: { count: number; name: string }[];
    state: "claimable" | "claimed" | "locked";
  }[];
  // The title of the Statue's Blessing the screen switches to
  blessingTitle: string;
  // The title the game shows at the top left
  title: string;
}

const { blessingTitle, heldCount, levels, title } = defineProps<Props>();
const emit = defineEmits<{ blessing: []; claim: []; close: []; offer: [] }>();
// The one level a claim takes is the lowest reached and not yet claimed, since each claim takes the next level in turn
const nextClaimableLevel = computed(() => levels.find(({ state }) => state === "claimable")?.level);
</script>

<template>
  <!-- The layout is provisional until the recording of the Worship screen shows it -->
  <div class="worship-screen">
    <h1 class="title">{{ title }}</h1>
    <button class="close" type="button" @click="emit('close')">×</button>
    <button class="blessing" type="button" @click="emit('blessing')">{{ blessingTitle }}</button>
    <button class="held" type="button" @click="emit('offer')">{{ heldCount }}</button>
    <ol class="levels">
      <li v-for="{ level, oculusCount, rewards, state } of levels" :key="level" :class="state">
        <button type="button" :disabled="level !== nextClaimableLevel" @click="emit('claim')">
          <span class="level">{{ level }}</span>
          <span class="oculi">{{ oculusCount }}</span>
          <span class="rewards">
            <span v-for="{ count, name } of rewards" :key="name">{{ name }} × {{ count }}</span>
          </span>
        </button>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.levels button {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  min-width: 20rem;
  padding: 0.5rem 1rem;
  background: rgb(255 255 255 / 8%);
}

.levels button:disabled {
  opacity: 0.5;
}
</style>
<style scoped src="../../styles/blessingWorship.css"></style>
