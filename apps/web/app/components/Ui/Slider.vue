<script setup lang="ts">
import { Slider } from "@vuetify/v0";

interface Props {
  // Named for assistive technology alone, where the section it sits in already says what it sets
  isLabelHidden?: true;
  label: string;
  max: number;
  min: number;
  step: number;
  // The reading in words, with its unit, drawn beside the label and said in place of the number
  valueText: string;
}

// A number picked along a field's track, filled with the accent up to a raised thumb. The model follows every move, and
// End says the reader settled on a value — a drag let go, or each key press — which is when a setting is saved
const modelValue = defineModel<number>({ required: true });
const { isLabelHidden, label, max, min, step, valueText } = defineProps<Props>();
const emit = defineEmits<{ end: [value: number] }>();
// @TODO: Vuetify 0's slider emits end for a drag alone
// Vuetify 0 says a drag ended but not that a key moved the thumb, so a change while no pointer is down is a key's and
// Settles at once. The flag is raised in the capture phase, ahead of the track setting the value it was pressed at
const isPointerDown = ref(false);
</script>

<template>
  <Slider.Root
    #default="{ attrs }"
    :model-value
    :max
    :min
    :step
    renderless
    @update:model-value="
      (value) => {
        if (typeof value !== 'number') return;
        modelValue = value;
        if (!isPointerDown) emit('end', value);
      }
    "
    @end="
      (value) => {
        isPointerDown = false;
        if (typeof value === 'number') emit('end', value);
      }
    "
  >
    <div :="attrs" flex flex-col gap-1>
      <div flex gap-2>
        <span v-if="!isLabelHidden" flex-1>{{ label }}</span>
        <span text-muted>{{ valueText }}</span>
      </div>
      <div
        class="slider"
        :data-dragging="isPointerDown || undefined"
        flex
        h-6
        items-center
        relative
        @pointerdown.capture="
          (event: PointerEvent) => {
            isPointerDown = event.button === 0;
          }
        "
      >
        <Slider.Track h-2 w-full cursor-pointer relative ui-field ui-pill>
          <Slider.Range class="range" bg-accent h-full absolute ui-pill />
        </Slider.Track>
        <Slider.Thumb
          class="thumb"
          :aria-label="label"
          :aria-valuetext="valueText"
          size-4
          cursor-grab
          top="1/2"
          absolute
          translate-x="-1/2"
          translate-y="-1/2"
          ui-raised
          ui-pill
        />
      </div>
    </div>
  </Slider.Root>
</template>

<style scoped>
/* A key glides the thumb and the fill to their next step, while a drag moves them with the pointer */
.slider:not([data-dragging]) .range {
  transition: width var(--ui-motion-short);
}

.slider:not([data-dragging]) .thumb {
  transition: left var(--ui-motion-short);
}

.thumb[data-state="dragging"] {
  cursor: grabbing;
}
</style>
