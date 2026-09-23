<script setup lang="ts">
import { ISO_DATE_FORMAT } from "#shared/util/date/constants";
import { formatDate } from "#shared/util/date/formatDate";
import { parseDate } from "#shared/util/date/parseDate";
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { ResourceUpdatedFilterItems } from "@/services/resource/list/ResourceUpdatedFilterItems";

const updatedFilter = defineModel<"" | ResourceUpdatedFilter>("updatedFilter", { required: true });
const updatedAfter = defineModel<Date | undefined>("updatedAfter", { required: true });
const updatedBefore = defineModel<Date | undefined>("updatedBefore", { required: true });
const emit = defineEmits<{ remove: [] }>();
// A date field reads and writes a day as YYYY-MM-DD, the bounds are dates, and an emptied field clears its bound
const createDayValue = (bound: Ref<Date | undefined>) =>
  computed({
    // eslint-disable-next-line no-restricted-syntax -- a date field's value, which the browser displays itself
    get: () => (bound.value ? formatDate(bound.value, ISO_DATE_FORMAT) : ""),
    set: (value) => {
      bound.value = value ? parseDate(value, ISO_DATE_FORMAT) : undefined;
    },
  });
const updatedAfterValue = createDayValue(updatedAfter);
const updatedBeforeValue = createDayValue(updatedBefore);
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
      :selected-values="updatedFilter ? [updatedFilter] : []"
      @toggle="selectPreset"
    />
    <div v-if="updatedFilter === ResourceUpdatedFilter.Custom" flex flex-col gap-2>
      <UiTextField v-model="updatedAfterValue" label="From" type="date" />
      <UiTextField v-model="updatedBeforeValue" label="To" type="date" />
    </div>
  </ResourceListFilterPill>
</template>
