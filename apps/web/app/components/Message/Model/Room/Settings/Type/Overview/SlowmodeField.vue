<script setup lang="ts">
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { UiRules } from "@/services/ui/UiRules";
import { MAX_SLOWMODE_MS } from "@esposter/db-schema";

const modelValue = defineModel<number>({ required: true });
const emit = defineEmits<{ save: [] }>();
// `Temporal` is a language global, and a template expression resolves only the globals Vue allows — so the
// Field's two unit conversions live here rather than inline in the bindings. Both truncate to whole seconds, so a
// Stored value finer or larger than the field accepts still displays inside the bound the field advertises
const displaySeconds = computed(() =>
  modelValue.value === 0
    ? ""
    : String(Math.trunc(Temporal.Duration.from({ milliseconds: modelValue.value }).total("seconds"))),
);
// The bound doubles as the one that keeps a typed entry inside the range a Temporal duration can represent
const maxDisplaySeconds = Math.trunc(Temporal.Duration.from({ milliseconds: MAX_SLOWMODE_MS }).total("seconds"));
const slowmodeRules = [UiRules.minValue(1), UiRules.maxValue(maxDisplaySeconds)];
const onUpdateModelValue = (newDisplaySeconds: string) => {
  // Only an empty field is no slowmode: the form saves on blur, so an entry out of range that wrote 0 would switch
  // Slowmode off with it. Such an entry keeps the stored value, and the field's rules say why it is refused
  if (!newDisplaySeconds) {
    modelValue.value = 0;
    return;
  }
  // A number field hands over whatever was typed rather than what its rules allow, and a Temporal field must be a
  // Finite integer — so the entry is truncated to whole seconds and bounded here instead
  const seconds = Math.trunc(Number(newDisplaySeconds));
  if (seconds >= 1 && seconds <= maxDisplaySeconds)
    modelValue.value = Temporal.Duration.from({ seconds }).total("milliseconds");
};
</script>

<template>
  <UiTextField
    hint="Seconds between messages. Leave empty to disable."
    :model-value="displaySeconds"
    label="Slowmode"
    :rules="slowmodeRules"
    :type="UiTextFieldType.Number"
    @update:model-value="(newDisplaySeconds) => onUpdateModelValue(newDisplaySeconds)"
    @focusout="emit('save')"
    @keydown.enter.prevent="emit('save')"
  />
</template>
