<script setup lang="ts">
import { renderNoteHtml } from "#shared/services/resource/note/renderNoteHtml";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { ResourceContentHookMap } from "@/services/resource/ResourceContentHookMap";
import { useResourceStore } from "@/store/resource";
import { useNoteStore } from "@/store/resource/note";
import { useNotePortableDialogStore } from "@/store/resource/note/portableDialog";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { ResourceType } from "@esposter/db-schema";

const notePortableDialogStore = useNotePortableDialogStore();
const { isPreviewOpen, previewDoc } = storeToRefs(notePortableDialogStore);
const { closePreview } = notePortableDialogStore;
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
const noteStore = useNoteStore();
const { getContentWriter, saveNote } = noteStore;
const versionHistoryStore = useVersionHistoryStore();
const { saveResourceRevision } = versionHistoryStore;
const importingResourceId = ref("");
// The preview an import answers is the one on the note it was confirmed on, which the reader may have left by the
// Time the import lands
const isImportPreviewOpen = computed({
  get: () => isPreviewOpen.value,
  set: (newIsImportPreviewOpen) => {
    if (!newIsImportPreviewOpen) closePreview(importingResourceId.value);
  },
});
const { answer, isPending: isImporting } = useDialogAnswer(isImportPreviewOpen);
const html = computed(() => (previewDoc.value ? renderNoteHtml(previewDoc.value) : ""));
</script>

<template>
  <!-- An import shows what it is about to replace the note's content with before it does; the command that opened
    this has already parsed the file, so the confirm is the only thing left to do. The content it replaces becomes a
    revision first, and the import does not proceed when that revision did not land, because the revision is the way
    back -->
  <UiDialog v-model="isPreviewOpen" :placement="UiDialogPlacement.Middle" title="Import Markdown" w="[min(48rem,90vw)]">
    <div p-3 min-h-0 of-y-auto>
      <!-- eslint-disable-next-line vue/no-v-html -- the imported note's sanitized HTML -->
      <div class="rich-text-content" v-html="html" />
    </div>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isPreviewOpen = false">Cancel</UiButton>
      <UiButton
        :is-pending="isImporting"
        :variant="UiButtonVariant.Accent"
        @click="
          answer(async () => {
            // The import awaits a revision before it writes, so the note it lands in is named when it is confirmed
            importingResourceId = currentResourceId;
            const doc = previewDoc;
            const writeContent = getContentWriter();
            if (!doc || !(await saveResourceRevision())) return false;
            if (!writeContent({ doc })) return;

            await saveNote();
            // The editor holds its own copy of the document, which would write the replaced one back on its next edit
            await ResourceContentHookMap.Adopt.run(ResourceType.Note);
          })
        "
      >
        Import
      </UiButton>
    </footer>
  </UiDialog>
</template>
