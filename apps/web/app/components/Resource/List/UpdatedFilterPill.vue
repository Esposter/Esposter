<script setup lang="ts">
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ResourceUpdatedFilterItems } from "@/services/resource/list/ResourceUpdatedFilterItems";
import { getZonedDateTime } from "@esposter/shared";

const updatedFilter = defineModel<"" | ResourceUpdatedFilter>("updatedFilter", { required: true });
const updatedAfter = defineModel<Date | undefined>("updatedAfter", { required: true });
const updatedBefore = defineModel<Date | undefined>("updatedBefore", { required: true });
const emit = defineEmits<{ remove: [] }>();
// The range picks days and the bounds are instants: each bound is its day's start where the reader is, and the fetch
// Extends the end to the close of its day
const createDayBound = (bound: Ref<Date | undefined>) =>
  computed({
    get: () => (bound.value ? getZonedDateTime(bound.value).toPlainDate() : undefined),
    set: (day) => {
      bound.value = day ? new Date(day.toZonedDateTime(Temporal.Now.timeZoneId()).epochMilliseconds) : undefined;
    },
  });
const updatedAfterDay = createDayBound(updatedAfter);
const updatedBeforeDay = createDayBound(updatedBefore);
const selectPreset = (preset: ResourceUpdatedFilter) => {
  updatedFilter.value = preset;
  if (preset === ResourceUpdatedFilter.Custom) return;

  updatedAfter.value = undefined;
  updatedBefore.value = undefined;
};
</script>

<template>
  <ResourceListFilterPill is-removable label="Updated" :value="updatedFilter || 'all'" @remove="emit('remove')">
    <ResourceListFilterOptions
      :items="ResourceUpdatedFilterItems"
      :meaning="UiIconMeaning.Recent"
      :selected-values="updatedFilter ? [updatedFilter] : []"
      @toggle="(preset) => selectPreset(preset)"
    />
    <UiDateRangeField
      v-if="updatedFilter === ResourceUpdatedFilter.Custom"
      v-model:from="updatedAfterDay"
      v-model:to="updatedBeforeDay"
      label="Between"
    />
  </ResourceListFilterPill>
</template>
