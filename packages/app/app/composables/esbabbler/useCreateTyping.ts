import { dayjs } from "#shared/services/dayjs";
import { authClient } from "@/services/auth/authClient";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";

export const useCreateTyping = async () => {
  const { data: session } = await authClient.useSession(useFetch);
  const { $trpc } = useNuxtApp();
  const messageInputStore = useMessageInputStore();
  const { messageInput } = storeToRefs(messageInputStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const debouncedCreateTyping = useDebounceFn(async () => {
    if (!(currentRoomId.value && session.value)) return;
    await $trpc.message.createTyping.query({
      roomId: currentRoomId.value,
      userId: session.value.user.id,
      username: session.value.user.name,
    });
  }, dayjs.duration(1, "second").asMilliseconds());

  watch(messageInput, async () => {
    await debouncedCreateTyping();
  });
};
