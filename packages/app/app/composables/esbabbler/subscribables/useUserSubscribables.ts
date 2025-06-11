import type { Unsubscribable } from "@trpc/server/observable";

import { authClient } from "@/services/auth/authClient";
import { useMemberStore } from "@/store/esbabbler/member";
import { useUserStatusStore } from "@/store/esbabbler/userStatus";

export const useUserSubscribables = () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const userStatusStore = useUserStatusStore();
  const { userStatusMap } = storeToRefs(userStatusStore);

  const updateStatusUnsubscribable = ref<Unsubscribable>();

  watch(members, (newMembers) => {
    updateStatusUnsubscribable.value?.unsubscribe();
    const newMemberIds = newMembers.filter(({ id }) => id !== session.value.data?.user.id).map(({ id }) => id);
    if (newMemberIds.length === 0) return;
    updateStatusUnsubscribable.value = $trpc.user.onUpdateStatus.subscribe(newMemberIds, {
      onData: ({ userId, ...userStatus }) => {
        userStatusMap.value.set(userId, userStatus);
      },
    });
  });

  onUnmounted(() => {
    updateStatusUnsubscribable.value?.unsubscribe();
  });
};
