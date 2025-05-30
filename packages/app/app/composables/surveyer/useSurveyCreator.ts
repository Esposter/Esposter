import type { Survey } from "#shared/db/schema/surveys";
import type { Base, ImageItemValue } from "survey-core";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { downloadJsonFile } from "@/services/file/downloadJsonFile";
import { uploadJsonFile } from "@/services/file/uploadJsonFile";
import { validateFile } from "@/services/file/validateFile";
import { useSurveyStore } from "@/store/surveyer/survey";
import { Action, ComputedUpdater, QuestionImageModel, QuestionImagePickerModel } from "survey-core";
import { LogoImageViewModel, SurveyCreatorModel } from "survey-creator-core";
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
      if (creator.text === survey.model) {
        callback(saveNo, true);
        return;
      }

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
  const deleteFile = useDeleteFile(survey.id);

  creator.onUploadFile.add(async (_, { callback, element, files, propertyName }) => {
    const file = files[0];

    if (!validateFile(file.size)) {
      useEmptyFileToast();
      callback("error");
      return;
    }

    try {
      const { id, sasUrl } = (
        await $trpc.survey.generateUploadFileSasEntities.query({
          files: [{ filename: file.name, mimetype: file.type }],
          surveyId: survey.id,
        })
      )[0];
      await uploadBlocks(file, sasUrl);

      const oldDownloadFileSasUrl = (element as Base).getPropertyValue(propertyName.toString());
      if (oldDownloadFileSasUrl) await deleteFile(oldDownloadFileSasUrl);

      const downloadFileSasUrl = (
        await $trpc.survey.generateDownloadFileSasUrls.query({
          files: [{ filename: file.name, id, mimetype: file.type }],
          surveyId: survey.id,
        })
      )[0];
      callback("success", downloadFileSasUrl);
    } catch {
      callback("error");
    }
  });
  // Add all the possible delete file events
  LogoImageViewModel.prototype.remove = getSynchronizedFunction(async (model: LogoImageViewModel) => {
    const url = model.survey.logo;
    model.survey.logo = "";
    await deleteFile(url);
  });
  creator.onCollectionItemDeleting.add(async (_, { item }: { item: ImageItemValue }) => {
    if (!item.imageLink) return;
    await deleteFile(item.imageLink);
  });
  creator.onElementDeleting.add(async (_, { element }) => {
    if (element instanceof QuestionImageModel) {
      if (!element.imageLink) return;
      await deleteFile(element.imageLink);
      return;
    }

    if (element instanceof QuestionImagePickerModel) {
      for (const item of element.choices as ImageItemValue[]) {
        if (!item.imageLink) continue;
        await deleteFile(item.imageLink);
      }
      return;
    }
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
