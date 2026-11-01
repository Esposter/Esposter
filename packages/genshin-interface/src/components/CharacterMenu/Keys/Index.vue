<script setup lang="ts">
import { GAME_WHITE } from "#src/services/constants";
</script>

<template>
  <div class="tab-keys" aria-hidden="true">
    <kbd class="key">W</kbd>
    <kbd class="key">S</kbd>
  </div>
  <div class="character-keys" aria-hidden="true">
    <kbd class="key key-previous">Q</kbd>
    <kbd class="key key-next">E</kbd>
  </div>
</template>

<style scoped>
/* The keys stepping through the tabs: white caps 30.75 by 25 units with dark letters, an arrow over the W and under the
   S, centred 148.9 units in from the frame's left */
.tab-keys {
  position: absolute;
  top: calc(var(--unit) * 126.75);
  left: calc(var(--unit) * 133.5);
  display: flex;
  width: calc(var(--unit) * 30.75);
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 3.5);
}

.tab-keys .key {
  width: 100%;
  height: calc(var(--unit) * 25);
}

/* The character keys' caps 32.25 by 27 units, the Q's on the row's left and the E's over its right end */
.character-keys .key {
  position: absolute;
  top: calc(var(--unit) * 34.5);
  width: calc(var(--unit) * 32.25);
  height: calc(var(--unit) * 27);
}

.key-previous {
  left: calc(var(--unit) * 549);
}

.key-next {
  left: calc(var(--unit) * 1999);
}

.tab-keys::before,
.tab-keys::after {
  width: calc(var(--unit) * 11.25);
  height: calc(var(--unit) * 6);
  background: v-bind(GAME_WHITE);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: "";
}

.tab-keys::after {
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.key {
  display: grid;
  border-radius: calc(var(--unit) * 3);
  background: v-bind(GAME_WHITE);
  color: #2b2b2b;
  font: inherit;
  font-size: calc(var(--unit) * 20.5);
  font-weight: 600;
  line-height: 1;
  place-items: center;
}
</style>
