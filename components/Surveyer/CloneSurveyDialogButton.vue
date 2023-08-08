<script setup lang="ts">
import { Survey } from "@/models/surveyer/Survey";

interface CloneSurveyDialogButton {
  group: Survey["group"];
  model: Survey["model"];
}

const props = defineProps<CloneSurveyDialogButton>();
</script>

<template>
  <SurveyerCreateSurveyDialog :initial-value="new Survey(props)" :card-props="{ title: 'Clone Survey' }">
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Clone Survey">
        <template #activator="{ props: activatorProps }">
          <v-btn
            m="0!"
            rd="0!"
            icon="mdi-file-multiple"
            size="small"
            :="activatorProps"
            @click.stop="updateIsOpen(true)"
          />
        </template>
      </v-tooltip>
    </template>
  </SurveyerCreateSurveyDialog>
</template>
