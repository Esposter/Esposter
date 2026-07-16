import type { PortableResourceType } from "#shared/models/resource/PortableResourceType";
import type { PortableFormat } from "@/models/resource/PortableFormat";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useSheetStore } from "@/store/resource/sheet";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Self-contained per-format import/export for Sheet, backed by the same client-side parse the Data blade uses
const createSheetPortableFormat = (type: DataSourceType): PortableFormat => ({
  export: async () => {
    const sheetStore = useSheetStore();
    const { loadContent } = sheetStore;
    // The command bar is reachable from any blade, so the content may not be loaded yet
    await loadContent();
    const configuration = DataSourceConfigurationMap[type];
    const settings = sheetStore.settings.type === type ? sheetStore.settings : createDefaultSheetSettings(type);
    const exportFile = useExportFile();
    await exportFile(
      (mimeType) => configuration.serialize(sheetStore.dataSource, settings, mimeType),
      sheetStore.resource?.name ?? "export",
      configuration.mimeType,
      configuration.accept,
    );
  },
  import: async () => {
    const sheetStore = useSheetStore();
    const { loadContent } = sheetStore;
    await loadContent();
    const configuration = DataSourceConfigurationMap[type];
    const settings = sheetStore.settings.type === type ? sheetStore.settings : createDefaultSheetSettings(type);
    const importFile = useImportFile();
    const setDataSource = useSetDataSource();
    await importFile(configuration.mimeType, configuration.accept, async (file) => {
      const result = await configuration.deserialize(file, settings);
      await setDataSource(result);
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
        const { createAlert } = useAlertStore();
        // The live editor + bound dataset live on the email store (set by the blade); the export needs both
        const { datasetReference, editor, resource } = storeToRefs(useEmailEditorStore());
        const { pendingDataset } = storeToRefs(useEmailExportDialogStore());
        const exportPersonalizedHtml = useExportPersonalizedHtml();
        const referenceValue = datasetReference.value;
        if (!editor.value || !resource.value) {
          createAlert("Open the email editor before exporting personalized HTML", "warning");
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
        }).match(noop, (error) => {
          createAlert(error.message, "error");
        });
      },
      label: "Personalized HTML",
    },
  ],
  [ResourceType.Sheet]: [
    createSheetPortableFormat(DataSourceType.Csv),
    createSheetPortableFormat(DataSourceType.Json),
    createSheetPortableFormat(DataSourceType.Xlsx),
  ],
};
