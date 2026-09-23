<script setup lang="ts" generic="T extends string">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { useTypeahead } from "@/composables/ui/useTypeahead";
import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY } from "@/services/ui/constants";
import { takeOne } from "@esposter/shared";
import { usePopover, useRovingFocus } from "@vuetify/v0";
import { mergeProps } from "vue";

interface Props {
  items: UiMenuItem<T>[];
  // The menu's accessible name, and its trigger's, since a trigger may show no more than a mark
  label: string;
  positionArea?: string;
  variant?: UiButtonVariant;
}

// A trigger and the menu it opens are two elements, so what a call site passes goes to the trigger. The trigger opens
// The menu natively through its popover target, so a click on it while the menu is open closes it rather than
// Light-dismissing it and opening it again
defineOptions({ inheritAttrs: false });
defineSlots<{ default: () => VNode }>();
const { items, label, positionArea = POPOVER_POSITION_AREA, variant } = defineProps<Props>();
const emit = defineEmits<{ select: [value: T] }>();
const trigger = useTemplateRef("trigger");
const content = useTemplateRef("content");
const triggerElement = computed(() => trigger.value?.element);
const { anchorStyles, attach, attachAnchor, close, contentAttrs, contentStyles, id, isOpen, open } = usePopover({
  positionArea,
  positionTry: POPOVER_POSITION_TRY,
});
const getItemId = (index: number) => `${id}-item-${index}`;
const { first, focus, focusedId, isTabbable, last, onKeydown } = useRovingFocus(
  () => items.map(({ value }, index) => ({ el: () => window.document.getElementById(getItemId(index)), id: value })),
  { circular: true, orientation: "vertical" },
);
const typeahead = useTypeahead();
// The end of the menu that takes focus as it opens: the first item, or the last when the up arrow opened it
let isOpeningAtEnd = false;
const openAtEnd = () => {
  isOpeningAtEnd = true;
  open();
};
const choose = (value: T) => {
  emit("select", value);
  close();
  triggerElement.value?.focus();
};
const onMenuKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
    triggerElement.value?.focus();
  } else if (event.key === "Tab") close();
  else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const focusedItem = items.find(({ value }) => value === focusedId.value);
    if (focusedItem) choose(focusedItem.value);
  } else {
    const index = typeahead(
      event,
      items.map(({ title }) => title),
      items.findIndex(({ value }) => value === focusedId.value),
    );
    if (index === undefined) onKeydown(event);
    else focus(takeOne(items, index).value);
  }
};

attachAnchor(triggerElement);
attach(content);

watch(isOpen, (newIsOpen) => {
  if (!newIsOpen) return;
  if (isOpeningAtEnd) last();
  else first();
  isOpeningAtEnd = false;
});
</script>

<template>
  <UiTooltip #default="{ activatorProps }" :disabled="isOpen" :label>
    <UiButton
      ref="trigger"
      :="mergeProps(activatorProps, $attrs)"
      :aria-controls="id"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      :aria-label="label"
      :popovertarget="id"
      :style="{ anchorName: [anchorStyles.anchorName, activatorProps.style.anchorName].join(', ') }"
      :variant
      @keydown.down.prevent="open()"
      @keydown.up.prevent="openAtEnd()"
    >
      <slot />
    </UiButton>
  </UiTooltip>
  <div
    ref="content"
    v-bind="contentAttrs"
    :aria-label="label"
    :style="contentStyles"
    role="menu"
    tabindex="-1"
    ui-popover
    @keydown="onMenuKeydown"
  >
    <div role="none" max-h="[40dvh]" py-1 flex flex-col of-y-auto ui-frame>
      <button
        v-for="({ description, icon, title, value }, index) of items"
        :id="getItemId(index)"
        :key="value"
        role="menuitem"
        :tabindex="isTabbable(value) ? 0 : -1"
        type="button"
        ui-item
        @click="choose(value)"
      >
        <span v-if="icon" :class="icon" aria-hidden="true" mr-2 align-middle size-5 inline-block />{{ title }}
        <span v-if="description" text-muted>{{ description }}</span>
      </button>
    </div>
  </div>
</template>
