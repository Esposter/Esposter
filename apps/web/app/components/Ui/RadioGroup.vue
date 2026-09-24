<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { Radio } from "@vuetify/v0";

interface Props {
  // While an answer is already on its way, as a poll's vote is
  isDisabled?: boolean;
  items: Pick<UiMenuItem<T>, "description" | "title" | "value">[];
  // The group's accessible name: what its options choose between
  label: string;
}

// One answer out of a list, each a row of its own with a line saying more under its title, where a toggle group is a
// Few short segments on one track. A radio group, so it is one stop in the tab order and the arrows move the choice
// Along it. What goes under an option's title, such as a poll's tally, fills the append slot
defineSlots<{ append?: (props: { value: T }) => VNode }>();
const modelValue = defineModel<T>();
const { isDisabled = false, items, label } = defineProps<Props>();
const id = useId();
</script>

<template>
  <Radio.Group
    #default="{ attrs }"
    :model-value
    :disabled="isDisabled"
    :label
    renderless
    @update:model-value="
      (value) => {
        if (value !== undefined) modelValue = value;
      }
    "
  >
    <div :="attrs" flex flex-col>
      <Radio.Root
        v-for="({ description, title, value }, index) of items"
        #default="{ attrs: itemAttrs }"
        :key="value"
        :aria-describedby="description ? `${id}-${index}` : undefined"
        :label="title"
        :value
        renderless
      >
        <button :="itemAttrs" class="aria-disabled:cursor-default aria-disabled:op-disabled" type="button" ui-item>
          <span p-1 flex shrink-0 size-6 ui-field ui-pill>
            <span class="mark" :data-state="itemAttrs['data-state']" flex-1 />
          </span>
          <span flex flex-1 flex-col min-w-0>
            {{ title }}
            <span v-if="description" :id="`${id}-${index}`" text-muted>{{ description }}</span>
            <slot name="append" :value />
          </span>
        </button>
      </Radio.Root>
    </div>
  </Radio.Group>
</template>

<style scoped>
/* The chosen option's mark fills from its centre with the accent, round in standard and square in voxel */
.mark {
  background-color: var(--ui-accent);
  border-radius: var(--ui-pill-radius);
  transform: scale(0);
  transition: transform var(--ui-motion-short);
}

.mark[data-state="checked"] {
  transform: none;
}
</style>
