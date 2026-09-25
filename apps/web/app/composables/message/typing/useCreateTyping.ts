import { authClient } from "@/services/auth/authClient";
import { useInputStore } from "@/store/message/input";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

export const useCreateTyping = async () => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  const inputStore = useInputStore();
  const { input } = storeToRefs(inputStore);
  // Created before the first await so it stays bound to the component's effect scope
  const throttledInput = useThrottle(input, Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
  const { data: session } = await authClient.useSession(useFetch);
  const stop = watch(throttledInput, async () => {
    if (currentRoomId.value && session.value)
      await $trpc.message.createTyping.query({
        roomId: currentRoomId.value,
        userId: session.value.user.id,
        // The name the room knows the typist by, which is what every other member reads it as
        username: getDisplayName(session.value.user, currentRoomId.value),
      });
  });

  onUnmounted(stop, currentInstance);
};
