<script setup lang="ts">
import type { UiButtonVariant } from "@/models/ui/UiButtonVariant";

import { POPOVER_POSITION_AREA, POPOVER_POSITION_TRY } from "@/services/ui/constants";
import { usePopover } from "@vuetify/v0";
import { mergeProps } from "vue";

interface Props {
  // An element already on the page the panel hangs off in place of a trigger of its own, opened through the model: the
  // Row of a list that was pressed, so one panel serves every row
  anchor?: HTMLElement;
  // The panel's accessible name, and its trigger's, since a trigger may show no more than a mark
  label: string;
  positionArea?: string;
  variant?: UiButtonVariant;
}

// A trigger and the panel it opens: a menu's shape for content that is not a list of actions, such as links grouped
// Under headings. What a call site passes goes to the trigger, which opens the panel natively through its popover
// Target, so a second click on it closes the panel rather than light-dismissing it and opening it again
defineOptions({ inheritAttrs: false });
defineSlots<{ default: (props: { close: () => void }) => VNode; trigger?: () => VNode }>();
// Written from outside too, so a shortcut elsewhere on the page can open the panel
const isOpenModel = defineModel<boolean>("isOpen", { default: false });
const { anchor, label, positionArea = POPOVER_POSITION_AREA, variant } = defineProps<Props>();
const trigger = useTemplateRef("trigger");
const content = useTemplateRef("content");
const triggerElement = computed(() => anchor ?? trigger.value?.element);
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

// No template binds an outside element's style, so the name the panel positions against is set on it here, and taken
// Off again when the panel moves to another
watchImmediate(
  () => [anchor, anchorStyles.value.anchorName] as const,
  ([newAnchor, anchorName], _oldValue, onCleanup) => {
    if (!newAnchor || !anchorName) return;
    newAnchor.style.setProperty("anchor-name", anchorName);
    onCleanup(() => {
      newAnchor.style.removeProperty("anchor-name");
    });
  },
);

watch(isOpen, (newIsOpen) => {
  isOpenModel.value = newIsOpen;
});
watch(isOpenModel, (newIsOpenModel) => {
  if (newIsOpenModel) open();
  else close();
});
</script>

<template>
  <UiTooltip v-if="!anchor" #default="{ activatorProps }" :disabled="isOpen" :label>
    <UiButton
      ref="trigger"
      :="mergeProps(activatorProps, $attrs)"
      :aria-controls="id"
      :aria-expanded="isOpen"
      :aria-label="label"
      :popovertarget="id"
      :style="{ anchorName: [anchorStyles.anchorName, activatorProps.style.anchorName].join(', ') }"
      :variant
    >
      <slot name="trigger" />
    </UiButton>
  </UiTooltip>
  <div
    ref="content"
    v-bind="contentAttrs"
    class="panel"
    :aria-label="label"
    role="dialog"
    :style="contentStyles"
    ui-popover
    @keydown.esc.prevent="closeToTrigger()"
  >
    <div max-h="[70dvh]" p-3 flex flex-col gap-3 of-y-auto ui-lifted>
      <slot :close="closeToTrigger" />
    </div>
  </div>
</template>

<style scoped>
/* It steps out of what opened it and back in: down from a trigger by default, out of the dock's edge on the dock */
.panel {
  opacity: 0;
  transform: var(--ui-popover-from);
  transition:
    opacity var(--ui-motion-short),
    transform var(--ui-motion-short),
    display var(--ui-motion-short) allow-discrete,
    overlay var(--ui-motion-short) allow-discrete;
}

.panel:popover-open {
  opacity: 1;
  transform: none;
  transition:
    opacity var(--ui-motion-medium),
    transform var(--ui-motion-medium),
    display var(--ui-motion-medium) allow-discrete,
    overlay var(--ui-motion-medium) allow-discrete;
}

@starting-style {
  .panel:popover-open {
    opacity: 0;
    transform: var(--ui-popover-from);
  }
}
</style>
