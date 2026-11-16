// @unocss-include
import type { PortableFormat } from "#src/models/resource/PortableFormat";
import type { PortableResourceType } from "#src/models/resource/PortableResourceType";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { WhiteboardExportFormat } from "#src/models/whiteboard/WhiteboardExportFormat";
import { exportDashboardPng } from "#src/services/dashboard/export/exportDashboardPng";
import { getDatasetErrorMessage } from "#src/services/dataset/getDatasetErrorMessage";
import { compileStoredEmail } from "#src/services/emailEditor/compileStoredEmail";
import { exportPersonalizedRows } from "#src/services/emailEditor/exportPersonalizedRows";
import { exportWebpageHtml } from "#src/services/pageBuilder/exportWebpageHtml";
import { createBlueprintPortableFormat } from "#src/services/resource/createBlueprintPortableFormat";
import { createNoteMarkdownPortableFormat } from "#src/services/resource/createNoteMarkdownPortableFormat";
import { createSheetPortableFormat } from "#src/services/resource/createSheetPortableFormat";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { exportWhiteboard } from "#src/services/whiteboard/export/exportWhiteboard";
import { useAlertStore } from "#src/store/alert";
import { useEmailExportDialogStore } from "#src/store/emailEditor/exportDialog";
import { useEmailEditorStore } from "#src/store/emailEditor/index";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { useResourceStore } from "#src/store/resource/index";
import { useSheetStore } from "#src/store/resource/sheet/index";
import { useSheetPortableDialogStore } from "#src/store/resource/sheet/portableDialog";
import { useTodoListStore } from "#src/store/resource/todoList/index";
import { useTodoListPrintDialogStore } from "#src/store/resource/todoList/printDialog";
import { ResourceType } from "@esposter/db-schema";
import { getResult, getResultAsync, noop } from "@esposter/shared";

// Import/export formats per portable type
export const PortableFormatMap: Record<PortableResourceType, PortableFormat[]> = {
  [ResourceType.Blueprint]: [createBlueprintPortableFormat()],
  // A picture cannot restore a dashboard, so it exports its page as drawn and has no import
  [ResourceType.Dashboard]: [
    {
      export: async () => {
        const resourceStore = useResourceStore();
        const resourceValue = resourceStore.resource;
        if (resourceValue) await exportDashboardPng(resourceValue.name);
      },
      icon: "i-mdi:image-outline",
      label: "PNG",
    },
  ],
  [ResourceType.Email]: [
    {
      export: async () => {
        const { $trpc } = useNuxtApp();
        const alertStore = useAlertStore();
        const { createAlert } = alertStore;
        const resourceStore = useResourceStore();
        const { whenContentSaved } = resourceStore;
        const resourceId = resourceStore.currentResourceId;
        // The open editor's latest edit reaches the stored copy first, so the export compiles what the reader sees: the
        // Export is the server's output, so it waits for the save to land. With no editor open nothing is held
        const emailEditorStore = useEmailEditorStore();
        const { saveEmail } = emailEditorStore;
        const emailExportDialogStore = useEmailExportDialogStore();
        const { setPendingDataset } = emailExportDialogStore;

        await getResultAsync(async () => {
          saveEmail(resourceId);
          await whenContentSaved(resourceId);
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
          else exportPersonalizedRows(resourceId, html, dataset.rows);
        }).match(noop, (error) => {
          createErrorAlert(error, getDatasetErrorMessage(error));
        });
      },
      icon: "i-mdi:language-html5",
      label: "Personalized HTML",
    },
  ],
  [ResourceType.Note]: [createNoteMarkdownPortableFormat()],
  [ResourceType.Sheet]: [
    createSheetPortableFormat(DataSourceType.Csv),
    createSheetPortableFormat(DataSourceType.Json),
    createSheetPortableFormat(DataSourceType.Xlsx),
    createSheetPortableFormat(DataSourceType.Xml),
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
      export: () => {
        const resourceStore = useResourceStore();
        const { resource } = storeToRefs(resourceStore);
        const pageBuilderDocumentStore = usePageBuilderDocumentStore();
        const { getDocument } = pageBuilderDocumentStore;
        const resourceValue = resource.value;
        const document = resourceValue && getDocument(resourceValue.id);
        if (!resourceValue || !document) {
          const alertStore = useAlertStore();
          const { createAlert } = alertStore;
          createAlert("Open the webpage before exporting its HTML", "warning");
          return Promise.resolve();
        }
        getResult(() => {
          exportWebpageHtml(resourceValue.name, document, window.location.origin);
        }).match(noop, (error) => {
          createErrorAlert(error);
        });
        return Promise.resolve();
      },
      icon: "i-mdi:language-html5",
      label: "HTML",
    },
  ],
  [ResourceType.Whiteboard]: [
    { export: () => exportWhiteboard(WhiteboardExportFormat.Png), icon: "i-mdi:image-outline", label: "PNG" },
    { export: () => exportWhiteboard(WhiteboardExportFormat.Svg), icon: "i-mdi:vector-square", label: "SVG" },
  ],
};
