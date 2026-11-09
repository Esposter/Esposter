<script setup lang="ts">
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // Whether the player holds no namecard to pick from, which draws the button disabled
  isDisabled: boolean;
  // The equipped namecard's name, which the button reads; none while the player has no namecard equipped
  namecardName?: string;
}

defineProps<Props>();
const emit = defineEmits<{ open: [] }>();
</script>

<template>
  <GameButton class="namecard" :disabled="isDisabled" :kind="GameButtonKind.Plain" tip="" @click="emit('open')">
    {{ namecardName }}
  </GameButton>
</template>

<style scoped>
/* Provisional: the namecard's button takes the signature line's place, drawn when a namecard is equipped */
.namecard {
  position: absolute;
  top: calc(var(--unit) * 105);
  left: calc(var(--unit) * 331);
  width: calc(var(--unit) * 300);
  color: #e2e8ed;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  text-align: left;
}
</style>
