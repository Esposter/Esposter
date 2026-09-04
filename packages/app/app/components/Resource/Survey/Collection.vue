<script setup lang="ts">
import { DEFAULT_CLOSED_MESSAGE, MAX_CLOSED_MESSAGE_LENGTH } from "#shared/services/resource/survey/constants";
import { SurveyResponseModeItemCategoryDefinitions } from "@/services/resource/survey/SurveyResponseModeItemCategoryDefinitions";
import { useSurveyStore } from "@/store/survey";
import { SurveyResponseMode } from "@esposter/db-schema";
import { toRawDeep } from "@esposter/shared";

const surveyStore = useSurveyStore();
const { saveSettings } = surveyStore;
const { settings } = storeToRefs(surveyStore);
// Edited on a local copy so a failed save leaves the store showing what the server still has.
// The store ref hands over a reactive proxy, which structuredClone refuses outright — unwrap it first
const { cloned: editedSettings, sync: resetSettings } = useCloned(settings, {
  clone: (source) => structuredClone(toRawDeep(source)),
});
const isPending = ref(false);
const save = async () => {
  isPending.value = true;
  const isSuccessful = await saveSettings(structuredClone(toRawDeep(editedSettings.value)));
  if (!isSuccessful) resetSettings();
  isPending.value = false;
};
</script>

<template>
  <span text-h6>Collection</span>
  <v-card>
    <v-card-text flex flex-col gap-4>
      <v-switch
        v-model="editedSettings.isAcceptingResponses"
        label="Accepting responses"
        :disabled="isPending"
        @update:model-value="save"
      />
      <v-textarea
        v-if="!editedSettings.isAcceptingResponses"
        v-model="editedSettings.closedMessage"
        label="Closed message"
        :placeholder="DEFAULT_CLOSED_MESSAGE"
        :counter="MAX_CLOSED_MESSAGE_LENGTH"
        :disabled="isPending"
        rows="2"
        auto-grow
        persistent-placeholder
        @blur="save"
      />
      <v-select
        v-model="editedSettings.responseMode"
        max-width="16rem"
        :items="SurveyResponseModeItemCategoryDefinitions"
        label="Response mode"
        :disabled="isPending"
        @update:model-value="save"
      />
      <!-- Modes are collection-time postures, not privacy promises about the answers themselves -->
      <span text-caption op-medium-emphasis>
        {{
          editedSettings.responseMode === SurveyResponseMode.Identified
            ? "Only participants holding a link from a program can answer, and you can see who said what."
            : "Anyone with the link can answer and you structurally cannot tell who said what."
        }}
      </span>
    </v-card-text>
  </v-card>
</template>
