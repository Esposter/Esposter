import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { MutationStatus } from "@/models/shared/MutationStatus";
import { getSnapshotVersionTitle } from "@/services/resource/getSnapshotVersionTitle";
import { useNotificationStore } from "@/store/notification";
import { useResourceStore } from "@/store/resource";
import { NotificationSeverity } from "@esposter/db-schema";

// The version history panel's own state: one merged timeline over both channels, and the two writes its rows
// Issue. Blade-scoped — the store is app-lifetime and this state is the open resource's, so the panel clears
// It on unmount. See /docs/resource/resource-snapshots
export const useVersionHistoryStore = defineStore("resource/versionHistory", () => {
  const { $trpc } = useNuxtApp();
  const notificationStore = useNotificationStore();
  const { createErrorNotification, createNotification } = notificationStore;
  const resourceStore = useResourceStore();
  const { reloadResourceContent } = resourceStore;
  const { executeQuery, isPending } = useMutation();
  const { executeMutation: executeRestoreMutation, isPending: isRestorePending } = useMutation();
  const { executeMutation: executeSaveRevisionMutation } = useMutation();
  const versions = ref<SnapshotVersion[]>([]);
  // The row a confirmation is open for, which is its channel and version together: a version alone names one
  // Row per channel
  const restoringSnapshotVersionId = ref("");
  const readSnapshotHistory = async () => {
    const resource = resourceStore.resource;
    if (!resource) return;

    await executeQuery(() => $trpc.resource.readSnapshotHistory.query({ id: resource.id }), {
      key: resource.id,
      onSuccess: (newVersions) => {
        versions.value = newVersions;
      },
    });
  };
  const clearVersionHistory = () => {
    versions.value = [];
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

    await executeRestoreMutation(
      () => $trpc.resource.restoreSnapshotVersion.mutate({ channel, id: resource.id, version }),
      {
        // Every restore overwrites this resource's single working draft, so it keys by the resource id
        key: resource.id,
        onError: createErrorNotification,
        onSuccess: async ({ undoRevisionVersion }) => {
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
          if (resourceStore.resource?.id !== resource.id) return;

          await reloadResourceContent();
          await readSnapshotHistory();
        },
      },
    );
  };
  // The safety net a write that replaces a draft wholesale takes first. Reports whether it landed, because such
  // A write has no business proceeding when it did not. Every other revision is taken by the server on its own
  // Clock, so this is the only one a client asks for
  const saveResourceRevision = async () => {
    const resource = resourceStore.resource;
    if (!resource) return false;

    const outcome = await executeSaveRevisionMutation(
      () => $trpc.resource.saveResourceRevision.mutate({ id: resource.id }),
      {
        key: resource.id,
        onError: createErrorNotification,
        onSuccess: () => readSnapshotHistory(),
      },
    );
    return outcome.status === MutationStatus.Succeeded;
  };
  return {
    clearVersionHistory,
    isPending,
    isRestorePending,
    readSnapshotHistory,
    restoreSnapshot,
    restoringSnapshotVersionId,
    saveResourceRevision,
    versions,
  };
});
