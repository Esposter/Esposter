<script setup lang="ts">
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { MAX_SLOWMODE_MS } from "@esposter/db-schema";

const modelValue = defineModel<number>({ required: true });
const emit = defineEmits<{ save: [] }>();
const rules = useVRules();
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
const slowmodeRules = computed(() => [
  rules.minValue(1),
  (value: string) =>
    value === "" || Number(value) <= maxDisplaySeconds || `You must enter a value of at most ${maxDisplaySeconds}`,
]);
const onUpdateModelValue = (newDisplaySeconds: string) => {
  // A number field hands over whatever was typed rather than what its rules allow, and a Temporal field must be a
  // Finite integer — so the entry is truncated to whole seconds and bounded here instead
  const seconds = Math.trunc(Number(newDisplaySeconds));
  modelValue.value =
    newDisplaySeconds && seconds >= 1 && seconds <= maxDisplaySeconds
      ? Temporal.Duration.from({ seconds }).total("milliseconds")
      : 0;
};
</script>

<template>
  <MessageModelRoomSettingsField hint="Seconds between messages. Leave empty to disable.">
    <UiTextField
      :model-value="displaySeconds"
      label="Slowmode"
      :rules="slowmodeRules"
      :type="UiTextFieldType.Number"
      @update:model-value="onUpdateModelValue"
      @focusout="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
  </MessageModelRoomSettingsField>
</template>
