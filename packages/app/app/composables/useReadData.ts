import { authClient } from "@/services/auth/authClient";

export const useReadData = async (unauthedReader: () => void, authedReader: () => Promise<void>) => {
  const { data: session } = await authClient.useSession(useFetch);

  watch(session, async (newSession) => {
    if (newSession) await authedReader();
    else unauthedReader();
  });

  if (session.value) await authedReader();
  // We'll assume that not being authenticated means that we will read from local storage for data
  // which needs to be done onMounted
  else onMounted(unauthedReader);
};
