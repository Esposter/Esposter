import { authClient } from "@/services/auth/authClient";

export const useReadData = async (unauthedReader: () => void, authedReader: () => Promise<void>) => {
  const session = authClient.useSession();

  watch(
    () => session.value.data,
    async (newSessionData) => {
      if (newSessionData) await authedReader();
      else unauthedReader();
    },
  );

  if (session.value.data) await authedReader();
  // We'll assume that not being authenticated means that we will read from local storage for data
  // which needs to be done onMounted
  else onMounted(unauthedReader);
};
