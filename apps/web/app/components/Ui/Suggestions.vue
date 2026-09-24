<script setup lang="ts" generic="T extends string">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY } from "@/services/ui/constants";
import { usePopover, useVirtualFocus } from "@vuetify/v0";

interface Props {
  // The text field the suggestions complete. It keeps focus while they are walked, as a combobox's input does, and
  // Names the highlighted one as its active descendant
  field?: HTMLInputElement | HTMLTextAreaElement;
  items: UiMenuItem<T>[];
  label: string;
}

const { field, items, label } = defineProps<Props>();
const emit = defineEmits<{ select: [value: T] }>();
const content = useTemplateRef("content");
const { focused: isFocused } = useFocus(toRef(() => field));
// Escape or a choice puts the suggestions away until the next keystroke in the field. Otherwise the field's focus and
// What it holds decide whether they show, and nothing light-dismisses them: a click back into the field lands outside
// The popover, and would close what the field is still offering
const isDismissed = ref(false);
const isOpen = ref(false);
const { anchorStyles, attach, attachAnchor, contentAttrs, contentStyles, id } = usePopover({
  isOpen,
  positionArea: POPOVER_POSITION_AREA,
  positionTry: POPOVER_POSITION_TRY,
});
const getOptionId = (index: number) => `${id}-option-${index}`;
const { clear, highlightedId, next, prev } = useVirtualFocus(
  () => items.map(({ value }, index) => ({ el: () => window.document.getElementById(getOptionId(index)), id: value })),
  { circular: true, control: () => field, orientation: "vertical", target: () => undefined },
);
const choose = (value: T) => {
  isDismissed.value = true;
  emit("select", value);
};

attachAnchor(() => field);
attach(content);

watchEffect(() => {
  isOpen.value = isFocused.value && items.length > 0 && !isDismissed.value;
});

watch(isOpen, () => {
  clear();
});

watchEffect(() => {
  if (!field) return;
  field.setAttribute("aria-autocomplete", "list");
  field.setAttribute("aria-controls", id);
  field.style.setProperty("anchor-name", anchorStyles.value.anchorName ?? "");
});

useEventListener(
  () => field,
  "input",
  () => {
    isDismissed.value = false;
  },
);
// In the capture phase, so the suggestions see a key before the field's own handler does. A key they take arrives
// There prevented — a field that acts on Enter itself skips a prevented one — and Escape never reaches the page
useEventListener(
  () => field,
  "keydown",
  (event: KeyboardEvent) => {
    if (!isOpen.value) return;
    const highlightedItem = items.find(({ value }) => value === highlightedId.value);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (event.key === "ArrowDown") next();
      else prev();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      isDismissed.value = true;
    } else if ((event.key === "Enter" || event.key === "Tab") && highlightedItem) {
      event.preventDefault();
      choose(highlightedItem.value);
    }
  },
  { capture: true },
);
</script>

<template>
  <div
    ref="content"
    v-bind="contentAttrs"
    :aria-label="label"
    popover="manual"
    role="listbox"
    :style="contentStyles"
    ui-popover
  >
    <div role="none" max-h="[40dvh]" py-1 flex flex-col of-y-auto ui-frame>
      <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -- focus stays in the field, which names the highlighted option as its active descendant -->
      <div
        v-for="({ description, title, value }, index) of items"
        :id="getOptionId(index)"
        :key="value"
        :aria-selected="value === highlightedId"
        role="option"
        ui-item
        @click="choose(value)"
        @mousedown.prevent
      >
        {{ title }} <span v-if="description" text-muted>{{ description }}</span>
      </div>
    </div>
  </div>
</template>
