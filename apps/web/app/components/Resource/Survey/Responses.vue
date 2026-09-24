<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { SurveyResponseRecord } from "#shared/models/resource/survey/SurveyResponseRecord";
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";
import type { UiItem } from "@/models/ui/UiItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";
import { DATA_TABLE_ITEMS_PER_PAGE_OPTIONS } from "@/services/ui/constants";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { getResultAsync } from "@esposter/shared";

const { currentRoute } = useRouter();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingRowKey, detailRowKey } = storeToRefs(surveyResponseDialogStore);
// The blade is keyed by resource id and suspended, so this instance only ever serves one survey
const id = getRouteParamString(currentRoute.value.params.id);
const records = ref<SurveyResponseRecords>();
const error = ref("");
// Rows arrive already carrying their keys from one server read, so a response submitted or deleted
// Between reads can never associate a row with another response's key
const refreshResponses = async () => {
  await getResultAsync(() => $trpc.survey.readSurveyResponseRecords.query({ id })).match(
    (newRecords) => {
      records.value = newRecords;
      error.value = "";
    },
    (newError) => {
      error.value = newError.message;
    },
  );
};
const tableColumns = computed<UiDataTableColumn<SurveyResponseRecord & { id: string }>[]>(() => [
  ...(records.value?.columns.map(({ name }) => ({
    getValue: (row: SurveyResponseRecord) => String(row[name] ?? ""),
    key: name,
    title: name,
  })) ?? []),
  { isSortable: false, key: "actions", title: "" },
]);
// A response is keyed by its row key, which the table reads its rows by
// oxlint-disable-next-line oxc/no-map-spread -- each item is a new object, never a read row mutated in place
const items = computed(() => records.value?.rows.map((row) => ({ ...row, id: row.rowKey })) ?? []);
const itemsPerPage = ref(DATA_TABLE_ITEMS_PER_PAGE_OPTIONS[0]);
const page = ref(1);
const sortBy = ref<SortItem<string>[]>([]);
const { getContextMenuProps } = useContextMenu();
// A row opens its answers on a click, so its commands are what else there is to do with it
const getActionItems = (rowKey: string): UiItem[] => [
  {
    meaning: UiIconMeaning.Show,
    onClick: () => {
      detailRowKey.value = rowKey;
    },
    title: "View response",
  },
  {
    color: "error",
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      deletingRowKey.value = rowKey;
    },
    title: "Delete response",
  },
];
const truncation = computed(() => (records.value ? getDatasetTruncation(records.value) : undefined));

await refreshResponses();
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-body>
    <UiErrorState v-if="error" :error @retry="refreshResponses()" />
    <template v-else>
      <!-- Responses are the one dataset the owner reads as a record of truth, so a silent cut is never acceptable -->
      <DatasetTruncationAlert v-if="truncation" :truncation />
      <UiDataTable
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model:sort-by="sortBy"
        :columns="tableColumns"
        :get-item-title="({ id }) => `response ${id}`"
        :get-row-props="(item) => getContextMenuProps(item.id, () => getActionItems(item.id))"
        :items
        :items-per-page-options="DATA_TABLE_ITEMS_PER_PAGE_OPTIONS"
        label="Responses"
        :on-open="({ id: rowKey }) => (detailRowKey = rowKey)"
      >
        <template #cell="{ column, item, value }">
          <div v-if="column.key === 'actions'" flex justify-end @click.stop>
            <UiOverflowMenu :items="getActionItems(item.id)" label="Response actions" />
          </div>
          <template v-else>{{ value }}</template>
        </template>
        <template #empty>
          <UiEmptyState
            description="Answers appear here as participants submit the survey"
            :meaning="UiIconMeaning.Comment"
            title="No responses yet"
          />
        </template>
      </UiDataTable>
      <ResourceSurveyResponseDetailDialog :columns="records?.columns ?? []" :items="records?.rows ?? []" />
      <ResourceSurveyResponseDeleteDialog :survey-id="id" @delete="refreshResponses" />
    </template>
  </div>
</template>
