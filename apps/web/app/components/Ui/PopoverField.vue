<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // Whether a button beside the field empties it, shown while the field holds something
  isClearable: boolean;
  // Whether the field holds nothing, so it reads its placeholder
  isEmpty: boolean;
  // Named for assistive technology alone, where what surrounds the field already says what it is for
  isLabelHidden?: true;
  label: string;
  // What the field reads while it holds nothing
  placeholder: string;
}
// A field drawn as a select's trigger, whose value opens a panel of its own, with its label above it. The value is the
// Value slot and the panel is the default slot; the caller answers the clear button through its clear event
const isOpen = defineModel<boolean>("isOpen", { default: false });
const { isClearable, isEmpty, isLabelHidden, label, placeholder } = defineProps<Props>();
const emit = defineEmits<{ clear: [] }>();
defineSlots<{ default: () => VNode; value: () => VNode }>();
const popover = useTemplateRef("popover");
// The trigger, which what opens the field in place of something else focuses
const element = computed(() => popover.value?.triggerElement);
const valueId = useId();

defineExpose({ element });
</script>

<template>
  <div flex flex-col gap-1>
    <span :class="{ 'sr-only': isLabelHidden }" text-sm text-muted>{{ label }}</span>
    <div flex gap-1 items-center>
      <UiPopover
        ref="popover"
        v-model:is-open="isOpen"
        :aria-describedby="valueId"
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
