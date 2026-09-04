<script setup lang="ts">
import { getVoteDescription } from "@/services/message/poll/getVoteDescription";

interface Props {
  id: string;
  label: string;
  totalVoteCount: number;
  voteCount: number;
}

const { id, label, totalVoteCount, voteCount } = defineProps<Props>();
const votePercentage = computed(() => (totalVoteCount > 0 ? Math.round((voteCount / totalVoteCount) * 100) : 0));
const voteDescription = computed(() => getVoteDescription(voteCount));
</script>

<template>
  <v-radio :value="id">
    <template #label>
      <div flex w-full>
        <div flex-1>{{ label }}</div>
        <div text-hint>{{ voteDescription }} · {{ votePercentage }}%</div>
      </div>
    </template>
  </v-radio>
  <v-progress-linear :model-value="votePercentage" color="primary" mb-3 />
</template>
