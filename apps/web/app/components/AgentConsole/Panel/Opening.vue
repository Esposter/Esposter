<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

import { GameOpening } from "genshin-world";

interface Props {
  loadingSteps: LoadingStep[];
}

const { loadingSteps } = defineProps<Props>();
const emit = defineEmits<{ finish: [] }>();
// The game's opening, which plays while the page loads behind it: its logos and health notice, then its startup screen,
// Whose row of marks darkens as the steps finish and fades once they have, then `finish` once its white has held. It
// Shows no words, so what is loading is announced to a screen reader alone
const progress = computed(() => loadingSteps.filter(({ isDone }) => isDone).length / loadingSteps.length);
const currentStep = computed(() => loadingSteps.find(({ isDone }) => !isDone));
</script>

<template>
  <div inset-0 absolute z-1>
    <GameOpening :progress @finish="emit('finish')" />
    <p role="status" sr-only>{{ currentStep ? `${currentStep.title}…` : "Ready" }}</p>
  </div>
</template>
