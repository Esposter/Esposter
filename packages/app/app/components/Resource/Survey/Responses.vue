<script setup lang="ts">
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";

const route = useRoute();
const { dataset, error, isLoading } = useDataset(() => ({
  id: Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
  type: DatasetProviderType.SurveyResponses,
}));
const headers = computed(() => dataset.value?.columns.map(({ name }) => ({ key: name, title: name })) ?? []);
const truncation = computed(() => (dataset.value ? getDatasetTruncation(dataset.value) : undefined));
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <div v-else flex flex-col gap-4 p-4>
    <v-alert v-if="error" type="error" :text="error" />
    <template v-else>
      <!-- Responses are the one dataset the owner reads as a record of truth, so a silent cut is never acceptable -->
      <DatasetTruncationAlert v-if="truncation" :truncation />
      <v-data-table :headers :items="dataset?.rows ?? []" />
    </template>
  </div>
</template>
