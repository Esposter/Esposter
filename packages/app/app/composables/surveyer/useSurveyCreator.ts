import type { Survey } from "#shared/db/schema/surveys";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { downloadJsonFile } from "@/services/file/downloadJsonFile";
import { uploadJsonFile } from "@/services/file/uploadJsonFile";
import { validateFile } from "@/services/file/validateFile";
import { useSurveyStore } from "@/store/surveyer/survey";
import { Action, ComputedUpdater } from "survey-core";
import { SurveyCreatorModel } from "survey-creator-core";
import { DefaultDark, SC2020 } from "survey-creator-core/themes";

export const useSurveyCreator = (survey: Survey) => {
  const surveyerStore = useSurveyStore();
  const { updateSurveyModel } = surveyerStore;
  const creator = new SurveyCreatorModel({ autoSaveEnabled: true, showTranslationTab: true });
  const dialog = ref(false);
  const actions = [
    new Action({
      action: getSynchronizedFunction(async () => {
        await uploadJsonFile(async (file) => {
          creator.text = await file.text();
        });
      }),
      iconName: "icon-import-24x24",
      id: "upload-survey",
      tooltip: "Upload Survey",
      visible: new ComputedUpdater(() => creator.activeTab === "designer"),
    }),
    new Action({
      action: () => {
        downloadJsonFile(survey.name, creator.JSON);
      },
      iconName: "icon-download-24x24",
      id: "download-survey",
      tooltip: "Download Survey",
      visible: new ComputedUpdater(() => creator.activeTab === "designer"),
    }),
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
        await updateSurveyModel({ id: survey.id, model: creator.text, modelVersion: survey.modelVersion }),
      );
      callback(saveNo, true);
    } catch {
      callback(saveNo, false);
    }
  };

  const { $trpc } = useNuxtApp();
  creator.onUploadFile.add(async (_, { files }) => {
    if (!files.every(({ size }) => validateFile(size))) {
      useEmptyFileToast();
      return;
    }

    const fileSasEntities = await $trpc.survey.generateUploadFileSasEntities.query({
      files: files.map(({ name, type }) => ({ filename: name, mimetype: type })),
      surveyId: survey.id,
    });
    await Promise.all(
      files.map(async (file, index) => {
        const { sasUrl } = fileSasEntities[index];
        await uploadBlocks(file, sasUrl);
      }),
    );
  });

  const isDark = useIsDark();

  watch(
    isDark,
    (newIsDark) => {
      if (newIsDark) creator.applyCreatorTheme(DefaultDark);
      else creator.applyCreatorTheme(SC2020);
    },
    { immediate: true },
  );

  return { creator, dialog };
};
