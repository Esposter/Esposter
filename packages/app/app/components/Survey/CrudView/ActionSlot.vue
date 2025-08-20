<script setup lang="ts">
import type { Survey } from "#shared/db/schema/surveys";

interface CrudViewActionSlotProps {
  item: Survey;
}

const { item } = defineProps<CrudViewActionSlotProps>();
</script>

<template>
  <SurveyChangeGroupDialogButton :survey="item" />
  <SurveyCloneSurveyDialogButton :name="item.name" :group="item.group" :model="item.model" />
  <SurveyDeleteSurveyDialogButton :id="item.id" />
</template>
