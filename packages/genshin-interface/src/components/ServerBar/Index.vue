<script setup lang="ts">
import { SERVER_MARK_DIAMOND_PATH, SERVER_MARK_TICK_PATH } from "#src/services/ServerMarkPath";

interface Props {
  // The server the account plays on, as the game names it ("Asia", "Europe")
  name: string;
}

const { name } = defineProps<Props>();
</script>

<template>
  <!-- The bar naming the chosen server, 456 by 75 units: a dark glass slab with a faint rim, the ticked diamond at its
       Left and the server's name at its middle, measured from the English client's login screen at 1080 high -->
  <div class="server-bar">
    <svg class="mark" viewBox="0 0 46 46" aria-hidden="true">
      <path class="diamond" :d="SERVER_MARK_DIAMOND_PATH" />
      <path class="tick" :d="SERVER_MARK_TICK_PATH" />
    </svg>
    <p class="name">{{ name }}</p>
  </div>
</template>

<style scoped>
.server-bar {
  position: relative;
  display: grid;
  width: calc(var(--unit) * 456);
  height: calc(var(--unit) * 75);
  box-sizing: border-box;
  border: calc(var(--unit) * 1.5) solid rgb(120 124 130 / 0.6);
  background: rgb(42 45 52 / 0.74);
  place-items: center;
}

.mark {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 20);
  width: calc(var(--unit) * 46);
  height: calc(var(--unit) * 46);
  translate: 0 -50%;
}

.diamond {
  fill: #e4e0d4;
}

.tick {
  fill: #1c1c1c;
}

.name {
  margin: 0;
  color: #d4d4d4;
  font-size: calc(var(--unit) * 33);
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1;
}
</style>
