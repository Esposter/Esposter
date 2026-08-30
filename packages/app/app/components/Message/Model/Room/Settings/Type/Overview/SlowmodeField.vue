<script setup lang="ts">
const modelValue = defineModel<null | number>({ required: true });
const emit = defineEmits<{ save: [] }>();
const rules = useVRules();
const slowmodeRules = computed(() => [rules.minValue(1)]);
// `Temporal` is a language global, and a template expression resolves only the globals Vue allows — so the
// Field's two unit conversions live here rather than inline in the bindings
const displaySeconds = computed(() =>
  modelValue.value === null ? "" : Temporal.Duration.from({ milliseconds: modelValue.value }).total("seconds"),
);
const onUpdateModelValue = (newDisplaySeconds: string) => {
  // A number input hands over whatever was typed, and a Temporal field must be a finite integer — so a
  // Fractional or overflowing entry is truncated to whole seconds here rather than throwing out of the handler
  const seconds = Math.trunc(Number(newDisplaySeconds));
  modelValue.value =
    newDisplaySeconds && Number.isFinite(seconds) && seconds >= 1
      ? Temporal.Duration.from({ seconds }).total("milliseconds")
      : null;
};
</script>

<template>
  <MessageModelRoomSettingsField hint="Seconds between messages. Leave empty to disable." title="Slowmode">
    <v-text-field
      :model-value="displaySeconds"
      :rules="slowmodeRules"
      density="compact"
      placeholder="Disabled"
      type="number"
      min="1"
      @update:model-value="onUpdateModelValue"
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
  </MessageModelRoomSettingsField>
</template>
