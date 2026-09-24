<script setup lang="ts">
import { getVoteDescription } from "@/services/message/poll/getVoteDescription";

interface Props {
  label: string;
  totalVoteCount: number;
  voteCount: number;
}

const { label, totalVoteCount, voteCount } = defineProps<Props>();
const votePercentage = computed(() => (totalVoteCount > 0 ? Math.round((voteCount / totalVoteCount) * 100) : 0));
const voteDescription = computed(() => getVoteDescription(voteCount));
</script>

<!-- An answer's share of the votes, under the answer: the count in words and a bar filled to its share -->
<template>
  <span text-sm text-muted>{{ voteDescription }} · {{ votePercentage }}%</span>
  <UiLoadingBar :label="`${label}: ${votePercentage}% of votes`" :value="votePercentage" />
</template>
