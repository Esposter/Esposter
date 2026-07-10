import type { PortableResourceType } from "#shared/models/resource/PortableResourceType";
import type { PortableFormat } from "@/models/resource/PortableFormat";

import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { exportPersonalizedHtml } from "@/services/emailEditor/exportPersonalizedHtml";
import { createDefaultFileSettings } from "@/services/resource/file/createDefaultFileSettings";
import { DataSourceConfigurationMap } from "@/services/resource/file/dataSource/DataSourceConfigurationMap";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useFileStore } from "@/store/resource/file";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Self-contained per-format import/export for File, backed by the same client-side parse the Data blade uses
const createFilePortableFormat = (type: DataSourceType): PortableFormat => ({
  export: async () => {
    const fileStore = useFileStore();
    const { loadContent } = fileStore;
    // The command bar is reachable from any blade, so the content may not be loaded yet
    await loadContent();
    const configuration = DataSourceConfigurationMap[type];
    const settings = fileStore.settings.type === type ? fileStore.settings : createDefaultFileSettings(type);
    const exportFile = useExportFile();
    await exportFile(
      (mimeType) => configuration.serialize(fileStore.dataSource, settings, mimeType),
      fileStore.resource?.name ?? "export",
      configuration.mimeType,
      configuration.accept,
    );
  },
  import: async () => {
    const fileStore = useFileStore();
    const { loadContent } = fileStore;
    await loadContent();
    const configuration = DataSourceConfigurationMap[type];
    const settings = fileStore.settings.type === type ? fileStore.settings : createDefaultFileSettings(type);
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
        const editorValue = editor.value;
        const resourceValue = resource.value;
        const referenceValue = datasetReference.value;
        if (!editorValue || !resourceValue || !referenceValue) {
          createAlert("Bind a dataset before exporting personalized HTML", "warning");
          return;
        }

        await getResultAsync(async () => {
          const dataset = await $trpc.dataset.readDataset.query(referenceValue);
          if (dataset.rows.length === 0) {
            createAlert("Dataset has no rows to export", "warning");
            return;
          }

          const count = exportPersonalizedHtml(editorValue, resourceValue, dataset.rows);
          createAlert(`Exported ${count} personalized emails`, "success");
        }).match(noop, (error) => {
          createAlert(error.message, "error");
        });
      },
      label: "Personalized HTML",
    },
  ],
  [ResourceType.File]: [
    createFilePortableFormat(DataSourceType.Csv),
    createFilePortableFormat(DataSourceType.Json),
    createFilePortableFormat(DataSourceType.Xlsx),
  ],
};
