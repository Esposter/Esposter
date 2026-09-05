import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { PortableResourceType } from "@/models/resource/PortableResourceType";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";
import { OPEN_EMAIL_EDITOR_MESSAGE } from "@/services/emailEditor/constants";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { DataSourceTypeItemCategoryDefinitionMap } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitions";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Per-format import/export for Sheet. Both hand off to the dialog the blade shell mounts rather than acting
// Outright: an import shows what it is about to replace the sheet with, and an export asks which columns to take
// And honours the row filter and selection. The command bar is the single place a sheet is imported to or
// Exported from
const createSheetPortableFormat = (type: DataSourceType): PortableFormat => ({
  export: async () => {
    const sheetStore = useSheetStore();
    const { loadContent } = sheetStore;
    // The command bar is reachable from any blade, so the content may not be loaded yet
    await loadContent();
    const sheetPortableDialogStore = useSheetPortableDialogStore();
    const { openExport } = sheetPortableDialogStore;
    openExport(type);
  },
  icon: DataSourceTypeItemCategoryDefinitionMap[type].icon,
  import: async () => {
    const sheetStore = useSheetStore();
    const { loadContent } = sheetStore;
    await loadContent();
    const configuration = DataSourceConfigurationMap[type];
    // A format other than the sheet's own is read with that format's defaults rather than rewriting the settings
    // The sheet already has — the same fallback the export dialog makes
    const settings = sheetStore.settings.type === type ? sheetStore.settings : createDefaultSheetSettings(type);
    const importFile = useImportFile();
    const sheetPortableDialogStore = useSheetPortableDialogStore();
    const { openPreview } = sheetPortableDialogStore;
    await importFile(configuration.mimeType, configuration.accept, async (file) => {
      const result = await configuration.deserialize(file, settings);
      openPreview(result, trimFileExtension(result.metadata.name));
    });
  },
  label: type,
});
// Import/export formats per portable type
export const PortableFormatMap: Record<PortableResourceType, PortableFormat[]> = {
  [ResourceType.Email]: [
    {
      export: async () => {
        const { $trpc } = useNuxtApp();
        const alertStore = useAlertStore();
        const { createAlert } = alertStore;
        // The live editor + bound dataset live on the email store (set by the blade); the row it belongs to is
        // The blade's own, so the export takes each from the store that owns it
        const emailEditorStore = useEmailEditorStore();
        const { datasetReference, editor } = storeToRefs(emailEditorStore);
        const resourceStore = useResourceStore();
        const { resource } = storeToRefs(resourceStore);
        const emailExportDialogStore = useEmailExportDialogStore();
        const { pendingDataset } = storeToRefs(emailExportDialogStore);
        const exportPersonalizedHtml = useExportPersonalizedHtml();
        const referenceValue = datasetReference.value;
        if (!editor.value || !resource.value) {
          createAlert(OPEN_EMAIL_EDITOR_MESSAGE, "warning");
          return;
        }
        if (!referenceValue) {
          createAlert("Bind a dataset before exporting personalized HTML", "warning");
          return;
        }

        await getResultAsync(async () => {
          const dataset = await $trpc.dataset.readDataset.query(referenceValue);
          if (dataset.rows.length === 0) {
            createAlert("Dataset has no rows to export", "warning");
            return;
          }
          // Silently mailing a truncated audience is the one failure the sender can never take back,
          // So a capped read hands the decision to the Editor blade's confirm instead of exporting
          if (getDatasetTruncation(dataset)) pendingDataset.value = dataset;
          else exportPersonalizedHtml(dataset.rows);
        }).match(noop, createErrorAlert);
      },
      icon: "mdi-language-html5",
      label: "Personalized HTML",
    },
  ],
  [ResourceType.Sheet]: [
    createSheetPortableFormat(DataSourceType.Csv),
    createSheetPortableFormat(DataSourceType.Json),
    createSheetPortableFormat(DataSourceType.Xlsx),
    // A survey is a source rather than a file format, so it imports and never exports — it sits among the
    // Formats because it is one of the ways a sheet is filled
    {
      icon: "mdi-poll",
      import: async () => {
        const sheetStore = useSheetStore();
        const { loadContent } = sheetStore;
        await loadContent();
        const sheetPortableDialogStore = useSheetPortableDialogStore();
        const { openSurveyImport } = sheetPortableDialogStore;
        openSurveyImport();
      },
      label: "Survey responses",
    },
  ],
};
