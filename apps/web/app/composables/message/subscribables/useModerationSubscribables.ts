import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { useRoomStore } from "@/store/message/room";
import { getResultAsync, noop } from "@esposter/shared";

export const useModerationSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const adminActionMap = useAdminActionMap();
  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return undefined;

    const adminActionUnsubscribable = $trpc.message.moderation.onAdminAction.subscribe(
      { roomId },
      {
        onData: getSynchronizedFunction(({ durationMs, type }) =>
          getResultAsync(() => adminActionMap[type](roomId, durationMs)).match(noop, console.error),
        ),
      },
    );

    return () => {
      adminActionUnsubscribable.unsubscribe();
    };
  });
};
