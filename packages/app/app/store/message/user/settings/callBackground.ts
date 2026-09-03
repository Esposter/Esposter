import type { CallBackground } from "#shared/models/message/call/CallBackground";
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { MAX_CALL_BACKGROUNDS } from "#shared/services/message/constants";
import { getSingleFileSasEntities } from "@/services/file/getSingleFileSasEntities";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { CallVirtualBackgroundDefinitions } from "@/services/message/room/call/CallVirtualBackgroundDefinitions";
import { getCallBackgroundSelection } from "@/services/message/room/call/getCallBackgroundSelection";
import { ID_SEPARATOR } from "@esposter/shared";

// One upload affordance, so one stable target: the picker's tile is disabled while a write is in flight, and
// This is what it reads. Deletes are keyed per slot instead — they are independent targets, and sharing one
// Key would serialise a user working down their own list
const CALL_BACKGROUND_UPLOAD_KEY = "callBackgroundUpload";
const getCallBackgroundKey = (slot: CallBackground["slot"]) => `callBackground${ID_SEPARATOR}${slot}`;

export const useCallBackgroundStore = defineStore("message/user/settings/callBackground", () => {
  const { $trpc } = useNuxtApp();
  const { checkIsPending, executeMutation } = useMutation();
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
  const isUploadingCallBackground = computed(() => checkIsPending(CALL_BACKGROUND_UPLOAD_KEY));
  const createCallBackground = async (file: File) => {
    const usedSlots = new Set(callBackgrounds.value.map(({ slot }) => slot));
    // The client allocates, because it is the only party holding a view that already accounts for a delete it
    // Just made — a listing would still be showing the blob a worker has yet to reclaim
    const slot = Array.from({ length: MAX_CALL_BACKGROUNDS }, (_, index) => index).find(
      (index) => !usedSlots.has(index),
    );
    if (slot === undefined) return;

    await executeMutation(
      async () => {
        const sasUrl = await $trpc.user.generateCallBackgroundUploadUrl.mutate({
          mimetype: file.type,
          size: file.size,
          slot,
        });
        await uploadFileToSas({ files: [file], generateUploadFileSasEntities: getSingleFileSasEntities(sasUrl) });
      },
      {
        key: CALL_BACKGROUND_UPLOAD_KEY,
        // Re-read rather than appended optimistically: the listing is the index, and it is also where the size
        // A write SAS could not bound is checked - so a slot that landed over the cap never reaches the picker
        onSuccess: () => refetchCallBackgrounds(),
      },
    );
  };
  const deleteCallBackground = async (slot: CallBackground["slot"]) => {
    await executeMutation(() => $trpc.user.deleteCallBackground.mutate({ slot }), {
      // The blob is reclaimed by a worker rather than inline, so the listing would hold the slot for as long as
      // That takes. Dropping it here is what the user asked for, and the next listing agrees. A rejected delete
      // Puts back only its own row: these run concurrently, so restoring the list as it stood would resurrect a
      // Slot deleted beside it
      applyOptimistic: () => {
        const deletedCallBackground = callBackgrounds.value.find((callBackground) => callBackground.slot === slot);
        callBackgrounds.value = callBackgrounds.value.filter((callBackground) => callBackground.slot !== slot);
        return () => {
          if (!deletedCallBackground) return;

          callBackgrounds.value = [...callBackgrounds.value, deletedCallBackground].toSorted(
            (left, right) => left.slot - right.slot,
          );
        };
      },
      key: getCallBackgroundKey(slot),
    });
  };
  // One selection, two kinds of background: a preset resolves to the static path it ships as, a slot to a
  // Freshly signed read SAS, and anything resolving to neither is no background at all - the state the
  // Picker's None entry already selects. That is what makes a deleted slot degrade instead of publishing a
  // Camera track with a broken image composited behind it
  const readVirtualBackgroundImagePath = async (virtualBackground: UserSettingsInMessage["virtualBackground"]) => {
    const preset = CallVirtualBackgroundDefinitions.find(({ imagePath }) => imagePath === virtualBackground);
    if (preset) return preset.imagePath;

    // Re-read rather than resolve from the session cache, and only a slot ever gets here so a preset still pays
    // Nothing. A cached listing is wrong in both directions over the life of a session: it holds a slot another
    // Device has deleted, whose url would resolve to a blob that is gone rather than to no background, and its
    // Read SAS expires while the session stays open
    await refetchCallBackgrounds();
    return (
      callBackgrounds.value.find((callBackground) => getCallBackgroundSelection(callBackground) === virtualBackground)
        ?.sasUrl ?? ""
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
