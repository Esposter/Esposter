<script setup lang="ts">
import { DEFAULT_CLOSED_MESSAGE, MAX_CLOSED_MESSAGE_LENGTH } from "#shared/services/resource/survey/constants";
import { SurveyResponseModeItemCategoryDefinitions } from "#src/services/resource/survey/SurveyResponseModeItemCategoryDefinitions";
import { useSurveyStore } from "#src/store/survey/index";
import { SurveyResponseMode } from "@esposter/db-schema";
import { toRawDeep } from "@esposter/shared";

const surveyStore = useSurveyStore();
const { saveSettings } = surveyStore;
const { settings } = storeToRefs(surveyStore);
// Edited on a local copy that follows the store's settings, so a refused save the store rolls back brings the copy
// Back with it. The store ref hands over a reactive proxy, which structuredClone refuses outright — unwrap it first
const { cloned: editedSettings } = useCloned(settings, { clone: (source) => structuredClone(toRawDeep(source)) });
const save = () => {
  saveSettings(structuredClone(toRawDeep(editedSettings.value)));
};
</script>

<template>
  <section flex flex-col gap-4>
    <h2 ui-heading>Collection</h2>
    <UiSwitch
      v-model="editedSettings.isAcceptingResponses"
      is-label-shown
      label="Accepting responses"
      @update:model-value="save()"
    />
    <!-- Saved as the field is left, not per keystroke -->
    <UiTextField
      v-if="!editedSettings.isAcceptingResponses"
      v-model="editedSettings.closedMessage"
      :counter="MAX_CLOSED_MESSAGE_LENGTH"
      label="Closed message"
      :placeholder="DEFAULT_CLOSED_MESSAGE"
      :rows="2"
      @focusout="save()"
    />
    <div flex flex-col gap-1>
      <span text-sm text-muted>Response mode</span>
      <div w-64>
        <UiSelect
          v-model="editedSettings.responseMode"
          :items="SurveyResponseModeItemCategoryDefinitions"
          label="Response mode"
          @update:model-value="save()"
        />
      </div>
      <!-- Modes are collection-time postures, not privacy promises about the answers themselves -->
      <p text-sm text-muted>
        {{
          editedSettings.responseMode === SurveyResponseMode.Identified
            ? "Only participants holding a link from a program can answer, and you can see who said what."
            : "Anyone with the link can answer and you structurally cannot tell who said what."
        }}
      </p>
    </div>
  </section>
</template>
