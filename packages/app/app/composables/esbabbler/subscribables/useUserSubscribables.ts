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

  const upsertStatusUnsubscribable = ref<Unsubscribable>();

  const unsubscribe = () => {
    upsertStatusUnsubscribable.value?.unsubscribe();
  };

  const { trigger } = watchTriggerable(members, (newMembers) => {
    unsubscribe();

    const newMemberIds = newMembers.filter(({ id }) => id !== session.value.data?.user.id).map(({ id }) => id);
    if (newMemberIds.length === 0) return;

    upsertStatusUnsubscribable.value = $trpc.user.onUpsertStatus.subscribe(newMemberIds, {
      onData: ({ userId, ...userStatus }) => {
        userStatusMap.value.set(userId, userStatus);
      },
    });
  });

  onMounted(() => {
    trigger();
  });

  onUnmounted(() => {
    unsubscribe();
  });
};
