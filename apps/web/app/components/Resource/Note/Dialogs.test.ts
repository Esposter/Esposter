// @vitest-environment nuxt
import type { JSONContent } from "@tiptap/core";

import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceNoteDialogs from "@/components/Resource/Note/Dialogs.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useResourceStore } from "@/store/resource";
import { useNoteStore } from "@/store/resource/note";
import { useNotePortableDialogStore } from "@/store/resource/note/portableDialog";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe("resourceNoteDialogs", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const importedDoc: JSONContent = {
    content: [{ content: [{ text: "imported", type: "text" }], type: "paragraph" }],
    type: "doc",
  };

  beforeEach(() => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({
      ...createResourceListItem({ id: resourceId, type: ResourceType.Note }),
      publication: null,
    }));
    trpcMsw.note.readResourceContent.query(() => ({ doc: EMPTY_NOTE_DOC }));
    trpcMsw.note.readResourcePublication.query(() => undefined);
  });

  // The preview shows what the file holds, and the note keeps what it held until the reader confirms
  test("An import previews the content it will replace", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const noteStore = useNoteStore();
    await noteStore.loadContent();
    const notePortableDialogStore = useNotePortableDialogStore();
    const { openPreview } = notePortableDialogStore;
    const wrapper = await mountSuspended(ResourceNoteDialogs);
    openPreview(resourceId, importedDoc);
    await flushPromises();

    expect(wrapper.text()).toContain("imported");
    expect(noteStore.note.doc).toStrictEqual(EMPTY_NOTE_DOC);
  });

  test("Cancelling an import keeps the note as it was", async () => {
    expect.hasAssertions();

    await useResourceStore().readResource();
    const noteStore = useNoteStore();
    await noteStore.loadContent();
    const notePortableDialogStore = useNotePortableDialogStore();
    const { openPreview } = notePortableDialogStore;
    const { isPreviewOpen } = storeToRefs(notePortableDialogStore);
    const wrapper = await mountSuspended(ResourceNoteDialogs);
    openPreview(resourceId, importedDoc);
    await flushPromises();
    const cancelButton = wrapper.findAll("button").find((button) => button.text() === "Cancel");
    assert.exists(cancelButton);
    await cancelButton.trigger("click");
    await flushPromises();

    expect(isPreviewOpen.value).toBe(false);
    expect(noteStore.note.doc).toStrictEqual(EMPTY_NOTE_DOC);
  });

  // The replaced content is saved as a revision before the import writes, so the reader can restore it
  test("An imported note keeps its previous content in history", async () => {
    expect.hasAssertions();

    const revisionSaves: string[] = [];
    const { promise: isRevisionSaved, resolve: onRevisionSaved } = Promise.withResolvers<void>();
    trpcMsw.resource.saveResourceRevision.mutation(() => {
      revisionSaves.push(resourceId);
      onRevisionSaved();
      return { id: resourceId };
    });
    const { promise: isContentSaved, resolve: onContentSaved } = Promise.withResolvers<void>();
    trpcMsw.note.saveResourceContent.mutation(() => {
      onContentSaved();
      return createResourceListItem({ id: resourceId, type: ResourceType.Note });
    });
    trpcMsw.resource.readSnapshotHistory.query(() => []);
    await useResourceStore().readResource();
    const noteStore = useNoteStore();
    await noteStore.loadContent();
    const notePortableDialogStore = useNotePortableDialogStore();
    const { openPreview } = notePortableDialogStore;
    const wrapper = await mountSuspended(ResourceNoteDialogs);
    openPreview(resourceId, importedDoc);
    await flushPromises();
    const importButton = wrapper.findAll("button").find((button) => button.text() === "Import");
    assert.exists(importButton);
    await importButton.trigger("click");
    await isRevisionSaved;
    await isContentSaved;
    await flushPromises();

    expect(revisionSaves).toStrictEqual([resourceId]);
    expect(noteStore.note.doc).toStrictEqual(importedDoc);
  });
});
