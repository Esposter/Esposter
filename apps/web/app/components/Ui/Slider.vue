<script setup lang="ts">
import { Slider } from "@vuetify/v0";

interface Props {
  // Held at the disabled opacity, where the thumb takes no press and no key
  isDisabled?: boolean;
  // Marks the thumb invalid for assistive technology and tints the track in the error colour, as an invalid text field is
  isInvalid?: true;
  // Hides the label from sight, where the thumb's aria-label still names what it sets
  isLabelHidden?: true;
  // Marks the label with the required mark, which speech announces as required once
  isRequired?: true;
  label: string;
  // A live reading drawn along the track as a fraction of it, which the thumb is set against: a microphone's level
  // Under its sensitivity threshold. Said in words by its own label, since it is not the value being picked
  level?: number;
  levelLabel?: string;
  max: number;
  min: number;
  step: number;
  // The reading in words, with its unit, drawn beside the label and said in place of the number
  valueText: string;
}
// A number picked along a field's track, filled with the accent up to a raised thumb. The model follows every move, and
// End says the reader settled on a value — a drag let go, or each key press — which is when a setting is saved
const modelValue = defineModel<number>({ required: true });
const { isDisabled, isInvalid, isLabelHidden, isRequired, label, level, levelLabel, max, min, step, valueText } =
  defineProps<Props>();
const emit = defineEmits<{ end: [value: number] }>();
// @TODO: no upstream issue — Vuetify 0's slider emits end for a drag alone, so a key's change settles here
// Vuetify 0 says a drag ended but not that a key moved the thumb, so a change while no pointer is down is a key's and
// Settles at once. The flag is raised in the capture phase, ahead of the track setting the value it was pressed at
const isPointerDown = ref(false);
// Vuetify 0 never ends a press in the band around the track, since it never begins a drag, so its release clears the flag
useEventListener(["pointerup", "pointercancel"], () => {
  isPointerDown.value = false;
});
</script>

<template>
  <Slider.Root
    #default="{ attrs }"
    :model-value
    :disabled="isDisabled"
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
    <div :="attrs" :class="{ 'op-disabled': isDisabled }" flex flex-col gap-1>
      <div flex gap-2>
        <span v-if="!isLabelHidden" flex-1>{{ label }} <UiRequiredMark v-if="isRequired" /></span>
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
        <Slider.Track
          class="track"
          :data-invalid="isInvalid || undefined"
          h-2
          w-full
          cursor-pointer
          relative
          ui-field
          ui-pill
        >
          <Slider.Range class="range" bg-accent h-full absolute ui-pill />
          <!-- Over the fill, so where the reading passes the thumb shows against the accent as well as the track -->
          <div
            v-if="level !== undefined"
            :aria-label="levelLabel"
            class="level"
            role="img"
            :style="{ width: `${Math.min(Math.max(level, 0), 1) * 100}%` }"
            h-full
            pointer-events-none
            left-0
            absolute
            ui-pill
          />
        </Slider.Track>
        <Slider.Thumb
          class="thumb"
          :aria-label="label"
          :aria-invalid="isInvalid || undefined"
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

.level {
  background-color: color-mix(in srgb, var(--ui-success) 70%, transparent);
}

/* An invalid track is tinted in the error colour, as an invalid text field is, under the thumb that carries the mark */
.track[data-invalid] {
  background-color: color-mix(in srgb, var(--ui-error) 12%, var(--ui-field-background));
}

.thumb[data-state="dragging"] {
  cursor: grabbing;
}
</style>
