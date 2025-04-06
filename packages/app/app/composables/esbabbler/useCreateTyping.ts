import { dayjs } from "#shared/services/dayjs";
import { authClient } from "@/services/auth/authClient";
import { useMessageInputStore } from "@/store/esbabbler/messageInput";
import { useRoomStore } from "@/store/esbabbler/room";

export const useCreateTyping = () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const messageInputStore = useMessageInputStore();
  const { messageInput } = storeToRefs(messageInputStore);
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const throttledCreateTyping = useThrottleFn(async () => {
    if (!(currentRoomId.value && session.value.data)) return;
    await $trpc.message.createTyping.query({
      roomId: currentRoomId.value,
      userId: session.value.data.user.id,
      username: session.value.data.user.name,
    });
  }, dayjs.duration(1, "second").asMilliseconds());

  watch(messageInput, async () => {
    await throttledCreateTyping();
  });
};
