<script setup lang="ts">
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync } from "@esposter/shared";

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { updateRootProps } = useSurveyCreatorCommands();
const { upload } = useSurveyFiles();
const rootProps = computed(() => surveyDocument.value.root.props);
const themeStyle = useSurveyTheme(rootProps);
// The logo is uploaded as it is picked, and its url written to the survey's root once the upload lands
const onPickLogo = async (files: File[]) => {
  const [file] = files;
  if (!file) return;

  const uploadResult = await getResultAsync(() => upload(file));
  uploadResult.match((url) => {
    if (url) updateRootProps({ logo: url });
  }, createErrorAlert);
};
</script>

<template>
  <div flex flex-col gap-6>
    <div flex flex-col gap-2>
      <UiFileField accept="image/*" label="Logo" :model-value="[]" @update:model-value="(files) => onPickLogo(files)" />
      <UiButton v-if="rootProps.logo" @click="updateRootProps({ logo: '' })">Remove logo</UiButton>
    </div>
    <div flex flex-col gap-2>
      <UiColorField
        label="Accent colour"
        :model-value="rootProps.accentColor"
        @update:model-value="(accentColor) => updateRootProps({ accentColor })"
      />
      <UiButton v-if="rootProps.accentColor" @click="updateRootProps({ accentColor: '' })">
        Clear accent colour
      </UiButton>
    </div>
    <div flex flex-col gap-2>
      <UiColorField
        label="Background colour"
        :model-value="rootProps.backgroundColor"
        @update:model-value="(backgroundColor) => updateRootProps({ backgroundColor })"
      />
      <UiButton v-if="rootProps.backgroundColor" @click="updateRootProps({ backgroundColor: '' })">
        Clear background colour
      </UiButton>
    </div>
    <!-- The preview draws with the survey's own colours, so it shows what a respondent will see of them -->
    <section :style="themeStyle" aria-label="Preview" ui-body flex flex-col gap-4 p-4 bg-background text-text>
      <p ui-heading>{{ rootProps.title }}</p>
      <UiButton :variant="UiButtonVariant.Accent">Next</UiButton>
    </section>
  </div>
</template>
