<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { surveyerHeaders } from "@/services/surveyer/headers";
import { useSurveyerStore } from "@/store/surveyer";

const surveyerStore = useSurveyerStore();
const { surveyerConfiguration, searchQuery } = storeToRefs(surveyerStore);
const surveys = computed(() => surveyerConfiguration.value?.map((s) => s.survey) ?? []);
</script>

<template>
  <v-container h="full" display="flex" flex="col" fluid>
    <StyledDataTable
      display="flex"
      flex="1 col"
      height="100%"
      :headers="surveyerHeaders"
      :items="surveys"
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
      @click:row="(_, { item }) => navigateTo(RoutePath.Survey(item.raw.id))"
    >
      <template #top>
        <SurveyerCrudViewHeader />
      </template>
    </StyledDataTable>
  </v-container>
</template>
