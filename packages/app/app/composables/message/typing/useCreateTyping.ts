import { dayjs } from "#shared/services/dayjs";
import { authClient } from "@/services/auth/authClient";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";

export const useCreateTyping = async () => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const inputStore = useInputStore();
  const { input } = storeToRefs(inputStore);
  // Created before the first await so it stays bound to the component's effect scope
  const throttledInput = useThrottle(input, dayjs.duration(1, "second").asMilliseconds());
  const { data: session } = await authClient.useSession(useFetch);
  // Watchers created after an await inside a composable are not auto-scoped — stop manually on unmount
  const stop = watch(throttledInput, async () => {
    if (!(currentRoomId.value && session.value)) return;
    await $trpc.message.createTyping.query({
      roomId: currentRoomId.value,
      userId: session.value.user.id,
      username: session.value.user.name,
    });
  });
};
