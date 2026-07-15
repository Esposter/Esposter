<script setup lang="ts">
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { getResultAsync } from "@esposter/shared";

const route = useRoute();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingRowKey, detailRowKey } = storeToRefs(surveyResponseDialogStore);
const id = computed(() => (Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? "")));
const { dataset, error, isLoading, refresh } = useDataset(() => ({
  id: id.value,
  type: DatasetProviderType.SurveyResponses,
}));
// The dataset contract carries no keys, so they are read alongside it and matched back by index —
// Both reads go through the same capped server-side read, so the two lists are always aligned
const rowKeys = ref<string[]>([]);
const headers = computed(() => dataset.value?.columns.map(({ name }) => ({ key: name, title: name })) ?? []);
const items = computed(
  () =>
    // oxlint-disable-next-line oxc/no-map-spread -- a copy is required, the dataset rows are the source of truth and must not gain a key column
    dataset.value?.rows.map((row, index) => ({ ...row, rowKey: rowKeys.value[index] ?? "" })) ?? [],
);
const readRowKeys = async () => {
  if (!id.value) return;
  rowKeys.value = await getResultAsync(() => $trpc.survey.readSurveyResponseRowKeys.query({ id: id.value })).unwrapOr(
    [],
  );
};
// A delete changes both lists, so they are re-read together to stay index-aligned
const refreshResponses = async () => {
  await Promise.all([refresh(), readRowKeys()]);
};

watchImmediate(id, readRowKeys);
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <div v-else p-4>
    <v-alert v-if="error" type="error" :text="error" />
    <template v-else>
      <v-data-table :headers="[...headers, { key: 'actions', sortable: false, title: '' }]" :items>
        <template #[`item.actions`]="{ item }">
          <div flex gap-1 justify-end>
            <StyledTooltipIconButton icon="mdi-eye-outline" text="View response" @click="detailRowKey = item.rowKey" />
            <StyledTooltipIconButton
              icon="mdi-delete-outline"
              text="Delete response"
              @click="deletingRowKey = item.rowKey"
            />
          </div>
        </template>
      </v-data-table>
      <ResourceSurveyResponseDetailDialog :columns="dataset?.columns ?? []" :items />
      <ResourceSurveyResponseDeleteDialog :survey-id="id" @delete="refreshResponses" />
    </template>
  </div>
</template>
