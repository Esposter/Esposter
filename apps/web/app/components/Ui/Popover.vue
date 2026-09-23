<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";

import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY } from "@/services/ui/constants";
import { usePopover } from "@vuetify/v0";

interface Props {
  // The panel's accessible name, and its trigger's, since a trigger may show no more than a mark
  label: string;
  positionArea?: string;
  variant?: UiButtonVariant;
}

// A trigger and the panel it opens: a menu's shape for content that is not a list of actions, such as links grouped
// Under headings. What a call site passes goes to the trigger, which opens the panel natively through its popover
// Target, so a second click on it closes the panel rather than light-dismissing it and opening it again
defineOptions({ inheritAttrs: false });
defineSlots<{ default: (props: { close: () => void }) => VNode; trigger: () => VNode }>();
// Written from outside too, so a shortcut elsewhere on the page can open the panel
const isOpenModel = defineModel<boolean>("isOpen", { default: false });
const { label, positionArea = POPOVER_POSITION_AREA, variant } = defineProps<Props>();
const trigger = useTemplateRef("trigger");
const content = useTemplateRef("content");
const triggerElement = computed(() => trigger.value?.element);
const { anchorStyles, attach, attachAnchor, close, contentAttrs, contentStyles, id, isOpen, open } = usePopover({
  positionArea,
  positionTry: POPOVER_POSITION_TRY,
});
const closeToTrigger = () => {
  close();
  triggerElement.value?.focus();
};

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
  <UiButton
    ref="trigger"
    v-bind="$attrs"
    :aria-controls="id"
    :aria-expanded="isOpen"
    :aria-label="label"
    :popovertarget="id"
    :style="anchorStyles"
    :title="label"
    :variant
  >
    <slot name="trigger" />
  </UiButton>
  <div
    ref="content"
    v-bind="contentAttrs"
    :aria-label="label"
    role="dialog"
    :style="contentStyles"
    ui-popover
    @keydown.esc.prevent="closeToTrigger()"
  >
    <div max-h="[70dvh]" p-3 flex flex-col gap-3 of-y-auto ui-frame>
      <slot :close="closeToTrigger" />
    </div>
  </div>
</template>
