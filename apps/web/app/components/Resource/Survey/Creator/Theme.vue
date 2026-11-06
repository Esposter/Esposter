<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { SurveyProgressBarPlacement } from "vue-survey-engine-headless";

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { updateRootProps } = useSurveyCreatorCommands();
const { uploadPicked } = useSurveyFiles();
const rootProps = computed(() => surveyDocument.value.root.props);
const themeStyle = useSurveyTheme(rootProps);
// The logo is uploaded as it is picked, and its url written to the survey's root once the upload lands
const onPickLogo = (files: File[]) => uploadPicked(files, (logo) => updateRootProps({ logo }));
// The places the progress bar can be drawn, each named as the owner reads it
const progressBarItems: UiMenuItem<SurveyProgressBarPlacement>[] = [
  { title: "No progress bar", value: SurveyProgressBarPlacement.Off },
  { title: "Top of the survey", value: SurveyProgressBarPlacement.Top },
  { title: "Bottom of the survey", value: SurveyProgressBarPlacement.Bottom },
];
</script>

<template>
  <div flex flex-col gap-4>
    <div flex flex-col gap-2>
      <UiFileField accept="image/*" label="Logo" :model-value="[]" @update:model-value="(files) => onPickLogo(files)" />
      <UiButton :disabled="!rootProps.logo" @click="updateRootProps({ logo: '' })">Remove logo</UiButton>
    </div>
    <div flex flex-col gap-2>
      <UiColorField
        label="Accent colour"
        :model-value="rootProps.accentColor"
        @update:model-value="(accentColor) => updateRootProps({ accentColor })"
      />
      <UiButton :disabled="!rootProps.accentColor" @click="updateRootProps({ accentColor: '' })">
        Clear accent colour
      </UiButton>
    </div>
    <div flex flex-col gap-2>
      <UiColorField
        label="Background colour"
        :model-value="rootProps.backgroundColor"
        @update:model-value="(backgroundColor) => updateRootProps({ backgroundColor })"
      />
      <UiButton :disabled="!rootProps.backgroundColor" @click="updateRootProps({ backgroundColor: '' })">
        Clear background colour
      </UiButton>
    </div>
    <div flex flex-col gap-2>
      <UiSelect
        :items="progressBarItems"
        label="Progress bar"
        :model-value="rootProps.showProgressBar"
        @update:model-value="(showProgressBar) => updateRootProps({ showProgressBar })"
      />
      <UiSwitch
        :model-value="rootProps.isQuestionNumbersVisible"
        is-label-shown
        label="Show question numbers"
        @update:model-value="(isQuestionNumbersVisible) => updateRootProps({ isQuestionNumbersVisible })"
      />
    </div>
    <!-- The preview draws with the survey's own colours, so it shows what a respondent will see of them -->
    <section :style="themeStyle" aria-label="Preview" text-text p-4 bg-background flex flex-col gap-4 ui-body>
      <p ui-heading>{{ rootProps.title }}</p>
      <UiButton :variant="UiButtonVariant.Accent">Next</UiButton>
    </section>
  </div>
</template>
