import type { Unsubscribable } from "@trpc/server/observable";

import { coalesceMissingIUserStatusFields } from "#shared/services/user/coalesceMissingIUserStatusFields";
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

  watch(members, (newMembers) => {
    upsertStatusUnsubscribable.value?.unsubscribe();
    const newMemberIds = newMembers.filter(({ id }) => id !== session.value.data?.user.id).map(({ id }) => id);
    if (newMemberIds.length === 0) return;
    upsertStatusUnsubscribable.value = $trpc.user.onUpsertStatus.subscribe(newMemberIds, {
      onData: ({ status, userId, ...rest }) => {
        const oldUserStatus = userStatusMap.value.get(userId);
        if (!oldUserStatus) userStatusMap.value.set(userId, { status, ...coalesceMissingIUserStatusFields(rest) });
        else userStatusMap.value.set(userId, { ...oldUserStatus, status, ...coalesceMissingIUserStatusFields(rest) });
      },
    });
  });

  onUnmounted(() => {
    upsertStatusUnsubscribable.value?.unsubscribe();
  });
};
