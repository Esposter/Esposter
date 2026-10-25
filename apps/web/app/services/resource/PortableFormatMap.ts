// @unocss-include
import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { PortableResourceType } from "@/models/resource/PortableResourceType";

import { MimeType } from "#shared/models/file/MimeType";
import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { deserializeNoteMarkdown } from "#shared/services/resource/note/deserializeNoteMarkdown";
import { serializeNoteMarkdown } from "#shared/services/resource/note/serializeNoteMarkdown";
import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { getDatasetErrorMessage } from "@/services/dataset/getDatasetErrorMessage";
import { REOPEN_EMAIL_MESSAGE } from "@/services/emailEditor/constants";
import { exportWebpageHtml } from "@/services/pageBuilder/exportWebpageHtml";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { DataSourceTypeItemCategoryDefinitionMap } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitionMap";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { useEmailExportDialogStore } from "@/store/emailEditor/exportDialog";
import { useEmailImportDialogStore } from "@/store/emailEditor/importDialog";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { useFlowchartExportStore } from "@/store/flowchartEditor/export";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useResourceStore } from "@/store/resource";
import { useNoteStore } from "@/store/resource/note";
import { useNotePortableDialogStore } from "@/store/resource/note/portableDialog";
import { useSheetStore } from "@/store/resource/sheet";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { useTodoListStore } from "@/store/resource/todoList";
import { useTodoListPrintDialogStore } from "@/store/resource/todoList/printDialog";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { ResourceType } from "@esposter/db-schema";
import { downloadFile, getResult, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
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
// A note's Markdown file. Export downloads the document as it is held once the note has loaded, named after the note.
// Import reads the file into a document the note's own content schema checks, then hands it to the preview the
// Note's dialogs mount, which replaces nothing until the reader confirms
const NOTE_MARKDOWN_ACCEPT = ".md";
const createNoteMarkdownPortableFormat = (): PortableFormat => ({
  export: async () => {
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const noteStore = useNoteStore();
    const { loadContent } = noteStore;
    await loadContent();
    if (resourceStore.currentResourceId !== resourceId || !resourceStore.resource) return;

    const { note } = storeToRefs(noteStore);
    const markdown = serializeNoteMarkdown(note.value.doc);
    downloadFile(`${trimFileExtension(resourceStore.resource.name)}.md`, markdown, MimeType.Markdown);
  },
  icon: "i-mdi:language-markdown",
  import: async () => {
    const resourceStore = useResourceStore();
    const resourceId = resourceStore.currentResourceId;
    const noteStore = useNoteStore();
    const { loadContent } = noteStore;
    await loadContent();
    const importFile = useImportFile();
    const validateFile = useValidateFile();
    const notePortableDialogStore = useNotePortableDialogStore();
    const { openPreview } = notePortableDialogStore;
    await importFile(MimeType.Markdown, NOTE_MARKDOWN_ACCEPT, async (file) => {
      // A file over the app's file limit is refused before it is read, so no preview opens over the note for it
      if (!validateFile(file)) return;

      const doc = deserializeNoteMarkdown(await file.text());
      if (!noteDocumentSchema.safeParse(doc).success)
        throw new InvalidOperationError(Operation.Create, "note", "the file does not read as the content of a note");

      openPreview(resourceId, doc);
    });
  },
  label: "Markdown",
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
    {
      icon: "i-mdi:code-tags",
      // The command opens the code field for the email it was run on, which the Editor blade renders
      import: async () => {
        const alertStore = useAlertStore();
        const { createAlert } = alertStore;
        const resourceStore = useResourceStore();
        const { resource } = storeToRefs(resourceStore);
        const pageBuilderDocumentStore = usePageBuilderDocumentStore();
        const { getEmailDocument } = pageBuilderDocumentStore;
        if (!resource.value || !getEmailDocument(resource.value.id)) {
          createAlert(REOPEN_EMAIL_MESSAGE, "warning");
          return;
        }

        const emailImportDialogStore = useEmailImportDialogStore();
        const { openImport } = emailImportDialogStore;
        openImport(resource.value.id);
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
