import { dayjs } from "#shared/services/dayjs";
import { authClient } from "@/services/auth/authClient";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";

export const useCreateTyping = () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const inputStore = useInputStore();
  const { input } = storeToRefs(inputStore);
  const throttledInput = useThrottle(input, dayjs.duration(1, "second").asMilliseconds());

  watch(throttledInput, async () => {
    if (!(currentRoomId.value && session.value.data)) return;
    await $trpc.message.createTyping.query({
      roomId: currentRoomId.value,
      userId: session.value.data.user.id,
      username: session.value.data.user.name,
    });
  });
};
