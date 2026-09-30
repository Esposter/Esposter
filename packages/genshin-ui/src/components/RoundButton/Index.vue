<script setup lang="ts">
import { InterfaceIcon } from "#src/models/InterfaceIcon";
import { SETTINGS_RING_CENTRE, SETTINGS_RING_RADIUS, SETTINGS_RING_WIDTH } from "#src/services/constants";
import { InterfaceIconPathMap } from "#src/services/InterfaceIconPathMap";

interface Props {
  icon: InterfaceIcon;
  // What the button does, for a screen reader, since it shows a glyph alone
  label: string;
}

const { icon, label } = defineProps<Props>();
</script>

<template>
  <!-- The game's round button: a white disc 52 units across under a soft dark rim, its glyph in the game's near black -->
  <button class="round-button" :aria-label="label" type="button">
    <svg class="glyph" viewBox="0 0 48 48" aria-hidden="true">
      <path :d="InterfaceIconPathMap[icon]" fill-rule="evenodd" />
      <circle
        v-if="icon === InterfaceIcon.Settings"
        :cx="SETTINGS_RING_CENTRE[0]"
        :cy="SETTINGS_RING_CENTRE[1]"
        :r="SETTINGS_RING_RADIUS"
        class="ring"
        :stroke-width="SETTINGS_RING_WIDTH"
      />
    </svg>
  </button>
</template>

<style scoped>
.round-button {
  display: grid;
  width: calc(var(--unit) * 52);
  height: calc(var(--unit) * 52);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #fdfdfd;
  box-shadow: 0 0 calc(var(--unit) * 3) calc(var(--unit) * 1) rgb(0 0 0 / 0.3);
  cursor: inherit;
  place-items: center;
}

.glyph {
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 48);
  fill: #212121;
}

.ring {
  fill: none;
  stroke: #858585;
}
</style>
