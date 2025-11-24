import type { WatchHandle } from "vue";

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
  let watchHandle: undefined | WatchHandle;

  onMounted(() => {
    watchHandle = watchImmediate(
      [members, () => session.value.data],
      ([newMembers, newSessionData]) => {
        if (!newSessionData) return;

        const newMemberIds = newMembers.filter(({ id }) => id !== newSessionData.user.id).map(({ id }) => id);
        if (newMemberIds.length === 0) return;

        const upsertStatusUnsubscribable = $trpc.user.onUpsertStatus.subscribe(newMemberIds, {
          onData: ({ userId, ...userStatus }) => {
            statusMap.value.set(userId, userStatus);
          },
        });

        return () => {
          upsertStatusUnsubscribable.unsubscribe();
        };
      },
      { flush: "post" },
    );
  });

  onUnmounted(() => {
    watchHandle?.();
  });
};
