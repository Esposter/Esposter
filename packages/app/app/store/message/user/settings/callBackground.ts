import type { CallBackground } from "#shared/models/message/call/CallBackground";
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { getSingleFileSasEntities } from "@/services/file/getSingleFileSasEntities";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { CallVirtualBackgroundDefinitions } from "@/services/message/room/call/CallVirtualBackgroundDefinitions";
import { getCallBackgroundSelection } from "@/services/message/room/call/getCallBackgroundSelection";

// The upload, the delete and the resolve all address the same capped set, and every one of them is a read of
// The container listing rather than of a table — so they share one store instead of one cache each
const CALL_BACKGROUND_MUTATION_KEY = "callBackground";

export const useCallBackgroundStore = defineStore("message/user/settings/callBackground", () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation, getIsPending } = useMutation();
  const callBackgrounds = ref<CallBackground[]>([]);
  // Read once per session: the set is capped and only this store writes it, so every surface that renders the
  // Picker joins one listing instead of issuing its own
  const { read: readCallBackgrounds, refetch: refetchCallBackgrounds } = useCachedRead(
    () => $trpc.user.readCallBackgrounds.query(),
    {
      onSuccess: (newCallBackgrounds) => {
        callBackgrounds.value = newCallBackgrounds;
      },
    },
  );
  const isCallBackgroundPending = computed(() => getIsPending(CALL_BACKGROUND_MUTATION_KEY));
  const createCallBackground = async (file: File) => {
    await executeMutation(
      async () => {
        const { sasUrl } = await $trpc.user.generateCallBackgroundUploadUrl.mutate({
          mimetype: file.type,
          size: file.size,
        });
        await uploadFileToSas({ files: [file], generateUploadFileSasEntities: getSingleFileSasEntities(sasUrl) });
      },
      {
        key: CALL_BACKGROUND_MUTATION_KEY,
        // Re-read rather than appended optimistically: the listing is the index, and it is also where the size
        // A write SAS could not bound is checked - so a slot that landed over the cap never reaches the picker
        onSuccess: () => refetchCallBackgrounds(),
      },
    );
  };
  const deleteCallBackground = async (slot: CallBackground["slot"]) => {
    await executeMutation(() => $trpc.user.deleteCallBackground.mutate({ slot }), {
      // The blob is reclaimed by a worker rather than inline, so the listing would still hold the slot for as
      // Long as that takes. Dropping it here is what the user asked for, and the next listing agrees
      applyOptimistic: () => {
        const snapshot = callBackgrounds.value;
        callBackgrounds.value = callBackgrounds.value.filter((callBackground) => callBackground.slot !== slot);
        return () => {
          callBackgrounds.value = snapshot;
        };
      },
      key: CALL_BACKGROUND_MUTATION_KEY,
    });
  };
  // One selection, two kinds of background: a preset resolves to the static path it ships as, a slot to a
  // Freshly signed read SAS, and anything resolving to neither is no background at all - the state the
  // Picker's None entry already selects. That is what makes a deleted slot degrade instead of publishing a
  // Camera track with a broken image composited behind it
  const readVirtualBackgroundImagePath = async (virtualBackground: UserSettingsInMessage["virtualBackground"]) => {
    const preset = CallVirtualBackgroundDefinitions.find(({ imagePath }) => imagePath === virtualBackground);
    if (preset) return preset.imagePath;

    // Only a slot needs the listing, so selecting a preset never pays for a request
    await readCallBackgrounds();
    return (
      callBackgrounds.value.find((callBackground) => getCallBackgroundSelection(callBackground) === virtualBackground)
        ?.sasUrl ?? ""
    );
  };
  return {
    callBackgrounds,
    createCallBackground,
    deleteCallBackground,
    isCallBackgroundPending,
    readCallBackgrounds,
    readVirtualBackgroundImagePath,
  };
});
