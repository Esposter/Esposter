<script setup lang="ts">
import type { Survey } from "@esposter/db-schema";

interface CloneSurveyDialogButton {
  group: Survey["group"];
  model: Survey["model"];
  name: Survey["name"];
}

const { group, model, name } = defineProps<CloneSurveyDialogButton>();
</script>

<template>
  <SurveyCreateSurveyDialog :initial-value="{ name, group, model }" :card-props="{ title: 'Clone Survey' }">
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ class: 'm-0', size: 'small', tile: true }"
        icon="mdi-file-multiple"
        text="Clone Survey"
        @click.stop="updateIsOpen(true)"
      />
    </template>
  </SurveyCreateSurveyDialog>
</template>
