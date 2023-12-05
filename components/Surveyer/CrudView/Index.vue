<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { surveyerHeaders } from "@/services/surveyer/headers";
import { useSurveyStore } from "@/store/surveyer/survey";

const { status } = useAuth();
const readMoreSurveys = await useReadSurveys();
const surveyerStore = useSurveyStore();
const { surveyList, searchQuery } = storeToRefs(surveyerStore);
</script>

<template>
  <v-container h-full flex flex-col fluid>
    <StyledDataTableServer
      v-if="status === 'authenticated'"
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
    <StyledDataTable
      v-else-if="status === 'unauthenticated'"
      flex
      flex-1
      flex-col
      height="100%"
      :headers="surveyerHeaders"
      :items="surveyList"
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
      :group-by="[{ key: 'group', order: 'asc' }]"
      @click:row="(_, { item }) => navigateTo(RoutePath.Survey(item.rowKey))"
    >
      <template #top>
        <SurveyerCrudViewHeader />
      </template>
      <template #[`item.actions`]="{ item }">
        <SurveyerCrudViewActionSlot :item="item" />
      </template>
    </StyledDataTable>
  </v-container>
</template>
