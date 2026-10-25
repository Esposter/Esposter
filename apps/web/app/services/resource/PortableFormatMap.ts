// @unocss-include
import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { PortableResourceType } from "@/models/resource/PortableResourceType";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { getDatasetErrorMessage } from "@/services/dataset/getDatasetErrorMessage";
import { exportWebpageHtml } from "@/services/pageBuilder/exportWebpageHtml";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { DataSourceTypeItemCategoryDefinitionMap } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitionMap";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { useFlowchartExportStore } from "@/store/flowchartEditor/export";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { useTodoListStore } from "@/store/resource/todoList";
import { useTodoListPrintDialogStore } from "@/store/resource/todoList/printDialog";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { ResourceType } from "@esposter/db-schema";
import { getResult, getResultAsync, noop } from "@esposter/shared";
import { toRaw } from "vue";

// Per-format import/export for Sheet. Both hand off to the dialog the blade shell mounts rather than acting
// Outright: an import shows what it is about to replace the sheet with, and an export asks which columns to take
// And honours the row filter and selection. The command bar is the single place a sheet is imported to or
// Exported from
const createSheetPortableFormat = (type: DataSourceType): PortableFormat => ({
  export: async () => {
    // Named before the first await, so the dialog opens for the sheet the command was run on
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const sheetStore = useSheetStore();
    const { loadContent } = sheetStore;
    // The command bar is reachable from any blade, so the content may not be loaded yet
    await loadContent();
    const sheetPortableDialogStore = useSheetPortableDialogStore();
    const { openExport } = sheetPortableDialogStore;
    openExport(resourceId, type);
  },
  icon: DataSourceTypeItemCategoryDefinitionMap[type].icon,
  import: async () => {
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
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
      const dataSource = await configuration.deserialize(file, settings);
      openPreview(resourceId, dataSource, trimFileExtension(dataSource.metadata.name));
    });
  },
  label: type,
});

const createFlowchartPortableFormat = (format: FlowchartExportFormat): PortableFormat => ({
  export: async () => {
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const flowchartEditorStore = useFlowchartEditorStore();
    const { loadContent } = flowchartEditorStore;
    await loadContent();
    if (resourceStore.currentResourceId !== resourceId || !resourceStore.resource) return;
    const { flowchartEditor } = storeToRefs(flowchartEditorStore);
    const flowchartExportStore = useFlowchartExportStore();
    const { openExport } = flowchartExportStore;
    openExport({
      edges: structuredClone(toRaw(flowchartEditor.value.edges)),
      format,
      name: resourceStore.resource.name,
      nodes: structuredClone(toRaw(flowchartEditor.value.nodes)),
    });
  },
  icon: format === FlowchartExportFormat.Png ? "i-mdi:image-outline" : "i-mdi:vector-square",
  label: format.toUpperCase(),
});
// Import/export formats per portable type
export const PortableFormatMap: Record<PortableResourceType, PortableFormat[]> = {
  [ResourceType.Email]: [
    {
      export: async () => {
        const { $trpc } = useNuxtApp();
        const { createAlert } = useAlertStore();
        const resourceStore = useResourceStore();
        const resourceId = resourceStore.currentResourceId;
        // The open editor's latest edit reaches the stored copy first, so the export compiles what the reader sees. With
        // No editor open nothing is held and the save is a no-op
        const { saveEmail } = useEmailEditorStore();
        const { setPendingDataset } = useEmailExportDialogStore();
        const { compileStoredEmail, exportRows } = useExportPersonalizedHtml();

        await getResultAsync(async () => {
          await saveEmail(resourceId);
          const { datasetReference, html } = await compileStoredEmail(resourceId);
          if (!datasetReference) {
            createAlert("Bind a dataset before exporting personalized HTML", "warning");
            return;
          }
          const dataset = await $trpc.dataset.readDataset.query(datasetReference);
          if (dataset.rows.length === 0) {
            createAlert("Dataset has no rows to export", "warning");
            return;
          }
          // Silently mailing a truncated audience is the one failure the sender can never take back,
          // So a capped read hands the decision to the Editor blade's confirm instead of exporting
          if (getDatasetTruncation(dataset)) setPendingDataset(resourceId, dataset);
          else exportRows(resourceId, html, dataset.rows);
        }).match(noop, (error) => createErrorAlert(error, getDatasetErrorMessage(error)));
      },
      icon: "i-mdi:language-html5",
      label: "Personalized HTML",
    },
  ],
  [ResourceType.Flowchart]: [
    createFlowchartPortableFormat(FlowchartExportFormat.Png),
    createFlowchartPortableFormat(FlowchartExportFormat.Svg),
  ],
  [ResourceType.Sheet]: [
    createSheetPortableFormat(DataSourceType.Csv),
    createSheetPortableFormat(DataSourceType.Json),
    createSheetPortableFormat(DataSourceType.Xlsx),
    // A survey is a source rather than a file format, so it imports and never exports — it sits among the
    // Formats because it is one of the ways a sheet is filled
    {
      icon: "i-mdi:poll",
      import: async () => {
        const resourceStore = useResourceStore();
        const resourceId = resourceStore.currentResourceId;
        const sheetStore = useSheetStore();
        const { loadContent } = sheetStore;
        await loadContent();
        const sheetPortableDialogStore = useSheetPortableDialogStore();
        const { openSurveyImport } = sheetPortableDialogStore;
        openSurveyImport(resourceId);
      },
      label: "Survey responses",
    },
  ],
  // Microsoft To Do's Print list, and the list's only way out: the browser's print dialog also saves a PDF
  [ResourceType.TodoList]: [
    {
      export: async () => {
        const resourceStore = useResourceStore();
        const resourceId = resourceStore.currentResourceId;
        const todoListStore = useTodoListStore();
        const { loadContent } = todoListStore;
        await loadContent();
        const todoListPrintDialogStore = useTodoListPrintDialogStore();
        const { openDialog } = todoListPrintDialogStore;
        openDialog(resourceId);
      },
      icon: "i-mdi:printer",
      label: "Print",
    },
  ],
  [ResourceType.Webpage]: [
    {
      export: async () => {
        const resourceStore = useResourceStore();
        const { resource } = storeToRefs(resourceStore);
        const pageBuilderDocumentStore = usePageBuilderDocumentStore();
        const { getDocument } = pageBuilderDocumentStore;
        const resourceValue = resource.value;
        const document = resourceValue && getDocument(resourceValue.id);
        if (!resourceValue || !document) {
          useAlertStore().createAlert("Open the webpage before exporting its HTML", "warning");
          return;
        }
        getResult(() => exportWebpageHtml(resourceValue.name, document, window.location.origin)).match(noop, (error) =>
          createErrorAlert(error),
        );
      },
      icon: "i-mdi:language-html5",
      label: "HTML",
    },
  ],
};
