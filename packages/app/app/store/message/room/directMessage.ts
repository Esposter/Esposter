import type { CreateDirectMessageParticipantInput } from "#shared/models/db/room/CreateDirectMessageParticipantInput";
import type { DeleteDirectMessageParticipantInput } from "#shared/models/db/room/DeleteDirectMessageParticipantInput";
import type { HideDirectMessageInput } from "#shared/models/db/room/HideDirectMessageInput";
import type { RoomInMessage, User } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { authClient } from "@/services/auth/authClient";
import { createOperationData } from "@/services/shared/createOperationData";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";
import { RoutePath, takeOne, uuidValidateV4 } from "@esposter/shared";

export const useDirectMessageStore = defineStore("message/room/directMessage", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = useCursorPaginationData<RoomInMessage>();
  const {
    createDirectMessage: storeCreateDirectMessage,
    deleteDirectMessage: storeDeleteDirectMessage,
    updateDirectMessage: storeUpdateDirectMessage,
    ...restOperationData
  } = createOperationData(items, ["id"], DerivedDatabaseEntityType.DirectMessage);
  const directMessages = computed(() => items.value.toSorted((a, b) => dayjs(b.updatedAt).diff(a.updatedAt)));
  const directMessageParticipantsMap = ref(new Map<string, User[]>());
  const router = useRouter();
  const currentDirectMessageId = computed(() => {
    const roomId = router.currentRoute.value.params.id;
    return typeof roomId === "string" && uuidValidateV4(roomId) ? roomId : undefined;
  });
  const currentDirectMessage = computed(() =>
    directMessages.value.find(({ id }) => id === currentDirectMessageId.value),
  );
  const session = authClient.useSession();

  const createDirectMessage = async (userIds: string[]) => {
    const room = await $trpc.room.directMessage.createDirectMessage.mutate(userIds);
    const existingDirectMessage = directMessages.value.find(({ id }) => id === room.id);
    if (!existingDirectMessage) storeCreateDirectMessage(room, true);
    await navigateTo(RoutePath.Messages(room.id));
  };
  const createDirectMessageParticipant = async (input: CreateDirectMessageParticipantInput) => {
    const user = await $trpc.room.directMessage.createDirectMessageParticipant.mutate(input);
    const participants = directMessageParticipantsMap.value.get(input.roomId) ?? [];
    if (!participants.some(({ id }) => id === user.id))
      directMessageParticipantsMap.value.set(input.roomId, [...participants, user]);
  };
  const deleteDirectMessageParticipant = async (input: DeleteDirectMessageParticipantInput) => {
    await $trpc.room.directMessage.deleteDirectMessageParticipant.mutate(input);
    const participants = directMessageParticipantsMap.value.get(input.roomId) ?? [];
    directMessageParticipantsMap.value.set(
      input.roomId,
      participants.filter(({ id }) => id !== input.userId),
    );
    if (session.value.data?.user.id !== input.userId) return;

    storeDeleteDirectMessage({ id: input.roomId });
    await router.push({
      path:
        directMessages.value.length > 0
          ? RoutePath.Messages(takeOne(directMessages.value).id)
          : RoutePath.MessagesIndex,
      replace: true,
    });
  };

  const hideDirectMessage = async (input: HideDirectMessageInput) => {
    await $trpc.room.directMessage.hideDirectMessage.mutate(input);
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
    createDirectMessageParticipant,
    currentDirectMessage,
    currentDirectMessageId,
    deleteDirectMessageParticipant,
    directMessageParticipantsMap,
    directMessages,
    hideDirectMessage,
    storeDeleteDirectMessage,
    storeUpdateDirectMessage,
    ...restOperationData,
    ...restData,
  };
});
