<script setup lang="ts" generic="T extends string">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { useMenu } from "@/composables/ui/useMenu";
import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY } from "@/services/ui/constants";
import { usePopover } from "@vuetify/v0";
import { mergeProps } from "vue";

interface Props {
  // The trigger's own text already reads the label, so no tooltip says it again: "Add filter"
  isLabelShown?: true;
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
// Written from outside too, and read by whatever must hold still while the menu is open, such as a hover bar
const isOpenModel = defineModel<boolean>("isOpen", { default: false });
const { isLabelShown, items, label, positionArea = POPOVER_POSITION_AREA, variant } = defineProps<Props>();
const emit = defineEmits<{ select: [value: T, event: KeyboardEvent | MouseEvent] }>();
const trigger = useTemplateRef("trigger");
const content = useTemplateRef("content");
const triggerElement = computed(() => trigger.value?.element);
const popover = usePopover({ positionArea, positionTry: POPOVER_POSITION_TRY });
const { anchorStyles, attach, attachAnchor, close, contentAttrs, contentStyles, id, isOpen, open } = popover;
const { choose, getItemId, isTabbable, onMenuKeydown, openAtEnd } = useMenu(() => items, popover, {
  onSelect: (value, event) => {
    emit("select", value, event);
  },
  returnFocusTo: () => triggerElement.value ?? undefined,
});

attachAnchor(triggerElement);
attach(content);

watch(isOpen, (newIsOpen) => {
  isOpenModel.value = newIsOpen;
});
watch(isOpenModel, (newIsOpenModel) => {
  if (newIsOpenModel) open();
  else close();
});
</script>

<template>
  <UiTooltip #default="{ activatorProps }" :is-disabled="isOpen || isLabelShown" :label>
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
    :="contentAttrs"
    :aria-label="label"
    :style="contentStyles"
    role="menu"
    tabindex="-1"
    ui-popover
    @keydown="(event) => onMenuKeydown(event)"
  >
    <UiMenuItems :get-item-id :is-tabbable :items @select="(value, event) => choose(value, event)" />
  </div>
</template>
