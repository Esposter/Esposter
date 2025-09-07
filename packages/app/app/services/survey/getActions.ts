import type { Survey } from "#shared/db/schema/surveys";
import type { SurveyCreatorModel } from "survey-creator-core";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { downloadJsonFile } from "@/services/file/downloadJsonFile";
import { uploadJsonFile } from "@/services/file/uploadJsonFile";
import { Action, ComputedUpdater } from "survey-core";

export const getActions = (survey: Ref<Survey>, creator: SurveyCreatorModel, dialog: Ref<boolean>): Action[] => [
  new Action({
    action: getSynchronizedFunction(async () => {
      await uploadJsonFile(async (file) => {
        creator.text = await file.text();
      });
    }),
    iconName: "icon-import-24x24",
    id: "upload-survey",
    tooltip: "Import",
    visible: new ComputedUpdater(() => creator.activeTab === "designer"),
  }),
  new Action({
    action: () => {
      downloadJsonFile(survey.value.name, creator.JSON);
    },
    iconName: "icon-download-24x24",
    id: "download-survey",
    tooltip: "Export",
    visible: new ComputedUpdater(() => creator.activeTab === "designer"),
  }),
  new Action({
    action: () => {
      dialog.value = true;
    },
    iconName: "icon-publish-24x24",
    id: "publish-survey",
    tooltip: "Publish",
    visible: new ComputedUpdater(() => ["designer", "theme"].includes(creator.activeTab)),
  }),
  new Action({
    action: () => {
      creator.JSON = {};
    },
    iconName: "icon-clear-24x24",
    id: "clear-survey",
    tooltip: "Clear",
    visible: new ComputedUpdater(() => creator.activeTab === "designer"),
  }),
];
