import type { HideDirectMessageInput } from "#shared/models/db/room/HideDirectMessageInput";
import type { RoomInMessage, User } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { useMutation } from "@/composables/shared/useMutation";
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
  const executeMutation = useMutation();
  const createDirectMessage = async (userIds: string[]) => {
    // Server-generated room — non-optimistic, applied in onSuccess
    await executeMutation(() => $trpc.room.directMessage.createDirectMessage.mutate(userIds), {
      onSuccess: async (room) => {
        const existingDirectMessage = directMessages.value.find(({ id }) => id === room.id);
        if (!existingDirectMessage) storeCreateDirectMessage(room, true);
        await navigateTo(RoutePath.Messages(room.id));
      },
    });
  };
  const hideDirectMessage = async (input: HideDirectMessageInput) => {
    const snapshot = [...items.value];
    await executeMutation(() => $trpc.room.directMessage.hideDirectMessage.mutate(input), {
      applyOptimistic: () => {
        storeDeleteDirectMessage({ id: input });
        if (currentDirectMessageId.value === input) {
          const remainingDirectMessages = directMessages.value.filter(({ id }) => id !== input);
          void router.push({
            path:
              remainingDirectMessages.length > 0
                ? RoutePath.Messages(takeOne(remainingDirectMessages).id)
                : RoutePath.MessagesIndex,
            replace: true,
          });
        }
        return () => {
          items.value = snapshot;
        };
      },
    });
  };

  return {
    createDirectMessage,
    currentDirectMessage,
    currentDirectMessageId,
    directMessageParticipantsMap,
    directMessages,
    hideDirectMessage,
    storeDeleteDirectMessage,
    storeUpdateDirectMessage,
    ...restOperationData,
    ...restData,
  };
});
