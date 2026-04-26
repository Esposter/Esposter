import type { HideDirectMessageInput } from "#shared/models/db/room/HideDirectMessageInput";
import type { RoomInMessage, User } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { createOperationData } from "@/services/shared/createOperationData";
import { DatabaseEntityType } from "@esposter/db-schema";
import { RoutePath, takeOne, uuidValidateV4 } from "@esposter/shared";

export const useDirectMessageStore = defineStore("message/room/directMessage", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = useCursorPaginationData<RoomInMessage>();
  const {
    createDirectMessage: storeCreateDirectMessage,
    deleteDirectMessage: storeDeleteDirectMessage,
    ...restOperationData
  } = createOperationData(items, ["id"], DatabaseEntityType.DirectMessage);
  const directMessages = computed(() => items.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const directMessageParticipantsMap = ref(new Map<string, User[]>());
  const router = useRouter();
  const currentDirectMessageId = computed(() => {
    const roomId = router.currentRoute.value.params.id;
    return typeof roomId === "string" && uuidValidateV4(roomId) ? roomId : undefined;
  });

  const createDirectMessage = async (userIds: string[]) => {
    const room = await $trpc.directMessage.createDirectMessage.mutate(userIds);
    const existingDirectMessage = directMessages.value.find(({ id }) => id === room.id);
    if (!existingDirectMessage) storeCreateDirectMessage(room, true);
    await navigateTo(RoutePath.Messages(room.id));
  };

  const hideDirectMessage = async (input: HideDirectMessageInput) => {
    await $trpc.directMessage.hideDirectMessage.mutate(input);
    storeDeleteDirectMessage({ id: input });
    if (currentDirectMessageId.value === input) {
      const remainingDirectMessages = directMessages.value.filter(({ id }) => id !== input);
      await router.push({
        path:
          remainingDirectMessages.length > 0
            ? RoutePath.Messages(takeOne(remainingDirectMessages).id)
            : RoutePath.MessagesIndex,
        replace: true,
      });
    }
  };

  return {
    createDirectMessage,
    currentDirectMessageId,
    directMessageParticipantsMap,
    directMessages,
    hideDirectMessage,
    storeDeleteDirectMessage,
    ...restOperationData,
    ...restData,
  };
});
