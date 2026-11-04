<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // Whether a button beside the field empties it, shown while the field holds something
  isClearable: boolean;
  // Whether the field is disabled, so it cannot be opened
  isDisabled?: true;
  // Whether the field holds nothing, so it reads its placeholder
  isEmpty: boolean;
  // Named for assistive technology alone, where what surrounds the field already says what it is for
  isLabelHidden?: true;
  // Marks the label with the required mark, which speech announces as required once
  isRequired?: true;
  label: string;
  // What the field reads while it holds nothing
  placeholder: string;
}
// What a call site passes, such as an invalid mark, goes to the trigger, which is the field's button
defineOptions({ inheritAttrs: false });
defineSlots<{ default: () => VNode; value: () => VNode }>();
// A field drawn as a select's trigger, whose value opens a panel of its own, with its label above it. The value is the
// Value slot and the panel is the default slot; the caller answers the clear button through its clear event
const isOpen = defineModel<boolean>("isOpen", { default: false });
const { isClearable, isDisabled, isEmpty, isLabelHidden, isRequired, label, placeholder } = defineProps<Props>();
const emit = defineEmits<{ clear: [] }>();
const attrs = useAttrs();
const popover = useTemplateRef("popover");
// The trigger, which what opens the field in place of something else focuses
const element = computed(() => popover.value?.triggerElement);
const labelId = useId();
const valueId = useId();
// The caller's own labelledby stays, and a required field's label joins it after, so the trigger is named by both
const labelledBy = computed(
  () => [attrs["aria-labelledby"], isRequired ? labelId : undefined].filter(Boolean).join(" ") || undefined,
);

defineExpose({ element });
</script>

<template>
  <div flex flex-col gap-1>
    <span :id="labelId" :class="{ 'sr-only': isLabelHidden }" text-sm text-muted
      >{{ label }} <UiRequiredMark v-if="isRequired"
    /></span>
    <div flex gap-1 items-center>
      <UiPopover
        ref="popover"
        v-model:is-open="isOpen"
        :="$attrs"
        :aria-describedby="valueId"
        :aria-labelledby="labelledBy"
        :disabled="isDisabled"
        is-label-shown
        :label
        :variant="UiButtonVariant.Field"
        flex-1
        justify-start
      >
        <template #trigger>
          <UiIcon :meaning="UiIconMeaning.Date" text-muted />
          <span :id="valueId" :class="{ 'text-muted': isEmpty }" text-left flex-1 truncate>
            <slot v-if="!isEmpty" name="value" />
            <template v-else>{{ placeholder }}</template>
          </span>
        </template>
        <slot />
      </UiPopover>
      <UiIconButton
        v-if="isClearable"
        :label="`Clear ${label}`"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="emit('clear')"
      />
    </div>
  </div>
</template>
