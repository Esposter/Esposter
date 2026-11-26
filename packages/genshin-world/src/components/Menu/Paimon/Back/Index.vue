<script setup lang="ts">
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The name Back is labelled by for assistive technology, in the reader's language
  label: string;
}

defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const backButton = useTemplateRef("backButton");

// The menu's focus starts on Back when it opens, so the button is reached through this
defineExpose({ focusBack: () => backButton.value?.focus() });
</script>

<template>
  <GameButton
    ref="backButton"
    class="back"
    :aria-label="label"
    :kind="GameButtonKind.Plain"
    tip=""
    @click="emit('close')"
  />
</template>

<style scoped>
/* Provisional: no recording shows Back hovered or pressed, so it is drawn with no state of its own */
.back {
  position: absolute;
  top: calc(var(--unit) * 19.5);
  left: calc(var(--unit) * 21);
  width: calc(var(--unit) * 61);
  height: calc(var(--unit) * 61);
  border-radius: 50%;
  background: #999a9b;
}

.back::after {
  content: "";
  position: absolute;
  inset: calc(var(--unit) * 6.3);
  border-radius: 50%;
  background: #ece5d7;
}
</style>
