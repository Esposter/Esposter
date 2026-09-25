<script setup lang="ts">
import { Checkbox } from "@vuetify/v0";

interface Props {
  // The label drawn beside the box; a box in a row of a table is named by its label alone
  isLabelShown?: true;
  // Some of what it stands for is checked and some is not, as a select-all over part of a list
  isMixed?: boolean;
  // Its accessible name, and the text beside the box where it is shown
  label: string;
}

// A box in the page's face that a block of the accent drops into while it is checked, and half a block while it is
// Mixed. What a call site passes goes to the element, which is the checkbox itself
defineOptions({ inheritAttrs: false });
const modelValue = defineModel<boolean>({ required: true });
const { isLabelShown, isMixed = false, label } = defineProps<Props>();
</script>

<template>
  <Checkbox.Root #default="{ attrs }" v-model="modelValue" :indeterminate="isMixed" :label renderless>
    <button :="{ ...attrs, ...$attrs }" type="button" flex gap-2 cursor-pointer items-center>
      <span p-1 flex shrink-0 size-6 ui-field>
        <span class="mark" :data-state="attrs['data-state']" flex-1 />
      </span>
      <span v-if="isLabelShown">{{ label }}</span>
    </button>
  </Checkbox.Root>
</template>

<style scoped>
/* The block drops in from above, and a mixed box holds half of one */
.mark {
  background-color: var(--ui-accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform var(--ui-motion-short);
}

.mark[data-state="checked"] {
  transform: none;
}

.mark[data-state="indeterminate"] {
  transform: scaleY(0.5);
}
</style>
