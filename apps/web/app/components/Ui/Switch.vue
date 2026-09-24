<script setup lang="ts">
import { Switch } from "@vuetify/v0";

interface Props {
  // The label drawn beside the switch; a switch in a row that already names it is named by its label alone
  isLabelShown?: true;
  // Its accessible name, and the text beside the switch where it is shown
  label: string;
}

// A setting that takes effect the moment it flips: a sunk track with a raised block that slides to its far end and
// Takes the accent while it is on. What a call site passes goes to the element, which is the switch itself
defineOptions({ inheritAttrs: false });
const modelValue = defineModel<boolean>({ required: true });
const { isLabelShown, label } = defineProps<Props>();
</script>

<template>
  <Switch.Root #default="{ attrs }" v-model="modelValue" :label renderless>
    <button v-bind="{ ...attrs, ...$attrs }" type="button" flex gap-2 cursor-pointer items-center>
      <span p-1 flex shrink-0 h-6 w-11 ui-sunk>
        <span class="thumb" :data-state="attrs['data-state']" size-4 ui-raised />
      </span>
      <span v-if="isLabelShown">{{ label }}</span>
    </button>
  </Switch.Root>
</template>

<style scoped>
/* The block slides to the far end of its track and lights up, rather than jumping there */
.thumb {
  transition:
    translate var(--ui-motion-short),
    background-color var(--ui-motion-short);
}

.thumb[data-state="checked"] {
  background-color: var(--ui-accent);
  translate: calc(var(--ui-step) * 5) 0;
}
</style>
