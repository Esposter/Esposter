import { authClient } from "@/services/auth/authClient";

export const useReadData = async (unauthedReader: () => void, authedReader: () => Promise<void>) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await authClient.useSession(useFetch);

  watch(
    () => session.value,
    async (newSessionData) => {
      if (newSessionData) await authedReader();
      else unauthedReader();
    },
  );

  if (session.value) await authedReader();
  // Unauthenticated means reading data from local storage, which must happen onMounted.
  else onMounted(unauthedReader, currentInstance);
};
