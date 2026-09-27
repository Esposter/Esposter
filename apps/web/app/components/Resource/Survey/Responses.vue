<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { SurveyResponseRecord } from "#shared/models/resource/survey/SurveyResponseRecord";
import type { SurveyResponseRecords } from "#shared/models/resource/survey/SurveyResponseRecords";
import type { Item } from "@/models/shared/Item";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import type { SurveySummaryCard } from "@/models/resource/survey/SurveySummaryCard";
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { SurveyResponseView } from "@/models/resource/survey/SurveyResponseView";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { THEME_KEY } from "@/services/survey/constants";
import { getSurveySummaryCards } from "@/services/survey/summary/getSurveySummaryCards";
import { DATA_TABLE_ITEMS_PER_PAGE_OPTIONS } from "@/services/ui/constants";
import { useSurveyResponseDialogStore } from "@/store/resource/surveyResponseDialog";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { getResultAsync } from "@esposter/shared";
import { Model } from "survey-core";

const { currentRoute } = useRouter();
const { $trpc } = useNuxtApp();
const surveyResponseDialogStore = useSurveyResponseDialogStore();
const { deletingRowKey, detailRowKey } = storeToRefs(surveyResponseDialogStore);
// The blade is keyed by resource id and suspended, so this instance only ever serves one survey
const id = getRouteParamString(currentRoute.value.params.id);
const records = ref<SurveyResponseRecords>();
const summaryCards = ref<SurveySummaryCard[]>([]);
const error = ref("");
const view = ref(SurveyResponseView.Summary);
const viewItems: UiTabItem<SurveyResponseView>[] = Object.values(SurveyResponseView).map((value) => ({
  title: value,
  value,
}));
// Rows arrive already carrying their keys from one server read, so a response submitted or deleted
// Between reads can never associate a row with another response's key. The survey itself is read beside them, for
// The questions the summary is drawn by: their kinds, titles and choice labels, as the respondent page reads them
const refreshResponses = async () => {
  await getResultAsync(() =>
    Promise.all([$trpc.survey.readSurveyResponseRecords.query({ id }), $trpc.survey.readResourceContent.query({ id })]),
  ).match(
    ([newRecords, content]) => {
      records.value = newRecords;
      const { [THEME_KEY]: _theme, ...surveyModel } = parseSurveyModel(content?.model ?? "");
      const columnNames = new Set(newRecords.columns.map(({ name }) => name));
      const questions = new Model(surveyModel).getAllQuestions().filter(({ name }) => columnNames.has(name));
      summaryCards.value = getSurveySummaryCards(questions, newRecords.rows);
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
const getActionItems = (rowKey: string): Item[] => [
  {
    meaning: UiIconMeaning.Show,
    onClick: () => {
      detailRowKey.value = rowKey;
    },
    title: "View response",
  },
  {
    isDanger: true,
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
      <UiTabs v-model="view" :items="viewItems" label="How the responses are shown">
        <template #default="{ value: responseView }">
          <template v-if="responseView === SurveyResponseView.Summary">
            <UiEmptyState
              v-if="items.length === 0"
              description="Answers appear here as participants submit the survey"
              :meaning="UiIconMeaning.Comment"
              title="No responses yet"
            />
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
            :get-row-props="(item) => getContextMenuProps(item.id, () => getActionItems(item.id))"
            :items
            :items-per-page-options="DATA_TABLE_ITEMS_PER_PAGE_OPTIONS"
            label="Responses"
            :on-open="({ id: rowKey }) => (detailRowKey = rowKey)"
          >
            <template #cell="{ column, item, value }">
              <!-- The cell is the menu's, so a click that misses its button does not open the response -->
              <div v-if="column.key === 'actions'" data-nested-interaction="true" flex justify-end>
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
        </template>
      </UiTabs>
      <ResourceSurveyResponseDetailDialog :columns="records?.columns ?? []" :items="records?.rows ?? []" />
      <ResourceSurveyResponseDeleteDialog :survey-id="id" @delete="refreshResponses()" />
    </template>
  </div>
</template>
