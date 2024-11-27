<script setup lang="ts">
import type { Survey } from "@/shared/db/schema/surveys";

interface CloneSurveyDialogButton {
  group: Survey["group"];
  model: Survey["model"];
  name: Survey["name"];
}

const { group, model, name } = defineProps<CloneSurveyDialogButton>();
</script>

<template>
  <SurveyerCreateSurveyDialog :initial-value="{ name, group, model }" :card-props="{ title: 'Clone Survey' }">
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Clone Survey">
        <template #activator="{ props: activatorProps }">
          <v-btn
            m-0="!"
            rd-none="!"
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
