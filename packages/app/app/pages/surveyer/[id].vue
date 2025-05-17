<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { useSurveyStore } from "@/store/surveyer/survey";
import { Action, ComputedUpdater } from "survey-core";
import { SurveyCreatorModel } from "survey-creator-core";
import { DefaultDark, SC2020 } from "survey-creator-core/themes";

defineRouteRules({ ssr: false });
definePageMeta({ middleware: "auth", validate });

const { $trpc } = useNuxtApp();
const survey = reactive(await useReadSurveyFromRoute());
const surveyerStore = useSurveyStore();
const { updateSurvey } = surveyerStore;
const creator = new SurveyCreatorModel({ autoSaveEnabled: true, showTranslationTab: true });
const dialog = ref(false);
const actions = [
  new Action({
    action: () => {
      dialog.value = true;
    },
    iconName: "icon-publish-24x24",
    id: "publish-survey",
    tooltip: "Publish Survey",
    visible: new ComputedUpdater(() => creator.activeTab === "designer"),
  }),
  new Action({
    action: () => {
      creator.JSON = {};
    },
    iconName: "icon-clear-24x24",
    id: "clear-survey",
    tooltip: "Clear Survey",
    visible: new ComputedUpdater(() => creator.activeTab === "designer"),
  }),
];

for (const action of actions) {
  creator.toolbar.actions.push(action);
  creator.footerToolbar.actions.push(action);
}

creator.text = survey.model;
creator.saveSurveyFunc = async (saveNo: number, callback: Function) => {
  try {
    Object.assign(
      survey,
      await updateSurvey({ id: survey.id, model: creator.text, modelVersion: survey.modelVersion }, true),
    );
    callback(saveNo, true);
  } catch {
    callback(saveNo, false);
  }
};

const isDark = useIsDark();

watch(
  isDark,
  (newIsDark) => {
    if (newIsDark) creator.applyCreatorTheme(DefaultDark);
    else creator.applyCreatorTheme(SC2020);
  },
  { immediate: true },
);
</script>

<template>
  <NuxtLayout>
    <div h-full flex flex-col>
      <v-toolbar class="border-b-sm" color="surface">
        <v-toolbar-title px-4 font-bold>
          {{ survey.name }}
          <span class="text-gray text-lg">
            (Version: {{ survey.modelVersion }}, Published Version: {{ survey.publishVersion }})
          </span>
        </v-toolbar-title>
      </v-toolbar>
      <SurveyCreatorComponent flex-1 :model="creator" />
    </div>
    <StyledDialog
      v-model="dialog"
      :card-props="{ title: 'Publish Survey' }"
      :confirm-button-props="{ text: 'Publish' }"
      @submit="
        async () => {
          Object.assign(
            survey,
            await $trpc.survey.publishSurvey.mutate({ id: survey.id, publishVersion: survey.publishVersion }),
          );
          dialog = false;
        }
      "
    >
      <v-card-text class="text-error">
        You are about to publish your changes to <span font-bold>{{ survey.name }}</span
        >. This will cause all active surveys to use this version.
      </v-card-text>
    </StyledDialog>
  </NuxtLayout>
</template>

<style scoped lang="scss">
:deep(.svc-creator__banner) {
  display: none;
}
</style>
