import type { Base } from "survey-core";
import type { ThemeTabPlugin } from "survey-creator-core";

import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { THEME_KEY } from "@/services/survey/constants";
import { getActions } from "@/services/survey/getActions";
import { useResourceStore } from "@/store/resource";
import { useSurveyStore } from "@/store/survey";
import { ResourceType } from "@esposter/db-schema";
import { getPropertyNames, getResultAsync, noop, takeOne } from "@esposter/shared";
import { ImageItemValue, QuestionImageModel, QuestionImagePickerModel } from "survey-core";
import { LogoImageViewModel, SurveyCreatorModel } from "survey-creator-core";

export const useSurveyCreator = () => {
  const validateFile = useValidateFile();
  const resourceStore = useResourceStore();
  const { resource } = storeToRefs(resourceStore);
  const surveyStore = useSurveyStore();
  const { loadContent, saveModel } = surveyStore;
  const importJsonFile = useImportJsonFile();
  const exportJsonFile = useExportJsonFile();
  const getResourceId = () => resource.value?.id ?? "";
  const deleteFile = useDeleteResourceFile(ResourceType.Survey, getResourceId);
  // Every deletion hook below is handed a url the creator may never have set — a logo that was never
  // Uploaded, an image choice left blank — so the presence check belongs with the delete, not at each hook
  const deleteFileIfPresent = async (url: string | undefined) => {
    if (url) await deleteFile(url);
  };
  const uploadFile = useUploadResourceFile(ResourceType.Survey, getResourceId);
  const isDark = useIsDark();
  // The creator needs the loaded model at construction, so the blade renders a skeleton until it exists
  const creator = shallowRef<SurveyCreatorModel>();
  // Captured at setup so unmount can undo the global prototype patch — remounting would otherwise stack wrappers
  const removeLogoImage = LogoImageViewModel.prototype.remove;

  onMounted(async () => {
    await loadContent();
    const newCreator = new SurveyCreatorModel({ autoSaveEnabled: true, showThemeTab: true, showTranslationTab: true });
    const actions = getActions(newCreator, () => resource.value?.name ?? "", importJsonFile, exportJsonFile);

    for (const action of actions) {
      newCreator.toolbar.actions.push(action);
      newCreator.footerToolbar.actions.push(action);
    }

    const { [THEME_KEY]: theme, ...model } = parseSurveyModel(surveyStore.model);
    newCreator.JSON = model;
    if (theme) newCreator.theme = theme;
    // The creator autosaves on every editor change; the store's own dirty check is what drops the ones that
    // Changed nothing, so this reports whatever the shared save path answers rather than pre-filtering
    const save = async (saveNo: number, callback: (saveNo: number, isSuccessful: boolean) => void) => {
      callback(saveNo, await saveModel(JSON.stringify({ ...newCreator.JSON, [THEME_KEY]: newCreator.theme })));
    };
    newCreator.saveSurveyFunc = save;
    newCreator.saveThemeFunc = save;

    newCreator.onUploadFile.add(async (_creator, { callback, element, files, propertyName }) => {
      await getResultAsync(async () => {
        const file = takeOne(files);
        if (!validateFile(file)) {
          callback("error");
          return;
        }

        const url = await uploadFile(file);
        const previousUrl = (element as Base).getPropertyValue(propertyName.toString());
        if (previousUrl) await deleteFile(previousUrl);

        callback("success", url);
      }).match(noop, () => {
        callback("error");
      });
    });
    // Add all the possible delete file events
    LogoImageViewModel.prototype.remove = getSynchronizedFunction(async (logoViewModel: LogoImageViewModel) => {
      const url = logoViewModel.survey.logo;
      removeLogoImage(logoViewModel);
      await deleteFileIfPresent(url);
    });
    newCreator.themeEditor.themeModel.onPropertyChanged.add(async (_themeEditor, { name, newValue, oldValue }) => {
      if (name !== getPropertyNames<ThemeTabPlugin["themeModel"]>().backgroundImage || newValue) return;
      await deleteFileIfPresent(oldValue);
    });
    newCreator.onCollectionItemDeleting.add(async (_creator, { item }) => {
      if (item instanceof ImageItemValue) await deleteFileIfPresent(item.imageLink);
    });
    newCreator.onElementDeleting.add(async (_creator, { element }) => {
      if (element instanceof QuestionImageModel) await deleteFileIfPresent(element.imageLink);
      else if (element instanceof QuestionImagePickerModel)
        for (const item of element.choices as ImageItemValue[]) await deleteFileIfPresent(item.imageLink);
    });
    creator.value = newCreator;
  });

  onUnmounted(() => {
    LogoImageViewModel.prototype.remove = removeLogoImage;
  });

  watchImmediate([creator, isDark], ([newCreator, newIsDark]) => {
    if (newCreator) newCreator.preferredColorPalette = newIsDark ? "dark" : "light";
  });

  return { creator };
};
