<script setup lang="ts">
import type { SurveyEntity } from "@/models/surveyer/SurveyEntity";

interface SurveyerCrudViewActionSlotProps {
  item: SurveyEntity;
}

const { item } = defineProps<SurveyerCrudViewActionSlotProps>();
</script>

<template>
  <SurveyerChangeGroupDialogButton :survey="item" />
  <SurveyerCloneSurveyDialogButton :name="item.name" :group="item.group" :model="item.model" />
  <SurveyerDeleteSurveyDialogButton :row-key="item.rowKey" />
</template>
