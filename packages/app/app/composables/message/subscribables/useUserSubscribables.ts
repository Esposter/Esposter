import type { Unsubscribable } from "@trpc/server/observable";

import { authClient } from "@/services/auth/authClient";
import { useMemberStore } from "@/store/message/user/member";
import { useStatusStore } from "@/store/message/user/status";

export const useUserSubscribables = () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const statusStore = useStatusStore();
  const { statusMap } = storeToRefs(statusStore);

  const upsertStatusUnsubscribable = ref<Unsubscribable>();

  const unsubscribe = () => {
    upsertStatusUnsubscribable.value?.unsubscribe();
  };

  const { trigger } = watchTriggerable([members, () => session.value.data], ([newMembers, newSessionData]) => {
    if (!newSessionData) return;

    const newMemberIds = newMembers.filter(({ id }) => id !== newSessionData.user.id).map(({ id }) => id);
    if (newMemberIds.length === 0) return;

    upsertStatusUnsubscribable.value = $trpc.user.onUpsertStatus.subscribe(newMemberIds, {
      onData: ({ userId, ...userStatus }) => {
        statusMap.value.set(userId, userStatus);
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
