<script setup lang="ts">
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { ResourceUpdatedFilterItems } from "@/services/resource/list/ResourceUpdatedFilterItems";

const updatedFilter = defineModel<"" | ResourceUpdatedFilter>("updatedFilter", { required: true });
const updatedAfter = defineModel<Date | undefined>("updatedAfter", { required: true });
const updatedBefore = defineModel<Date | undefined>("updatedBefore", { required: true });
const emit = defineEmits<{ remove: [] }>();
// StyledDatePicker models Date | null, the filter refs model Date | undefined
const updatedAfterValue = computed({
  get: () => updatedAfter.value ?? null,
  set: (value) => {
    updatedAfter.value = value ?? undefined;
  },
});
const updatedBeforeValue = computed({
  get: () => updatedBefore.value ?? null,
  set: (value) => {
    updatedBefore.value = value ?? undefined;
  },
});
const selectPreset = (preset: ResourceUpdatedFilter) => {
  updatedFilter.value = preset;
  if (preset === ResourceUpdatedFilter.Custom) return;

  updatedAfter.value = undefined;
  updatedBefore.value = undefined;
};
</script>

<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-chip closable :="menuProps" @click:close="emit('remove')">Updated == {{ updatedFilter || "all" }}</v-chip>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="{ title, value } of ResourceUpdatedFilterItems"
        :key="value"
        :active="updatedFilter === value"
        :title
        @click="selectPreset(value)"
      />
      <div v-if="updatedFilter === ResourceUpdatedFilter.Custom" px-4 py-2 flex flex-col gap-2 w-72>
        <StyledDatePicker v-model="updatedAfterValue" :date-picker-props="{ placeholder: 'From' }" />
        <StyledDatePicker v-model="updatedBeforeValue" :date-picker-props="{ placeholder: 'To' }" />
      </div>
    </v-list>
  </v-menu>
</template>
