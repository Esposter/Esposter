import type { CallBackground } from "#shared/models/message/call/CallBackground";
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { getSingleFilePresignedUrlEntities } from "#src/services/file/getSingleFilePresignedUrlEntities";
import { uploadFilesToPresignedUrls } from "#src/services/file/uploadFilesToPresignedUrls";
import { CallVirtualBackgroundDefinitions } from "#src/services/message/room/call/CallVirtualBackgroundDefinitions";
import { getCallBackgroundSelection } from "#src/services/message/room/call/getCallBackgroundSelection";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

// The listing is the bucket's own index, so no write puts a slot in it and none is drawn ahead of the server. Each
// Write is an awaited call: the upload re-reads the listing once it is confirmed, and a delete leaves the listing as
// The server holds it until the blob's topic changes, which the worker's reclaim of the blob makes happen
export const useCallBackgroundStore = defineStore("message/user/settings/callBackground", () => {
  const { $trpc } = useNuxtApp();
  const callBackgrounds = ref<CallBackground[]>([]);
  // Read once per session for the picker's own render: the set is capped and only this store writes it, so
  // Every surface that opens the grid joins one listing instead of issuing its own
  const { read: readCallBackgrounds, refetch: refetchCallBackgrounds } = useCachedRead(
    () => $trpc.user.readCallBackgrounds.query(),
    {
      onSuccess: (newCallBackgrounds) => {
        callBackgrounds.value = newCallBackgrounds;
      },
    },
  );
  const isUploadingCallBackground = ref(false);
  const createCallBackground = async (file: File) => {
    const usedSlots = new Set(callBackgrounds.value.map(({ slot }) => slot));
    // The client allocates, because it is the only party holding a view that already accounts for a delete it
    // Just made — a listing would still be showing the blob a worker has yet to reclaim
    const slot = Array.from({ length: MAX_CALL_BACKGROUNDS }, (_value, index) => index).find(
      (index) => !usedSlots.has(index),
    );
    if (slot === undefined) return;

    isUploadingCallBackground.value = true;
    // The upload target is the server's to issue, so the slot is listed once the upload is confirmed, and a refetch is
    // The re-read rather than an append: the listing is the index, and it is also where the size a presigned write url
    // Could not bound is checked, so a slot that landed over the cap never reaches the picker
    await withFinalizerAsync(
      () =>
        getResultAsync(async () => {
          const presignedUrl = await $trpc.user.generateCallBackgroundUploadUrl.mutate({
            mimetype: file.type,
            size: file.size,
            slot,
          });
          await uploadFilesToPresignedUrls({
            files: [file],
            generateUploadFilePresignedUrlEntities: getSingleFilePresignedUrlEntities(presignedUrl),
          });
          // The upload lands without the bucket binding, so the confirm is what wakes the listing's other watchers. The
          // Upload has landed by now, so a confirm that fails is logged rather than reported as a failed upload
          await getResultAsync(() => $trpc.user.confirmCallBackgroundUpload.mutate({ slot })).match(
            noop,
            console.error,
          );
        }).match(() => refetchCallBackgrounds(), createErrorAlert),
      () => {
        isUploadingCallBackground.value = false;
      },
    );
  };
  // Answers whether the server deleted the slot, so the dialog that asked keeps its place over a refusal
  const deleteCallBackground = (slot: CallBackground["slot"]) =>
    getResultAsync(() => $trpc.user.deleteCallBackground.mutate({ slot })).match(
      () => true,
      (error) => {
        createErrorAlert(error);
        return false;
      },
    );
  // One selection, two kinds of background: a preset resolves to the static path it ships as, a slot to a
  // Freshly signed presigned read url, and anything resolving to neither is no background at all - the state the
  // Picker's None entry already selects. That is what makes a deleted slot degrade instead of publishing a
  // Camera track with a broken image composited behind it
  const readVirtualBackgroundImagePath = async (virtualBackground: UserSettingsInMessage["virtualBackground"]) => {
    const preset = CallVirtualBackgroundDefinitions.find(({ id }) => id === virtualBackground);
    if (preset) return preset.url;
    // Re-read rather than resolve from the session cache, and only a slot ever gets here so a preset still pays
    // Nothing. A cached listing is wrong in both directions over the life of a session: it holds a slot another
    // Device has deleted, whose url would resolve to a blob that is gone rather than to no background, and its
    // Presigned read urls expires while the session stays open
    await refetchCallBackgrounds();
    return (
      callBackgrounds.value.find((callBackground) => getCallBackgroundSelection(callBackground) === virtualBackground)
        ?.presignedUrl ?? ""
    );
  };
  return {
    callBackgrounds,
    createCallBackground,
    deleteCallBackground,
    isUploadingCallBackground,
    readCallBackgrounds,
    readVirtualBackgroundImagePath,
  };
});
