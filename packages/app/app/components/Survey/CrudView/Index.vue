<script setup lang="ts">
import type { Survey } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { SurveyHeaders } from "@/services/survey/SurveyHeaders";
import { useSurveyStore } from "@/store/survey";
import { RoutePath } from "@esposter/shared";

const { isLoading, readSurveys } = useReadSurveys();
const surveyStore = useSurveyStore();
const { items, searchQuery, count } = storeToRefs(surveyStore);
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<Survey>) => navigateTo(RoutePath.Survey(item.id));
</script>

<template>
  <v-container h-full flex flex-col fluid>
    <StyledDataTableServer
      flex
      flex-1
      flex-col
      :data-table-server-props="{
        height: '100%',
        headers: SurveyHeaders,
        items,
        itemsLength: count,
        search: searchQuery,
        sortBy: [
          { key: 'name', order: 'asc' },
          { key: 'updatedAt', order: 'desc' },
        ],
        groupBy: [{ key: 'group', order: 'asc' }],
        loading: isLoading,
      }"
      @click:row="onClickRow"
      @update:options="readSurveys"
    >
      <template #top>
        <SurveyCrudViewHeader />
      </template>
      <template #[`item.actions`]="{ item }">
        <SurveyCrudViewActionSlot :item />
      </template>
    </StyledDataTableServer>
  </v-container>
</template>
