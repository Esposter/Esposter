import type { SurveyCreatorModel } from "survey-creator-core";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { DESIGNER_TAB } from "@/services/survey/constants";
import { Action, ComputedUpdater } from "survey-core";

// Publish is owned by the explorer's generic publish toggle, so the creator toolbar only handles model I/O
export const getActions = (
  creator: SurveyCreatorModel,
  getName: () => string,
  importJsonFile: (onSelect: (file: File) => Promise<void>) => Promise<void>,
  exportJsonFile: (fileName: string, data: unknown) => Promise<void>,
): Action[] => {
  // Every model action edits the survey definition, so all three follow the designer tab. One updater per
  // Action rather than one shared instance — survey-core binds an updater to the action it was handed
  const createIsDesignerTab = () => new ComputedUpdater(() => creator.activeTab === DESIGNER_TAB);
  return [
    new Action({
      action: getSynchronizedFunction(async () => {
        await importJsonFile(async (file) => {
          creator.text = await file.text();
        });
      }),
      iconName: "icon-import-24x24",
      id: "upload-survey",
      tooltip: "Import",
      visible: createIsDesignerTab(),
    }),
    new Action({
      action: getSynchronizedFunction(async () => {
        await exportJsonFile(getName(), creator.JSON);
      }),
      iconName: "icon-download-24x24",
      id: "download-survey",
      tooltip: "Export",
      visible: createIsDesignerTab(),
    }),
    new Action({
      action: () => {
        creator.JSON = {};
      },
      iconName: "icon-clear-24x24",
      id: "clear-survey",
      tooltip: "Clear",
      visible: createIsDesignerTab(),
    }),
  ];
};
