import { useConnectionStore } from "@/store/realtime/connection";

// The person's own socket, held while someone is signed in. The subscribable closes it on sign-out or unmount, and opens
// it again once the browser is back online, the same way every other subscription on the app does
export const useUserSocket = async () => {
  const connectionStore = useConnectionStore();
  const { closeUser, openUser } = connectionStore;
  const { data: session } = await useAuthSession();
  const onlineSubscribableContext = getOnlineSubscribableContext();

  useOnlineSubscribable(
    () => session.value?.user.id,
    (userId) => {
      if (!userId) return undefined;
      openUser();
      return closeUser;
    },
    onlineSubscribableContext,
  );
};
