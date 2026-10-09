import type { Promisable } from "type-fest";

// The signed-in reader is handed the account's id from the session read here, so it never reads a session of its own
export const useReadData = async (
  unauthedReader: () => Promisable<void>,
  authedReader: (accountUserId: string) => Promisable<void>,
) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await useAuthSession();
  const stop = watch(
    () => session.value,
    async (newSessionData) => {
      if (newSessionData) await authedReader(newSessionData.user.id);
      else await unauthedReader();
    },
  );
  onUnmounted(() => {
    stop();
  }, currentInstance);

  if (session.value) await authedReader(session.value.user.id);
  // Unauthenticated means reading data from local storage, which must happen onMounted.
  else
    onMounted(async () => {
      await unauthedReader();
    }, currentInstance);
};
