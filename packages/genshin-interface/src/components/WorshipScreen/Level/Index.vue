<script setup lang="ts">
interface Props {
  // Whether the claim is held back from this level, which only the next claimable one takes
  isDisabled: boolean;
  // The level's number, shown first on the button
  level: number;
  // The Oculi the level takes
  oculusCount: number;
  // The rewards the level pays, each by its name and its count
  rewards: { count: number; name: string }[];
}

const { isDisabled, level, oculusCount, rewards } = defineProps<Props>();
const emit = defineEmits<{ claim: [] }>();
</script>

<template>
  <button type="button" :disabled="isDisabled" @click="emit('claim')">
    <span class="level">{{ level }}</span>
    <span class="oculi">{{ oculusCount }}</span>
    <span class="rewards">
      <span v-for="{ count, name } of rewards" :key="name">{{ name }} × {{ count }}</span>
    </span>
  </button>
</template>
