<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { surveyerHeaders } from "@/services/surveyer/headers";
import { useSurveyStore } from "@/store/surveyer/survey";

const { isLoading, readMoreSurveys } = await useReadSurveys();
const surveyerStore = useSurveyStore();
const { searchQuery, surveys, totalItemsLength } = storeToRefs(surveyerStore);
</script>

<template>
  <v-container h-full flex flex-col fluid>
    <StyledDataTableServer
      flex
      flex-1
      flex-col
      :data-table-server-props="{
        height: '100%',
        headers: surveyerHeaders,
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
      @click:row="(_, { item }) => navigateTo(RoutePath.Survey(item.id))"
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
