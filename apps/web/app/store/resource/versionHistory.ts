import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";
import type { ResourceInResource } from "@esposter/db-schema";

import { useRunScope } from "#src/composables/shared/useRunScope";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { getSnapshotVersionTitle } from "#src/services/resource/getSnapshotVersionTitle";
import { resourceTable } from "#src/services/resource/overlay/constants";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { useNotificationStore } from "#src/store/notification";
import { useOverlayStore } from "#src/store/overlay";
import { useResourceStore } from "#src/store/resource/index";
import { NotificationSeverity, SnapshotChannel } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

// The version history panel's own state: one merged timeline over both channels, and the two writes its rows
// Issue. Blade-scoped — the store is app-lifetime and this state is the open resource's, so the panel clears
// It on unmount. See openspec/specs/resource/resource-snapshots/design.md
export const useVersionHistoryStore = defineStore("resource/versionHistory", () => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const resourceStore = useResourceStore();
  const { reloadResourceContent } = resourceStore;
  const overlayStore = useOverlayStore();
  const { writeAwaited } = overlayStore;
  // The timeline is one read of the open resource, so a read for another resource, or a newer read of this one, aborts
  // It
  const { executeQuery } = useMutation();
  const runScope = useRunScope();
  const key = Symbol("readSnapshotHistory");
  // Keyed by the resource the history was read for, so a list held for one resource is never shown for another
  const { data: versions, getDataRef: getVersionsRef } = useCurrentResourceDataMap<SnapshotVersion[]>([]);
  // The read in flight, by its token, so a read the scope aborted does not clear the one that replaced it
  const readingResourceId = ref("");
  let latestRead: symbol | undefined;
  const isPending = computed(
    // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a resource id the store holds, never typed
    () => readingResourceId.value !== "" && readingResourceId.value === resourceStore.currentResourceId,
  );
  // The row a confirmation is open for, which is its channel and version together: a version alone names one
  // Row per channel
  const restoringSnapshotVersionId = ref("");
  // The resource is named by the caller rather than read off the store, so the response is filed under the
  // Resource it was read for whichever one is on screen when it lands
  const readSnapshotHistory = ({ id }: Pick<ResourceInResource, "id">) => {
    const resourceVersions = getVersionsRef(id);
    const read = Symbol("readSnapshotHistory");
    latestRead = read;
    readingResourceId.value = id;
    return withFinalizerAsync(
      () =>
        executeQuery((signal) => $trpc.resource.readSnapshotHistory.query({ id }, { signal }), {
          key,
          onSuccess: (newVersions) => {
            resourceVersions.value = newVersions;
          },
          runScope,
        }),
      () => {
        if (latestRead !== read) return;

        latestRead = undefined;
        readingResourceId.value = "";
      },
    );
  };
  const clearVersionHistory = (resourceId: string) => {
    const resourceVersions = getVersionsRef(resourceId);
    resourceVersions.value = [];
    restoringSnapshotVersionId.value = "";
  };
  // The one destructive operation in the feature, and the reason it is safe to try: the restore takes a
  // Revision of the draft it replaces, so its own success notification can offer to put that draft back.
  // Single-use, because a second fire would restore a draft the first fire already replaced
  // The resource is named rather than read at call time: the Undo below is clickable from the bell long after
  // The panel closed and the owner moved on, and a restore that read whichever resource is open now would
  // Overwrite the wrong draft
  const restoreSnapshot = async (
    { channel, version }: Pick<SnapshotVersion, "channel" | "version">,
    resource = resourceStore.resource,
  ) => {
    if (!resource) return;

    // The restored draft is the server's, so its row arrives with the answer
    await writeAwaited(
      async () => {
        const { resource: restoredResource, undoRevisionVersion } = await $trpc.resource.restoreSnapshotVersion.mutate({
          channel,
          id: resource.id,
          version,
        });
        createNotification({
          ...(undoRevisionVersion === undefined
            ? {}
            : {
                action: {
                  handler: () =>
                    restoreSnapshot({ channel: SnapshotChannel.Revisions, version: undoRevisionVersion }, resource),
                  isSingleUse: true,
                  title: "Undo",
                },
              }),
          severity: NotificationSeverity.Success,
          title: `Restored "${resource.name}" from ${getSnapshotVersionTitle({ channel, version })} into a draft`,
        });
        // The restore landed as an ordinary content save, so a blade open on this resource is holding the
        // Draft it read before — and its own next save would be rejected as stale. Reloading is what makes
        // The restore visible where it happened, and it is owed only to the resource still on screen
        if (resourceStore.currentResourceId === resource.id) {
          await reloadResourceContent();
          await readSnapshotHistory({ id: resource.id });
        }
        return [createArrival(resourceTable, restoredResource)];
      },
      { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorNotification },
    );
  };
  // The safety net a write that replaces a draft wholesale takes first. Reports whether it landed, because such
  // A write has no business proceeding when it did not. Every other revision is taken by the server on its own
  // Clock, so this is the only one a client asks for
  const saveResourceRevision = async () => {
    const resource = resourceStore.resource;
    if (!resource) return false;

    let isSaved = false;
    // The revision's answer is a version number, which no row holds, so the write arrives nothing and the history is
    // `re-read`
    await writeAwaited(
      async () => {
        await $trpc.resource.saveResourceRevision.mutate({ id: resource.id });
        isSaved = true;
        await readSnapshotHistory({ id: resource.id });
        return [];
      },
      { awaitedBecause: AwaitedReason.IrreversibleStep, onError: createErrorNotification },
    );
    return isSaved;
  };
  return {
    clearVersionHistory,
    isPending,
    readSnapshotHistory,
    restoreSnapshot,
    restoringSnapshotVersionId,
    saveResourceRevision,
    versions,
  };
});
