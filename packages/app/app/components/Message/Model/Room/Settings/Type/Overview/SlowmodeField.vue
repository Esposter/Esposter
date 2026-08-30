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
// `slowmodeMs` is a Postgres `integer`, so a longer slowmode could never be stored — and the bound doubles as
// The one that keeps a typed entry inside the range a Temporal duration can represent
const MAX_SLOWMODE_MS = 2_147_483_647;
const maxDisplaySeconds = Math.trunc(Temporal.Duration.from({ milliseconds: MAX_SLOWMODE_MS }).total("seconds"));
const onUpdateModelValue = (newDisplaySeconds: string) => {
  // A number input hands over whatever was typed rather than what its own min and max allow, and a Temporal
  // Field must be a finite integer — so the entry is truncated to whole seconds and bounded here instead
  const seconds = Math.trunc(Number(newDisplaySeconds));
  modelValue.value =
    newDisplaySeconds && seconds >= 1 && seconds <= maxDisplaySeconds
      ? Temporal.Duration.from({ seconds }).total("milliseconds")
      : null;
};
</script>

<template>
  <MessageModelRoomSettingsField hint="Seconds between messages. Leave empty to disable." title="Slowmode">
    <v-text-field
      :model-value="displaySeconds"
      :rules="slowmodeRules"
      :max="maxDisplaySeconds"
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
