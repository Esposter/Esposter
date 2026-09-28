<script setup lang="ts">
import type { Recurrence } from "#shared/models/resource/todoList/Recurrence";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { RecurrenceUnit } from "#shared/models/resource/todoList/RecurrenceUnit";
import { TODO_LIST_RECURRENCE_INTERVAL_MAX } from "#shared/services/resource/item/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { RecurrenceUnitLabelMap } from "@/services/resource/todoList/RecurrenceUnitLabelMap";
import { UiRules } from "@/services/ui/UiRules";

interface Props {
  // The due date a new repeat counts from
  dueAt: Date;
}

const modelValue = defineModel<Recurrence | undefined>({ required: true });
const { dueAt } = defineProps<Props>();
const unitItems: UiSelectItem<"" | RecurrenceUnit>[] = [
  { meaning: UiIconMeaning.None, title: "Never", value: "" },
  ...Object.values(RecurrenceUnit).map((unit) => ({
    meaning: UiIconMeaning.Refresh,
    title: RecurrenceUnitLabelMap[unit],
    value: unit,
  })),
];
// Never clears the repeat; a unit keeps the interval already set and the day it started, or starts from the due date
const unit = computed({
  get: () => modelValue.value?.unit ?? "",
  set: (newUnit) => {
    modelValue.value = newUnit
      ? { interval: modelValue.value?.interval ?? 1, startsAt: modelValue.value?.startsAt ?? dueAt, unit: newUnit }
      : undefined;
  },
});
const intervalRules = [UiRules.minValue(1), UiRules.maxValue(TODO_LIST_RECURRENCE_INTERVAL_MAX)];
</script>

<!-- The Repeat menu beside the due date, and once a todo repeats, how many of its unit lie between one due date and the
     Next: the custom schedule. The schema refuses an interval out of range, so the dialog cannot save one -->
<template>
  <div flex flex-wrap gap-2 items-end>
    <div flex-1 min-w-0><UiSelect v-model="unit" :items="unitItems" label="Repeat" /></div>
    <div v-if="modelValue" flex-1 min-w-0>
      <UiTextField
        :model-value="String(modelValue.interval)"
        hint="1 repeats every time, 2 every other"
        label="Every"
        :rules="intervalRules"
        :type="UiTextFieldType.Number"
        @update:model-value="
          (newInterval) => {
            if (modelValue) modelValue = { ...modelValue, interval: Number(newInterval) };
          }
        "
      />
    </div>
  </div>
</template>
