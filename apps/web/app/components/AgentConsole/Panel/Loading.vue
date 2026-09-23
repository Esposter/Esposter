<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

interface Props {
  loadingSteps: LoadingStep[];
}

const { loadingSteps } = defineProps<Props>();
// A game's loading screen: what is loading, and how much of it is done
const percentage = computed(() =>
  Math.round((loadingSteps.filter(({ isDone }) => isDone).length / loadingSteps.length) * 100),
);
const currentStep = computed(() => loadingSteps.find(({ isDone }) => !isDone));
</script>

<template>
  <div bg-background flex flex-col gap-4 items-center inset-0 justify-center absolute z-1>
    <h1>Agent console</h1>
    <UiLoadingBar label="Loading the console" :value="percentage" />
    <p role="status">
      <UiSpinner v-if="currentStep" />
      {{ currentStep ? `${currentStep.title}…` : "Ready" }} {{ percentage }}%
    </p>
  </div>
</template>
