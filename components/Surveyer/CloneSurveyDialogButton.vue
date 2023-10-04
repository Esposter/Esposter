<script setup lang="ts">
import type { SurveyEntity } from "@/models/surveyer/SurveyEntity";

interface CloneSurveyDialogButton {
  name: SurveyEntity["name"];
  group: SurveyEntity["group"];
  model: SurveyEntity["model"];
}

const { name, group, model } = defineProps<CloneSurveyDialogButton>();
</script>

<template>
  <SurveyerCreateSurveyDialog :initial-value="{ name, group, model }" :card-props="{ title: 'Clone Survey' }">
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Clone Survey">
        <template #activator="{ props: activatorProps }">
          <v-btn
            m-0="!"
            rd-0="!"
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
