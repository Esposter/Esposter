import { useConnectionStore } from "@/store/realtime/connection";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useModerationEvents = () => {
  const adminActionMap = useAdminActionMap();
  const connectionStore = useConnectionStore();
  const { onRoomEvent } = connectionStore;

  onScopeDispose(
    onRoomEvent(
      "adminAction",
      getSynchronizedFunction(({ durationMs, roomId, type }) =>
        getResultAsync(() => adminActionMap[type](roomId, durationMs)).match(noop, console.error),
      ),
    ),
  );
};
