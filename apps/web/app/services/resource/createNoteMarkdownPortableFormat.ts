// @unocss-include
import type { PortableFormat } from "@/models/resource/PortableFormat";

import { MimeType } from "#shared/models/file/MimeType";
import { noteDocumentSchema } from "#shared/models/resource/note/NoteDocument";
import { deserializeNoteMarkdown } from "#shared/services/resource/note/deserializeNoteMarkdown";
import { serializeNoteMarkdown } from "#shared/services/resource/note/serializeNoteMarkdown";
import { NOTE_MARKDOWN_ACCEPT } from "@/services/resource/constants";
import { useResourceStore } from "@/store/resource";
import { useNoteStore } from "@/store/resource/note";
import { useNotePortableDialogStore } from "@/store/resource/note/portableDialog";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { downloadFile, InvalidOperationError, Operation } from "@esposter/shared";

// A note's Markdown file. Export downloads the document as it is held once the note has loaded, named after the note.
// Import reads the file into a document the note's own content schema checks, then hands it to the preview the
// Note's dialogs mount, which replaces nothing until the reader confirms
export const createNoteMarkdownPortableFormat = (): PortableFormat => ({
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
