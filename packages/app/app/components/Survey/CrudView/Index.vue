<script setup lang="ts">
import type { Survey } from "@esposter/db";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { RoutePath } from "#shared/models/router/RoutePath";
import { SurveyHeaders } from "@/services/survey/SurveyHeaders";
import { useSurveyStore } from "@/store/survey";

const { isLoading, readSurveys } = useReadSurveys();
const surveyStore = useSurveyStore();
const { items, searchQuery, totalItemsLength } = storeToRefs(surveyStore);
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
        itemsLength: totalItemsLength,
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
