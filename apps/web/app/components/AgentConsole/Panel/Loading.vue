<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

import { ThemeMode } from "@/models/ui/ThemeMode";

interface Props {
  loadingSteps: LoadingStep[];
}

const { loadingSteps } = defineProps<Props>();
// A game's loading screen, on the cream the game's own is: the name, a row of gems lighting one by one, and what is
// Loading beneath it
const percentage = computed(() =>
  Math.round((loadingSteps.filter(({ isDone }) => isDone).length / loadingSteps.length) * 100),
);
const currentStep = computed(() => loadingSteps.find(({ isDone }) => !isDone));
</script>

<template>
  <UiThemeScope
    :theme="ThemeMode.Light"
    bg-background
    text-text
    flex
    flex-col
    gap-6
    items-center
    inset-0
    justify-center
    absolute
    z-1
  >
    <h1 ui-title>Genshin</h1>
    <UiLoadingBar label="Loading the console" :value="percentage" />
    <p role="status" text-muted>
      <UiSpinner v-if="currentStep" />
      {{ currentStep ? `${currentStep.title}…` : "Ready" }} {{ percentage }}%
    </p>
  </UiThemeScope>
</template>
