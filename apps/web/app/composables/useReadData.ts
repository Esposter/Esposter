import type { Promisable } from "type-fest";

export const useReadData = async (unauthedReader: () => Promisable<void>, authedReader: () => Promise<void>) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await useAuthSession();
  const stop = watch(
    () => session.value,
    async (newSessionData) => {
      if (newSessionData) await authedReader();
      else await unauthedReader();
    },
  );
  onUnmounted(() => {
    stop();
  }, currentInstance);

  if (session.value) await authedReader();
  // Unauthenticated means reading data from local storage, which must happen onMounted.
  else
    onMounted(async () => {
      await unauthedReader();
    }, currentInstance);
};
