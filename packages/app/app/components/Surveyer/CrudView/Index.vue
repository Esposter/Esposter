<script setup lang="ts">
import type { Survey } from "#shared/db/schema/surveys";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { RoutePath } from "#shared/models/router/RoutePath";
import { SurveyerHeaders } from "@/services/surveyer/SurveyerHeaders";
import { useSurveyStore } from "@/store/surveyer/survey";

const { isLoading, readMoreSurveys } = await useReadSurveys();
const surveyerStore = useSurveyStore();
const { searchQuery, surveys, totalItemsLength } = storeToRefs(surveyerStore);
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
        headers: SurveyerHeaders,
        items: surveys,
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
      @update:options="readMoreSurveys"
    >
      <template #top>
        <SurveyerCrudViewHeader />
      </template>
      <template #[`item.actions`]="{ item }">
        <SurveyerCrudViewActionSlot :item />
      </template>
    </StyledDataTableServer>
  </v-container>
</template>
