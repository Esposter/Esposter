<script setup lang="ts">
import { getVoteDescription } from "@/services/message/poll/getVoteDescription";

interface PollOptionProps {
  id: string;
  label: string;
  totalVotes: number;
  voteCount: number;
}

const { id, label, totalVotes, voteCount } = defineProps<PollOptionProps>();
const votePercentage = computed(() => (totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0));
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
