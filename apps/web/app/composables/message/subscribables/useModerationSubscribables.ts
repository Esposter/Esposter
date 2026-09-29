import { getSynchronizedFunction, getResultAsync, noop } from "@esposter/shared";
import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useRoomStore } from "@/store/message/room";

export const useModerationSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const adminActionMap = useAdminActionMap();
  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return undefined;

    return getUnsubscribe(
      $trpc.message.moderation.onAdminAction.subscribe(
        { roomId },
        {
          onData: getSynchronizedFunction(({ durationMs, type }) =>
            getResultAsync(() => adminActionMap[type](roomId, durationMs)).match(noop, console.error),
          ),
        },
      ),
    );
  });
};
