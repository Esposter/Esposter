<script setup lang="ts">
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";

const route = useRoute();
const { dataset, error, isLoading } = useDataset(() => ({
  id: Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
  type: DatasetProviderType.SurveyResponses,
}));
const headers = computed(() => dataset.value?.columns.map(({ name }) => ({ key: name, title: name })) ?? []);
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <div v-else p-4>
    <v-alert v-if="error" type="error" :text="error" />
    <v-data-table v-else :headers :items="dataset?.rows ?? []" />
  </div>
</template>
