import type { Survey } from "@esposter/db-schema";
import type { SurveyCreatorModel } from "survey-creator-core";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { Action, ComputedUpdater } from "survey-core";

export const getActions = (
  survey: Ref<Survey>,
  creator: SurveyCreatorModel,
  dialog: Ref<boolean>,
  importJsonFile: (onSelect: (file: File) => Promise<void>) => Promise<void>,
  exportJsonFile: (fileName: string, data: string | unknown) => Promise<void>,
): Action[] => [
  new Action({
    action: getSynchronizedFunction(async () => {
      await importJsonFile(async (file) => {
        creator.text = await file.text();
      });
    }),
    iconName: "icon-import-24x24",
    id: "upload-survey",
    tooltip: "Import",
    visible: new ComputedUpdater(() => creator.activeTab === "designer"),
  }),
  new Action({
    action: async () => {
      await exportJsonFile(survey.value.name, creator.JSON);
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
