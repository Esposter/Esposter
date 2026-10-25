// @vitest-environment nuxt
import type { ButtonNodeProps } from "#shared/models/pageBuilder/ButtonNodeProps";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { useResourceStore } from "@/store/resource";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import { ResourceType, SnapshotChannel } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { updateBlockNodeProps } from "headless-block-editor";
import { describe, expect, test } from "vitest";

describe(useVersionHistoryStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const TEST_EDIT_LABEL = "Change label";
  const TEST_EDITED_LABEL = "Edited";
  const TEST_RESTORED_LABEL = "Restored";

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

  // A restore replaces the draft under the open page, so the edits its history holds describe a document that is gone
  test("Restoring a version leaves nothing to undo", async () => {
    expect.hasAssertions();

    const webpage = createResourceListItem({ type: ResourceType.Webpage });
    const buttonId = crypto.randomUUID();
    // The restored draft's label differs from the one the undo would write back, so a surviving entry is visible
    const restoredContent = [
      { props: { href: TEST_URL, id: buttonId, label: TEST_RESTORED_LABEL }, type: WebpageNodeType.Button },
    ];
    let content = new WebpageEditor({ content: [createButton(buttonId)] });
    Object.assign(useRouter().currentRoute.value.params, { id: webpage.id });
    trpcMsw.resource.readResource.query(() => ({ ...webpage, publication: null }));
    trpcMsw.webpage.readResourceContent.query(() => content);
    trpcMsw.webpage.readResourcePublication.query(() => undefined);
    trpcMsw.resource.restoreSnapshotVersion.mutation(() => ({ undoRevisionVersion: undefined }));
    trpcMsw.resource.readSnapshotHistory.query(() => []);
    const resourceStore = useResourceStore();
    await resourceStore.readResource();
    const webpageEditorStore = useWebpageEditorStore();
    await webpageEditorStore.loadContent();
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { applyEdit, getUndoLabel, undo } = pageBuilderHistoryStore;
    applyEdit(
      webpage.id,
      updateBlockNodeProps<ButtonNodeProps>("/content/0", { label: TEST_EDITED_LABEL }),
      TEST_EDIT_LABEL,
    ).match(noop, (error) => {
      throw error;
    });
    const undoLabelBeforeRestore = getUndoLabel(webpage.id);
    content = new WebpageEditor({ content: restoredContent });
    const versionHistoryStore = useVersionHistoryStore();
    const { restoreSnapshot } = versionHistoryStore;
    await restoreSnapshot({ channel: SnapshotChannel.Revisions, version: 1 });
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument } = pageBuilderDocumentStore;
    undo(webpage.id);

    expect(undoLabelBeforeRestore).toBe(TEST_EDIT_LABEL);
    expect(getUndoLabel(webpage.id)).toBe("");
    expect(getDocument(webpage.id)?.content).toStrictEqual(restoredContent);
  });
});
