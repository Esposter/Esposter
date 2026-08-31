import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useStorageStore } from "@/store/storage";
import { checkIsServer, getResultAsync, noop } from "@esposter/shared";

export const useStorageSubscribables = async () => {
  if (checkIsServer()) return;

  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { $trpc } = useNuxtApp();
  const storageStore = useStorageStore();
  const { refetchStorageUsage, storeUpdateStorageUsage } = storageStore;
  const { data: session } = await authClient.useSession(useFetch);

  useOnlineSubscribable(
    () => session.value?.user.id,
    async (userId) => {
      if (!userId) return undefined;

      // What this process changes, it reports itself, carrying the figure so the meter moves within the save
      const updateUsageUnsubscribable = $trpc.storage.onUpdateUsage.subscribe(undefined, {
        onData: (newStorageUsage) => {
          storeUpdateStorageUsage(newStorageUsage);
        },
      });
      // What the Functions host changes arrives here instead, and says only that it moved. A re-read is what
      // Turns that into a figure: the quota is derived from the tier by the server, and a total computed on
      // The far side of a process boundary is one that can disagree with the gate the server enforces.
      // `refetch` rather than `read`, because a read issued because something changed must not join the
      // Cached answer that the change just invalidated
      // The tRPC subscription above is already live, so a client that fails to start has to take it down
      // Again before the rejection leaves: the setup returns its unsubscribe only on the path that succeeds, so
      // Nothing else ever holds a handle to it and the socket outlives the session that opened it
      const stopWebPubSubClient = await getResultAsync(() =>
        useWebPubSubClient(
          (signal) => $trpc.storage.generateWebPubSubClientAccessUrl.query(undefined, { signal }),
          getSynchronizedFunction(() => getResultAsync(refetchStorageUsage).match(noop, console.error)),
        ),
      ).match(
        (stop) => stop,
        (error) => {
          updateUsageUnsubscribable.unsubscribe();
          throw error;
        },
      );
      return () => {
        updateUsageUnsubscribable.unsubscribe();
        stopWebPubSubClient();
      };
    },
    onlineSubscribableContext,
  );
};
