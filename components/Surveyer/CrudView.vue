<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import type { Survey } from "@/models/surveyer/Survey";
import { surveyerHeaders } from "@/services/surveyer/headers";
import { useSurveyerStore } from "@/store/surveyer";
import dayjs from "dayjs";

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
      <template #[`item.createdAt`]="{ item }">
        {{ dayjs((item.raw as Survey).createdAt).format("ddd, MMM D, YYYY h:mm A") }}
      </template>
      <template #[`item.updatedAt`]="{ item }">
        {{ dayjs((item.raw as Survey).updatedAt).format("ddd, MMM D, YYYY h:mm A") }}
      </template>
    </StyledDataTable>
  </v-container>
</template>
