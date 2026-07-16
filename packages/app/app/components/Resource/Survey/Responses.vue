<script setup lang="ts">
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";

import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { getResultAsync } from "@esposter/shared";

const route = useRoute();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingRowKey, detailRowKey } = storeToRefs(surveyResponseDialogStore);
// The blade is keyed by resource id and suspended, so this instance only ever serves one survey
const id = route.params.id as string;
const records = ref<SurveyResponseRecords>();
const error = ref<string>();
// Rows arrive already carrying their keys from one server read, so a response submitted or deleted
// Between reads can never associate a row with another response's key
const refreshResponses = async () => {
  await getResultAsync(() => $trpc.survey.readSurveyResponseRecords.query({ id })).match(
    (newRecords) => {
      records.value = newRecords;
      error.value = undefined;
    },
    (newError) => {
      error.value = newError.message;
    },
  );
};
const headers = computed(() => records.value?.columns.map(({ name }) => ({ key: name, title: name })) ?? []);
const items = computed(() => records.value?.rows ?? []);
const truncation = computed(() => (records.value ? getDatasetTruncation(records.value) : undefined));

await refreshResponses();
</script>

<template>
  <div p-4 flex flex-col gap-4>
    <v-alert v-if="error" type="error" :text="error" />
    <template v-else>
      <!-- Responses are the one dataset the owner reads as a record of truth, so a silent cut is never acceptable -->
      <DatasetTruncationAlert v-if="truncation" :truncation />
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
      <ResourceSurveyResponseDetailDialog :columns="records?.columns ?? []" :items />
      <ResourceSurveyResponseDeleteDialog :survey-id="id" @delete="refreshResponses" />
    </template>
  </div>
</template>
