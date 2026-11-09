<script setup lang="ts">
import DiscButton from "#src/components/DiscButton/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";

interface Props {
  // The close button's name for assistive tech, the game's "Back" line
  closeLabel: string;
  // The coins the wallet holds
  coins: number;
  // The title the game shows over the screen
  title: string;
}

defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <header class="head">
    <ScreenTitle class="heading" role="heading" aria-level="1">{{ title }}</ScreenTitle>
    <p class="coins">
      <span class="coin" aria-hidden="true" />
      {{ coins }}
    </p>
    <DiscButton class="close" :label="closeLabel" :size="56" @click="emit('close')">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6 18 18M18 6 6 18" />
      </svg>
    </DiscButton>
  </header>
</template>

<style scoped>
.head {
  position: absolute;
  inset: 0 0 auto;
  height: calc(var(--unit) * 95);
  background: #161c31;
}

.heading {
  line-height: calc(var(--unit) * 32);
}

.coins {
  position: absolute;
  top: calc(var(--unit) * 34);
  left: calc(var(--unit) * 1650);
  margin: 0;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
}

.coin {
  position: absolute;
  top: calc(var(--unit) * 4);
  left: calc(var(--unit) * -30);
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 20);
  border-radius: 50%;
  background: #e6b84a;
}

.close {
  position: absolute;
  top: calc(var(--unit) * 18);
  left: calc(var(--unit) * 1828);
}

.close svg {
  width: calc(var(--unit) * 24);
  height: calc(var(--unit) * 24);
  fill: none;
  stroke: #212121;
  stroke-linecap: round;
  stroke-width: 3;
}
</style>
