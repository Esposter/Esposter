import { authClient } from "@/services/auth/authClient";

export const useReadData = async (unauthedReader: () => void, authedReader: () => Promise<void>) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await authClient.useSession(useFetch);
  // Watchers created after an await inside a composable are not auto-scoped — stop manually on unmount
  const stop = watch(
    () => session.value,
    async (newSessionData) => {
      if (newSessionData) await authedReader();
      else unauthedReader();
    },
  );
  onUnmounted(stop, currentInstance);

  if (session.value) await authedReader();
  // Unauthenticated means reading data from local storage, which must happen onMounted.
  else onMounted(unauthedReader, currentInstance);
};
