import type { Unsubscribable } from "@trpc/server/observable";

import { useMemberStore } from "@/store/esbabbler/member";
import { useUserStatusStore } from "@/store/esbabbler/userStatus";

export const useUserSubscribables = () => {
  const { $trpc } = useNuxtApp();
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const userStatusStore = useUserStatusStore();
  const { userStatusMap } = storeToRefs(userStatusStore);

  const updateStatusUnsubscribable = ref<Unsubscribable>();

  watch(members, (newMembers) => {
    updateStatusUnsubscribable.value?.unsubscribe();
    updateStatusUnsubscribable.value = $trpc.user.onUpdateStatus.subscribe(
      newMembers.map(({ id }) => id),
      {
        onData: ({ userId, ...userStatus }) => {
          userStatusMap.value.set(userId, userStatus);
        },
      },
    );
  });

  onUnmounted(() => {
    updateStatusUnsubscribable.value?.unsubscribe();
  });
};
