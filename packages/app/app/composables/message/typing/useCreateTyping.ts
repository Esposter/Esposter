import { dayjs } from "#shared/services/dayjs";
import { authClient } from "@/services/auth/authClient";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";

export const useCreateTyping = async () => {
  const { data: session } = await authClient.useSession(useFetch);
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const inputStore = useInputStore();
  const { input } = storeToRefs(inputStore);
  const throttledInput = useThrottle(input, dayjs.duration(1, "second").asMilliseconds());

  watch(throttledInput, async () => {
    if (!(currentRoomId.value && session.value)) return;
    await $trpc.message.createTyping.query({
      roomId: currentRoomId.value,
      userId: session.value.user.id,
      username: session.value.user.name,
    });
  });
};
