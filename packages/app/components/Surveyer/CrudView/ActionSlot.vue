<script setup lang="ts">
import type { Survey } from "@/shared/db/schema/surveys";

interface SurveyerCrudViewActionSlotProps {
  item: Survey;
}

const { item } = defineProps<SurveyerCrudViewActionSlotProps>();
</script>

<template>
  <SurveyerChangeGroupDialogButton :survey="item" />
  <SurveyerCloneSurveyDialogButton :name="item.name" :group="item.group" :model="item.model" />
  <SurveyerDeleteSurveyDialogButton :id="item.id" />
</template>
