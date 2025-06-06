import type { Survey } from "#shared/db/schema/surveys";
import type { Base } from "survey-core";
import type { ThemeTabPlugin } from "survey-creator-core";

import { getPropertyNames } from "#shared/util/getPropertyNames";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { uploadBlocks } from "@/services/azure/container/uploadBlocks";
import { validateFile } from "@/services/file/validateFile";
import { THEME_KEY } from "@/services/surveyer/constants";
import { getActions } from "@/services/surveyer/getActions";
import { ImageItemValue, QuestionImageModel, QuestionImagePickerModel } from "survey-core";
import { LogoImageViewModel, SurveyCreatorModel } from "survey-creator-core";
import { DefaultDark, SC2020 } from "survey-creator-core/themes";

export const useSurveyCreator = (survey: Ref<Survey>) => {
  const creator = new SurveyCreatorModel({ autoSaveEnabled: true, showThemeTab: true, showTranslationTab: true });
  const dialog = ref(false);
  const actions = getActions(survey, creator, dialog);

  for (const action of actions) {
    creator.toolbar.actions.push(action);
    creator.footerToolbar.actions.push(action);
  }

  const { [THEME_KEY]: theme, ...model } = jsonDateParse(survey.value.model);
  creator.JSON = model;
  if (theme) creator.theme = theme;
  const save = useSave(survey, creator);
  creator.saveSurveyFunc = save;
  creator.saveThemeFunc = save;

  const { $trpc } = useNuxtApp();
  const deleteFile = useDeleteFile(survey.value.id);
  creator.onUploadFile.add(async (_creator, { callback, element, files, propertyName }) => {
    const file = files[0];

    if (!validateFile(file.size)) {
      useEmptyFileAlert();
      callback("error");
      return;
    }

    try {
      const { id, sasUrl } = (
        await $trpc.survey.generateUploadFileSasEntities.query({
          files: [{ filename: file.name, mimetype: file.type }],
          surveyId: survey.value.id,
        })
      )[0];
      await uploadBlocks(file, sasUrl);

      const oldDownloadFileSasUrl = (element as Base).getPropertyValue(propertyName.toString());
      if (oldDownloadFileSasUrl) await deleteFile(oldDownloadFileSasUrl);

      const downloadFileSasUrl = (
        await $trpc.survey.generateDownloadFileSasUrls.query({
          files: [{ filename: file.name, id, mimetype: file.type }],
          surveyId: survey.value.id,
        })
      )[0];
      callback("success", downloadFileSasUrl);
    } catch {
      callback("error");
    }
  });
  // Add all the possible delete file events
  const remove = LogoImageViewModel.prototype.remove;
  LogoImageViewModel.prototype.remove = getSynchronizedFunction(async (model: LogoImageViewModel) => {
    const url = model.survey.logo;
    remove(model);
    await deleteFile(url);
  });
  creator.themeEditor.themeModel.onPropertyChanged.add(async (_themeEditor, { name, newValue, oldValue }) => {
    if (name === getPropertyNames<ThemeTabPlugin["themeModel"]>().backgroundImage) {
      if (!newValue) await deleteFile(oldValue);
      return;
    }
  });
  creator.onCollectionItemDeleting.add(async (_creator, { item }) => {
    if (item instanceof ImageItemValue) {
      if (!item.imageLink) return;
      await deleteFile(item.imageLink);
      return;
    }
  });
  creator.onElementDeleting.add(async (_creator, { element }) => {
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
