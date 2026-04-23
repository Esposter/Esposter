import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useRoomStore } from "@/store/message/room";

export const useModerationSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const adminActionMap = useAdminActionMap();
  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return undefined;

    const adminActionUnsubscribable = $trpc.moderation.onAdminAction.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction(async ({ durationMs, type }) => {
          await adminActionMap[type](roomId, durationMs);
        }),
      },
    );

    return () => {
      adminActionUnsubscribable.unsubscribe();
    };
  });
};
