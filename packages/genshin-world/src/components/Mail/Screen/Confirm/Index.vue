<script setup lang="ts">
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The way out of the dialog, which leaves the mail where it is, in the reader's language
  cancelLabel: string;
  // The button that does what the dialog asks, in the reader's language
  confirmLabel: string;
  // Whether the dialog is the Gift Mail Box's warning, which sits in the mail's detail rather than over the screen
  isGift?: true;
  // The text the dialog asks the player to read before it acts, in the reader's language
  text: string;
  // The line over the text, which the Gift Mail Box's warning has and the Delete Read dialog does not, "" for none
  title: string;
}

const { cancelLabel, confirmLabel, isGift, text, title } = defineProps<Props>();
const emit = defineEmits<{ cancel: []; confirm: [] }>();
</script>

<template>
  <!-- The dialog a delete asks first, with its way out and the button that does it. Delete Read's sits over the screen, and
       the Gift Mail Box's warning in the mail's detail -->
  <section :class="isGift ? 'confirm-gift' : 'confirm'" role="dialog">
    <p v-if="title" class="confirm-title">{{ title }}</p>
    <p class="confirm-text">{{ text }}</p>
    <GameButton class="cancel" :kind="GameButtonKind.Pill" tip="" @click="emit('cancel')">
      {{ cancelLabel }}
    </GameButton>
    <GameButton class="confirm-button" :kind="GameButtonKind.Pill" tip="" @click="emit('confirm')">
      {{ confirmLabel }}
    </GameButton>
  </section>
</template>

<style scoped>
.confirm-gift {
  margin-top: calc(var(--unit) * 24);
}

.confirm-title {
  margin: 0 0 calc(var(--unit) * 12);
  font-size: calc(var(--unit) * 30);
}
</style>

<style scoped src="genshin-interface/styles/confirmDialog.css"></style>

<style scoped src="../../../../styles/mailScreen.css"></style>
