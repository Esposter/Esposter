<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

import { StartupLoading } from "@esposter/genshin-world";

interface Props {
  loadingSteps: LoadingStep[];
}

const { loadingSteps } = defineProps<Props>();
// The game's own startup screen, its row of marks darkening as the steps finish; it shows no words, so what is
// Loading is announced to a screen reader alone
const progress = computed(() => loadingSteps.filter(({ isDone }) => isDone).length / loadingSteps.length);
const currentStep = computed(() => loadingSteps.find(({ isDone }) => !isDone));
</script>

<template>
  <div inset-0 absolute z-1>
    <StartupLoading :progress />
    <p role="status" sr-only>{{ currentStep ? `${currentStep.title}…` : "Ready" }}</p>
  </div>
</template>
