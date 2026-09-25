<script setup lang="ts">
import type { UiCommand } from "@/models/ui/UiCommand";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useVirtualFocus } from "@vuetify/v0";

interface Props {
  commands: UiCommand[];
  label: string;
  placeholder: string;
}
// A search field over the commands it finds, as the combobox pattern has it with its list always shown: focus stays in
// The field while the arrows walk the list, and the first command is highlighted whenever the list changes, so Enter
// Always takes the best match. A command with somewhere to go is a real link, and Enter clicks the highlighted row,
// So the keyboard and the pointer reach it the one way
defineSlots<{ append?: () => VNode; prepend?: () => VNode }>();
const query = defineModel<string>("query", { required: true });
const { commands, label, placeholder } = defineProps<Props>();
const emit = defineEmits<{ select: [command: UiCommand] }>();
const field = useTemplateRef("field");
const listboxId = useId();
const getOptionId = (index: number) => `${listboxId}-option-${index}`;
const { clear, first, highlightedId, next, prev } = useVirtualFocus(
  () => commands.map(({ id }, index) => ({ el: () => window.document.getElementById(getOptionId(index)), id })),
  { circular: true, control: field, orientation: "vertical", target: () => undefined },
);
const NuxtInvisibleLink = resolveComponent("NuxtInvisibleLink");
// Only a group's first command carries its heading
const checkIsGroupStart = (index: number) => commands[index - 1]?.group !== commands[index]?.group;
const highlightFirst = () => {
  if (commands.length > 0) first();
  else clear();
};
const clickHighlighted = () => {
  const index = commands.findIndex(({ id }) => id === highlightedId.value);
  if (index === -1) return;
  window.document.getElementById(getOptionId(index))?.click();
};
// Once its rows are drawn: an option that is not in the document yet cannot be highlighted
onMounted(() => {
  highlightFirst();
});

watch(
  () => commands,
  () => {
    highlightFirst();
  },
  { flush: "post" },
);
</script>

<template>
  <div flex flex-col min-h-0>
    <div p-2 flex gap-2 items-center>
      <slot name="prepend" />
      <input
        ref="field"
        v-model="query"
        :aria-controls="listboxId"
        :aria-label="label"
        aria-autocomplete="list"
        aria-expanded="true"
        :placeholder
        role="combobox"
        type="search"
        px-4
        flex-1
        h-10
        min-w-0
        ui-field
        ui-pill
        @keydown.down.prevent="next()"
        @keydown.up.prevent="prev()"
        @keydown.enter.prevent="!$event.isComposing && clickHighlighted()"
      />
    </div>
    <div :id="listboxId" :aria-label="label" role="listbox" pb-2 flex flex-col of-y-auto>
      <template v-for="(command, index) of commands" :key="command.id">
        <div v-if="checkIsGroupStart(index)" role="presentation" text-sm text-muted px-3 pt-2>{{ command.group }}</div>
        <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- focus stays in the field, which names the highlighted option as its active descendant -->
        <component
          :is="command.to ? NuxtInvisibleLink : 'div'"
          :id="getOptionId(index)"
          :="command.to ? { to: command.to } : {}"
          :aria-selected="command.id === highlightedId"
          role="option"
          ui-item
          @click="emit('select', command)"
          @mousedown.prevent
        >
          <UiItemContent
            :description="command.description"
            :icon="command.icon"
            :image="command.image"
            :meaning="command.meaning"
            :shortcut="command.shortcut"
            :title="command.title"
          >
            <template v-if="command.isSelected" #append>
              <UiIcon :meaning="UiIconMeaning.Selected" label="Chosen" text-accent />
            </template>
          </UiItemContent>
        </component>
      </template>
      <slot name="append" />
    </div>
  </div>
</template>
