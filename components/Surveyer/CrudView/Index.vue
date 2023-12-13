<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { surveyerHeaders } from "@/services/surveyer/headers";
import { useSurveyStore } from "@/store/surveyer/survey";

const readMoreSurveys = await useReadSurveys();
const surveyerStore = useSurveyStore();
const { surveyList, searchQuery } = storeToRefs(surveyerStore);
</script>

<template>
  <v-container h-full flex flex-col fluid>
    <StyledDataTableServer
      flex
      flex-1
      flex-col
      height="100%"
      :headers="surveyerHeaders"
      :items="surveyList"
      :items-length="surveyList.length"
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
      :group-by="[{ key: 'group', order: 'asc' }]"
      @click:row="(_, { item }) => navigateTo(RoutePath.Survey(item.rowKey))"
      @update:options="readMoreSurveys"
    >
      <template #top>
        <SurveyerCrudViewHeader />
      </template>
      <template #[`item.actions`]="{ item }">
        <SurveyerCrudViewActionSlot :item="item" />
      </template>
    </StyledDataTableServer>
  </v-container>
</template>
