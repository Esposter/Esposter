<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import type { Survey } from "@/models/surveyer/Survey";
import { surveyerHeaders } from "@/services/surveyer/headers";
import { useSurveyerStore } from "@/store/surveyer";
import dayjs from "dayjs";

type SurveyItem = { raw: Survey };

const surveyerStore = useSurveyerStore();
const { deleteSurvey } = surveyerStore;
const { surveyerConfiguration, searchQuery } = storeToRefs(surveyerStore);
</script>

<template>
  <v-container h="full" display="flex" flex="col" fluid>
    <StyledDataTable
      display="flex"
      flex="1 col"
      height="100%"
      :headers="surveyerHeaders"
      :items="surveyerConfiguration"
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
      :group-by="[{ key: 'group', order: 'asc' }]"
      @click:row="(_, { item }) => navigateTo(RoutePath.Survey(item.raw.id))"
    >
      <template #top>
        <SurveyerCrudViewHeader />
      </template>
      <template #[`item.createdAt`]="{ item }">
        {{ dayjs((item as SurveyItem).raw.createdAt).format("ddd, MMM D, YYYY h:mm A") }}
      </template>
      <template #[`item.updatedAt`]="{ item }">
        {{ dayjs((item as SurveyItem).raw.updatedAt).format("ddd, MMM D, YYYY h:mm A") }}
      </template>
      <template #[`item.actions`]="{ item }">
        <SurveyerChangeGroupDialogButton :survey="(item as SurveyItem).raw" />
        <StyledConfirmDeleteDialogButton
          :card-props="{
            title: 'Delete Survey',
            text: 'Are you sure you want to delete this survey?',
          }"
          @delete="
            (onComplete) => {
              deleteSurvey((item as SurveyItem).raw.id);
              onComplete();
            }
          "
        />
      </template>
    </StyledDataTable>
  </v-container>
</template>
