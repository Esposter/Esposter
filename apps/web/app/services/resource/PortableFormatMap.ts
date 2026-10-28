// @unocss-include
import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { PortableResourceType } from "@/models/resource/PortableResourceType";

import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { exportDashboardPng } from "@/services/dashboard/export/exportDashboardPng";
import { getDatasetErrorMessage } from "@/services/dataset/getDatasetErrorMessage";
import { REOPEN_EMAIL_MESSAGE } from "@/services/emailEditor/constants";
import { exportWebpageHtml } from "@/services/pageBuilder/exportWebpageHtml";
import { createBlueprintPortableFormat } from "@/services/resource/createBlueprintPortableFormat";
import { createFlowchartPortableFormat } from "@/services/resource/createFlowchartPortableFormat";
import { createNoteMarkdownPortableFormat } from "@/services/resource/createNoteMarkdownPortableFormat";
import { createSheetPortableFormat } from "@/services/resource/createSheetPortableFormat";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useEmailImportDialogStore } from "@/store/emailEditor/importDialog";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { useTodoListStore } from "@/store/resource/todoList";
import { useTodoListPrintDialogStore } from "@/store/resource/todoList/printDialog";
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
        const resourceId = resourceStore.currentResourceId;
        // The open editor's latest edit reaches the stored copy first, so the export compiles what the reader sees. With
        // No editor open nothing is held and the save is a no-op
        const emailEditorStore = useEmailEditorStore();
        const { saveEmail } = emailEditorStore;
        const emailExportDialogStore = useEmailExportDialogStore();
        const { setPendingDataset } = emailExportDialogStore;
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
        }).match(noop, (error) => {
          createErrorAlert(error, getDatasetErrorMessage(error));
        });
      },
      icon: "i-mdi:language-html5",
      label: "Personalized HTML",
    },
    {
      icon: "i-mdi:code-tags",
      // The command opens the code field for the email it was run on, which the Editor blade renders
      import: () => {
        const alertStore = useAlertStore();
        const { createAlert } = alertStore;
        const resourceStore = useResourceStore();
        const { resource } = storeToRefs(resourceStore);
        const pageBuilderDocumentStore = usePageBuilderDocumentStore();
        const { getEmailDocument } = pageBuilderDocumentStore;
        if (!resource.value || !getEmailDocument(resource.value.id)) {
          createAlert(REOPEN_EMAIL_MESSAGE, "warning");
          return Promise.resolve();
        }

        const emailImportDialogStore = useEmailImportDialogStore();
        const { openImport } = emailImportDialogStore;
        openImport(resource.value.id);
        return Promise.resolve();
      },
      label: "MJML",
    },
  ],
  [ResourceType.Flowchart]: [
    createFlowchartPortableFormat(FlowchartExportFormat.Png),
    createFlowchartPortableFormat(FlowchartExportFormat.Svg),
  ],
  [ResourceType.Note]: [createNoteMarkdownPortableFormat()],
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
};
