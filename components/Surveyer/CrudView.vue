<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import type { SurveyEntity } from "@/models/surveyer/SurveyEntity";
import { surveyerHeaders } from "@/services/surveyer/headers";
import { useSurveyStore } from "@/store/surveyer/survey";

type SurveyItem = { raw: SurveyEntity };

const readMoreSurveys = await useReadSurveys();
const surveyerStore = useSurveyStore();
const { surveyList, searchQuery } = storeToRefs(surveyerStore);
</script>

<template>
  <v-container h="full" display="flex" flex="col" fluid>
    <StyledDataTable
      display="flex"
      flex="1 col"
      height="100%"
      :headers="surveyerHeaders"
      :items="surveyList"
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
      :group-by="[{ key: 'group', order: 'asc' }]"
      @click:row="(_, { item }) => navigateTo(RoutePath.Survey(item.raw.rowKey))"
    >
      <template #top>
        <SurveyerCrudViewHeader />
      </template>
      <template #[`item.actions`]="{ item }">
        <SurveyerChangeGroupDialogButton :survey="(item as SurveyItem).raw" />
        <SurveyerCloneSurveyDialogButton
          :name="(item as SurveyItem).raw.name"
          :group="(item as SurveyItem).raw.group"
          :model="(item as SurveyItem).raw.model"
        />
        <SurveyerDeleteSurveyDialogButton :row-key="(item as SurveyItem).raw.rowKey" />
      </template>
    </StyledDataTable>
  </v-container>
</template>
