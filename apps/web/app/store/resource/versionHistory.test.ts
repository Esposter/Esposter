// @vitest-environment nuxt
import type { ButtonNodeProps } from "#shared/models/pageBuilder/ButtonNodeProps";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { JsonPatchOperation } from "@esposter/shared";

import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { ButtonTarget } from "#shared/models/pageBuilder/ButtonTarget";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { TEST_ID, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useReadOpenResource } from "#src/composables/resource/useReadOpenResource";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useEmailEditorStore } from "#src/store/emailEditor/index";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { useResourceStore } from "#src/store/resource/index";
import { useVersionHistoryStore } from "#src/store/resource/versionHistory";
import { useWebpageEditorStore } from "#src/store/webpageEditor/index";
import { ResourceType, SnapshotChannel } from "@esposter/db-schema";
import { JsonPatchOperationType, noop } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { updateBlockNodeProps } from "vue-block-editor-headless";

describe(useVersionHistoryStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const TEST_EDIT_LABEL = "Change label";
  const TEST_EDITED_LABEL = "Edited";
  const TEST_RESTORED_LABEL = "Restored";
  // The restored draft's label differs from the one the undo would write back, so a surviving entry is visible
  const restoredContent: WebpageNode[] = [
    {
      props: { elementId: "", href: TEST_URL, id: TEST_ID, label: TEST_RESTORED_LABEL, target: ButtonTarget.SameTab },
      type: WebpageNodeType.Button,
    },
  ];
  const restoredEmail = new EmailEditor({ content: [], root: { props: { lang: "", title: TEST_RESTORED_LABEL } } });

  // Reads of two resources are two keys, so neither supersedes the other and the first one issued can land after
  // The second. Filed under whichever resource is open when it lands, it lists the one left behind as this one's
  test("files a history that lands after a switch under the resource it was read for", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    const { promise: isReadReached, resolve: onReadReached } = Promise.withResolvers<void>();
    const firstResource = createResourceListItem();
    const secondResource = createResourceListItem();
    trpcMsw.resource.readSnapshotHistory.query(async ({ input }) => {
      if (input.id === firstResource.id) {
        onReadReached();
        await readGate;
      }
      return [
        { channel: SnapshotChannel.Revisions, isCurrent: false, summary: input.id, takenAt: new Date(0), version: 0 },
      ];
    });
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const versionHistoryStore = useVersionHistoryStore();
    const { versions } = storeToRefs(versionHistoryStore);
    const { readSnapshotHistory } = versionHistoryStore;
    resource.value = firstResource;
    const firstRead = readSnapshotHistory(firstResource);
    // A read issued in the same tick would share the held one's batch and settle with it
    await isReadReached;
    resource.value = secondResource;
    await readSnapshotHistory(secondResource);
    releaseRead();
    await firstRead;

    expect(versions.value.map(({ summary }) => summary)).toStrictEqual([secondResource.id]);

    resource.value = firstResource;

    expect(versions.value.map(({ summary }) => summary)).toStrictEqual([firstResource.id]);
  });

  // A restore replaces the draft under the open page, so the edits its history holds describe a document that is gone.
  // An email is restored through the same reload, so the draft it replaces takes its undo history with it
  test.each([
    {
      edit: updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: TEST_EDITED_LABEL }),
      expected: restoredContent,
      name: "a webpage",
      // Loads the webpage's draft, and returns the function that makes the reload read the restored one
      openDraft: async () => {
        let content = new WebpageEditor({ content: [createButton(TEST_ID)] });
        trpcMsw.webpage.readResourceContent.query(() => content);
        trpcMsw.webpage.readResourcePublication.query(() => undefined);
        const webpageEditorStore = useWebpageEditorStore();
        await webpageEditorStore.loadContent();

        return () => {
          content = new WebpageEditor({ content: restoredContent });
        };
      },
      read: (resourceId: string) => {
        const pageBuilderDocumentStore = usePageBuilderDocumentStore();

        return pageBuilderDocumentStore.getDocument(resourceId)?.content;
      },
      type: ResourceType.Webpage,
    },
    {
      edit: [
        { op: JsonPatchOperationType.Add, path: "/root/props/title", value: TEST_EDITED_LABEL },
      ] satisfies JsonPatchOperation[],
      expected: restoredEmail.root,
      name: "an email",
      openDraft: async () => {
        let content = new EmailEditor({ content: [], root: { props: { lang: "", title: "" } } });
        trpcMsw.email.readResourceContent.query(() => content);
        trpcMsw.email.readResourcePublication.query(() => undefined);
        const emailEditorStore = useEmailEditorStore();
        await emailEditorStore.loadContent();

        return () => {
          content = restoredEmail;
        };
      },
      read: (resourceId: string) => {
        const pageBuilderDocumentStore = usePageBuilderDocumentStore();

        return pageBuilderDocumentStore.getEmailDocument(resourceId)?.root;
      },
      type: ResourceType.Email,
    },
  ])("restoring $name version leaves nothing to undo", async ({ edit, expected, openDraft, read, type }) => {
    expect.hasAssertions();

    const resource = createResourceListItem({ type });
    Object.assign(useRouter().currentRoute.value.params, { id: resource.id });
    trpcMsw.resource.readResource.query(() => ({ ...resource, publication: null }));
    trpcMsw.resource.restoreSnapshotVersion.mutation(() => ({ resource, undoRevisionVersion: undefined }));
    trpcMsw.resource.readSnapshotHistory.query(() => []);
    await useReadOpenResource().readResource();
    const setRestoredContent = await openDraft();
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getUndoLabel, undo } = pageBuilderHistoryStore;
    applyEdit(resource.id, edit, TEST_EDIT_LABEL).match(noop, (error) => {
      throw error;
    });
    const undoLabelBeforeRestore = getUndoLabel(resource.id);
    setRestoredContent();
    const versionHistoryStore = useVersionHistoryStore();
    const { restoreSnapshot } = versionHistoryStore;
    await restoreSnapshot({ channel: SnapshotChannel.Revisions, version: 1 });
    undo(resource.id);

    expect(undoLabelBeforeRestore).toBe(TEST_EDIT_LABEL);
    expect(getUndoLabel(resource.id)).toBe("");
    expect(read(resource.id)).toStrictEqual(expected);
  });
});
