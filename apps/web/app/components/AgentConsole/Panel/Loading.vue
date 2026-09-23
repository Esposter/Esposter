<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

import { LOADING_BAR_BLOCK_COUNT } from "@/services/agentConsole/constants";

interface Props {
  loadingSteps: LoadingStep[];
}

const { loadingSteps } = defineProps<Props>();
const doneShare = computed(() => loadingSteps.filter(({ isDone }) => isDone).length / loadingSteps.length);
const percentage = computed(() => Math.round(doneShare.value * 100));
const filledBlockCount = computed(() => Math.round(doneShare.value * LOADING_BAR_BLOCK_COUNT));
const currentStep = computed(() => loadingSteps.find(({ isDone }) => !isDone));
</script>

<template>
  <!-- A game's loading screen: what is loading, and how much of it is done -->
  <div class="loading" flex flex-col gap-4 items-center inset-0 justify-center absolute>
    <h1>Agent console</h1>
    <div
      aria-label="Loading the console"
      :aria-valuenow="percentage"
      aria-valuemax="100"
      aria-valuemin="0"
      role="progressbar"
      flex
      gap-1
    >
      <span
        v-for="index of LOADING_BAR_BLOCK_COUNT"
        :key="index"
        class="block"
        :class="{ filled: index <= filledBlockCount }"
      />
    </div>
    <p role="status">
      <AgentConsolePanelSpinner v-if="currentStep" />
      {{ currentStep ? `${currentStep.title}…` : "Ready" }} {{ percentage }}%
    </p>
  </div>
</template>

<style scoped>
.loading {
  background-color: var(--agent-console-background);
  z-index: 1;
}

.block {
  background-color: var(--agent-console-panel);
  box-shadow: inset 0 -0.125rem 0 0 var(--agent-console-panel-edge);
  height: 1.5rem;
  width: 1rem;
}

.block.filled {
  background-color: var(--agent-console-accent);
}
</style>
