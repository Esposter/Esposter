<script setup lang="ts">
import { Switch } from "@vuetify/v0";

interface Props {
  // The label drawn beside the switch; a switch in a row that already names it is named by its label alone
  isLabelShown?: true;
  // Its accessible name, and the text beside the switch where it is shown
  label: string;
}

// A setting that takes effect the moment it flips: a thumb in the muted colour on a field's track, which slides to the
// Far end while it is on, where the track fills with the accent and the thumb takes the background colour, as Material's
// Switch does. Round in standard and square in voxel, by the pill radius. What a call site passes goes to the element,
// Which is the switch itself
defineOptions({ inheritAttrs: false });
const modelValue = defineModel<boolean>({ required: true });
const { isLabelShown, label } = defineProps<Props>();
</script>

<template>
  <Switch.Root #default="{ attrs }" v-model="modelValue" :label renderless>
    <button :="{ ...attrs, ...$attrs }" type="button" flex gap-2 cursor-pointer items-center>
      <span class="track" :data-state="attrs['data-state']" p-1 flex shrink-0 h-6 w-11 ui-field ui-pill>
        <span class="thumb" :data-state="attrs['data-state']" size-4 />
      </span>
      <span v-if="isLabelShown">{{ label }}</span>
    </button>
  </Switch.Root>
</template>

<style scoped>
/* The thumb slides to the far end of its track, rather than jumping there, and the track fills behind it */
.track {
  transition: background-color var(--ui-motion-short);
}

.track[data-state="checked"] {
  background-color: var(--ui-accent);
}

.thumb {
  background-color: var(--ui-muted);
  border-radius: var(--ui-pill-radius);
  box-shadow: var(--ui-raised-shadow);
  transition:
    translate var(--ui-motion-short),
    background-color var(--ui-motion-short);
}

.thumb[data-state="checked"] {
  background-color: var(--ui-background);
  translate: calc(var(--ui-step) * 5) 0;
}
</style>
