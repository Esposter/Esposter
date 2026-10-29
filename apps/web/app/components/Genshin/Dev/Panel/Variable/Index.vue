<script setup lang="ts">
import type { DevValue, DevVariable } from "genshin-world";

import { DevVariableKind } from "genshin-world";

interface Props {
  // The value the variable held when the registry last changed
  value: DevValue;
  variable: DevVariable;
}

// One variable's control, by its kind: a switch, a slider over its range, a colour or a choice. A number without a range
// Has no slider, so the console sets it alone
const emit = defineEmits<{ set: [value: DevValue] }>();
const { value, variable } = defineProps<Props>();
const choiceItems = computed(() => (variable.choices ?? []).map((choice) => ({ title: choice, value: choice })));
</script>

<template>
  <UiSwitch
    v-if="variable.kind === DevVariableKind.Boolean"
    :label="variable.name"
    :model-value="Boolean(value)"
    @update:model-value="(newValue) => emit('set', newValue)"
  />
  <UiSlider
    v-else-if="variable.kind === DevVariableKind.Number && variable.range"
    :label="variable.name"
    :max="variable.range.max"
    :min="variable.range.min"
    :model-value="Number(value)"
    :step="variable.range.step"
    :value-text="String(value)"
    @update:model-value="(newValue) => emit('set', newValue)"
  />
  <UiColorField
    v-else-if="variable.kind === DevVariableKind.Colour"
    :label="variable.name"
    :model-value="String(value)"
    @update:model-value="(newValue) => emit('set', newValue)"
  />
  <UiSelect
    v-else-if="variable.kind === DevVariableKind.Choice"
    :items="choiceItems"
    :label="variable.name"
    :model-value="String(value)"
    @update:model-value="(newValue) => emit('set', newValue)"
  />
</template>
