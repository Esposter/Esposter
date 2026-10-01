<script setup lang="ts">
import type { LoadingStep } from "@/models/agentConsole/LoadingStep";

import { GameLanguageTagMap } from "genshin-text";
import { GameOpening } from "genshin-world";

interface Props {
  loadingSteps: LoadingStep[];
}

const { loadingSteps } = defineProps<Props>();
const emit = defineEmits<{ finish: [] }>();
// The game's opening, which plays while the page loads behind it: its logos and health notice, then its startup screen,
// Whose row of marks darkens as the steps finish and fades once they have, then `finish` once its white has held. Its
// Words are the game's own in the reader's language, and none of them is what is loading, which is announced to a
// Screen reader alone
const progress = computed(() => loadingSteps.filter(({ isDone }) => isDone).length / loadingSteps.length);
const currentStep = computed(() => loadingSteps.find(({ isDone }) => !isDone));
const gameText = await useGameText();
</script>

<template>
  <div :lang="GameLanguageTagMap[gameText.language]" inset-0 absolute z-1>
    <GameOpening :game-text="gameText.text" :language="gameText.language" :progress @finish="emit('finish')" />
    <p role="status" lang="en" sr-only>{{ currentStep ? `${currentStep.title}…` : "Ready" }}</p>
  </div>
</template>
