import type { Promisable } from "type-fest";

import { getResultAsync, noop } from "@esposter/shared";

// The signed-in reader is handed the account's id from the session read here, so it never reads a session of its own
export const useReadData = async (
  unauthedReader: () => Promisable<void>,
  authedReader: (accountUserId: string) => Promisable<void>,
) => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await useAuthSession();
  // The watch runs after the await above, so Vue has no component to hand a failed read to, and it is logged here instead
  const stop = watch(
    () => session.value,
    (newSessionData) =>
      getResultAsync(async () => {
        if (newSessionData) await authedReader(newSessionData.user.id);
        else await unauthedReader();
      }).match(noop, console.error),
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
