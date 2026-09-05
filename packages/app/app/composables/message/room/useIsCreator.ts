import type { MessageEntity } from "@esposter/db-schema";

import { checkIsMessageAuthor } from "#shared/services/message/checkIsMessageAuthor";
import { authClient } from "@/services/auth/authClient";
import { useRoomStore } from "@/store/message/room";

export const useIsCreator = async (message: MaybeRefOrGetter<MessageEntity | undefined>) => {
  const { data: session } = await authClient.useSession(useFetch);
  const roomStore = useRoomStore();
  const { isCreator } = storeToRefs(roomStore);
  return computed(() => {
    const messageValue = toValue(message);
    if (!messageValue) return false;
    // Authorship is asked of the same helper getMessageProcedure asks, so the menu offers exactly the
    // Operations the procedure accepts — a type this composable answers "no" for is a type whose
    // Author-permitted operations are unreachable to the person who authored it
    return checkIsMessageAuthor(messageValue, session.value?.user.id) || isCreator.value;
  });
};
