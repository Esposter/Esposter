<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { SurveyResponseRecord } from "#shared/models/resource/survey/SurveyResponseRecord";
import type { Item } from "@/models/shared/Item";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { SurveyResponseView } from "@/models/resource/survey/SurveyResponseView";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { NO_ACTION_ITEMS } from "@/services/shared/constants";
import { DATA_TABLE_ITEMS_PER_PAGE_OPTIONS } from "@/services/ui/constants";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { getRouteParam } from "@/util/router/getRouteParam";

const { currentRoute } = useRouter();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingResponseId, detailResponseId } = storeToRefs(surveyResponseDialogStore);
// The blade is keyed by resource id and suspended, so this instance only ever serves one survey
const id = getRouteParam(currentRoute.value.params, "id");
const { error, records, refreshResponses, summaryCards, summaryError } = useReadSurveyResponses(id);
const view = ref(SurveyResponseView.Summary);
const viewItems: UiTabItem<SurveyResponseView>[] = Object.values(SurveyResponseView).map((value) => ({
  title: value,
  value,
}));
// The Summary and the Individual table both say there are no responses yet, so they share the one state
const emptyStateAttributes = {
  description: "Answers appear here as participants submit the survey",
  meaning: UiIconMeaning.Comment,
  title: "No responses yet",
};
// A question's key is prefixed, so a question named like the actions column never shares its key or its cell's menu
const tableColumns = computed<UiDataTableColumn<SurveyResponseRecord & { id: string }>[]>(() => [
  ...(records.value?.columns.map(({ name }) => ({
    getValue: (row: SurveyResponseRecord) => String(row[name] ?? ""),
    key: `question:${name}`,
    title: name,
  })) ?? []),
  { isSortable: false, key: "actions", title: "" },
]);
// A response is keyed by its response id, which the table reads its rows by
const items = computed(() => records.value?.rows.map((row) => ({ ...row, id: row.responseId })) ?? []);
const itemsPerPage = ref(DATA_TABLE_ITEMS_PER_PAGE_OPTIONS[0]);
const page = ref(1);
const sortBy = ref<SortItem<string>[]>([]);
const { getContextMenuProps } = useContextMenu();
// A row opens its answers on a click, so its commands are what else there is to do with it
const getActionItems = (responseId: string): Item[] => [
  {
    meaning: UiIconMeaning.Show,
    onClick: () => {
      detailResponseId.value = responseId;
    },
    title: "View response",
  },
  {
    isDanger: true,
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      deletingResponseId.value = responseId;
    },
    title: "Delete response",
  },
];
// A cell's menu reads its commands from one map, so the list is not rebuilt for every row on every render
const actionItemsMap = computed(() => new Map(items.value.map(({ id: itemId }) => [itemId, getActionItems(itemId)])));
const truncation = computed(() => (records.value ? getDatasetTruncation(records.value) : undefined));

await refreshResponses();
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-body>
    <UiErrorState v-if="error" :error @retry="refreshResponses()" />
    <template v-else>
      <!-- Responses are the one dataset the owner reads as a record of truth, so a silent cut is never acceptable -->
      <DatasetTruncationAlert v-if="truncation" :truncation />
      <UiTabs v-model="view" :items="viewItems" label="How the responses are shown">
        <template #default="{ value: responseView }">
          <template v-if="responseView === SurveyResponseView.Summary">
            <UiErrorState v-if="summaryError" :error="summaryError" @retry="refreshResponses()" />
            <UiEmptyState v-else-if="items.length === 0" :="emptyStateAttributes" />
            <div v-else flex flex-col gap-4>
              <ResourceSurveyResponseSummaryCard
                v-for="card of summaryCards"
                :key="card.name"
                :card
                @show-individual="view = SurveyResponseView.Individual"
              />
            </div>
          </template>
          <UiDataTable
            v-else
            v-model:items-per-page="itemsPerPage"
            v-model:page="page"
            v-model:sort-by="sortBy"
            :columns="tableColumns"
            :get-item-title="({ id }) => `response ${id}`"
            :get-row-props="
              (item) => getContextMenuProps(item.id, () => actionItemsMap.get(item.id) ?? NO_ACTION_ITEMS)
            "
            :items
            :items-per-page-options="DATA_TABLE_ITEMS_PER_PAGE_OPTIONS"
            label="Responses"
            :on-open="({ id: responseId }) => (detailResponseId = responseId)"
          >
            <template #cell="{ column, item, value }">
              <!-- The cell is the menu's, so a click that misses its button does not open the response -->
              <div v-if="column.key === 'actions'" data-nested-interaction="true" flex justify-end>
                <UiOverflowMenu :items="actionItemsMap.get(item.id) ?? NO_ACTION_ITEMS" label="Response actions" />
              </div>
              <template v-else>{{ value }}</template>
            </template>
            <template #empty>
              <UiEmptyState :="emptyStateAttributes" />
            </template>
          </UiDataTable>
        </template>
      </UiTabs>
      <ResourceSurveyResponseDetailDialog :columns="records?.columns ?? []" :items="records?.rows ?? []" />
      <ResourceSurveyResponseDeleteDialog :survey-id="id" @delete="refreshResponses()" />
    </template>
  </div>
</template>
