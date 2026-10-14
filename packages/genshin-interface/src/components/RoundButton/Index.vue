<script setup lang="ts">
import DiscButton from "#src/components/DiscButton/Index.vue";
import { InterfaceIcon } from "#src/models/InterfaceIcon";
import { SETTINGS_RING_CENTRE, SETTINGS_RING_RADIUS, SETTINGS_RING_WIDTH } from "#src/services/constants";
import { InterfaceIconCentreMap } from "#src/services/InterfaceIconCentreMap";
import { InterfaceIconPathMap } from "#src/services/InterfaceIconPathMap";

interface Props {
  icon: InterfaceIcon;
  // What the button does, for a screen reader, since it shows a glyph alone
  label: string;
}

const { icon, label } = defineProps<Props>();
</script>

<template>
  <!-- The game's round button: a white disc 52 units across under a soft dark rim, its glyph in the game's near black
       Centred on its ink, as the game centres each icon's sprite -->
  <DiscButton :label :size="52">
    <svg
      class="glyph"
      :viewBox="`${InterfaceIconCentreMap[icon][0] - 24} ${InterfaceIconCentreMap[icon][1] - 24} 48 48`"
      aria-hidden="true"
    >
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
  </DiscButton>
</template>

<style scoped>
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
