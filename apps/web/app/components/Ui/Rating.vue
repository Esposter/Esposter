<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { Radio } from "@vuetify/v0";
import { mergeProps } from "vue";

interface Props {
  // How many steps the scale has, each named by its number from one
  count: number;
  // Held at the disabled opacity, where a step is neither chosen nor previewed
  isDisabled?: boolean;
  // The group's accessible name: what its steps choose between
  label: string;
}
// A scale of numbered steps, each drawn by the caller's mark, which is told whether its step is filled. The steps up to
// The one under the pointer are filled while it rests there, and up to the chosen step otherwise. A radio group, so it is
// One stop in the tab order and the arrows move the choice along it. No step is chosen while the choice is an empty string
defineOptions({ inheritAttrs: false });
defineSlots<{ mark: (props: { isOn: boolean; value: number }) => VNode }>();
const modelValue = defineModel<number | string>({ required: true });
const { count, isDisabled, label } = defineProps<Props>();
const hovered = ref<number>();
const steps = computed(() => Array.from({ length: count }, (_value, index) => index + 1));
const filledTo = computed(() => hovered.value ?? (typeof modelValue.value === "number" ? modelValue.value : 0));
</script>

<template>
  <Radio.Group
    #default="{ attrs }"
    :model-value
    :label
    renderless
    @update:model-value="
      (value) => {
        if (value !== undefined) modelValue = value;
        hovered = undefined;
      }
    "
  >
    <div
      :="mergeProps(attrs, $attrs)"
      :class="{ 'op-disabled': isDisabled }"
      class="rating"
      text-muted
      inline-flex
      flex-wrap
      max-w-full
      @pointerleave="hovered = undefined"
    >
      <Radio.Root
        v-for="value of steps"
        #default="{ attrs: stepAttrs }"
        :key="value"
        :disabled="isDisabled"
        :label="String(value)"
        :value
        renderless
      >
        <button
          :="stepAttrs"
          :data-variant="UiButtonVariant.Rating"
          class="ui-button"
          px-0
          type="button"
          @pointerenter="
            () => {
              if (!isDisabled) hovered = value;
            }
          "
        >
          <slot name="mark" :is-on="value <= filledTo" :value />
        </button>
      </Radio.Root>
    </div>
  </Radio.Group>
</template>

<style scoped>
/* A scale that is invalid draws every step in the error colour, which the scoped rule wins over the muted utility */
.rating[aria-invalid="true"] {
  color: var(--ui-error);
}
</style>
