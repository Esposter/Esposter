import { authClient } from "@/services/auth/authClient";
import { useMemberStore } from "@/store/message/user/member";
import { useStatusStore } from "@/store/message/user/status";

export const useUserSubscribables = async () => {
  const { data: session } = await authClient.useSession(useFetch);
  const { $trpc } = useNuxtApp();
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const statusStore = useStatusStore();
  const { statusMap } = storeToRefs(statusStore);

  useOnlineSubscribable([members, session], ([newMembers, newSession]) => {
    if (!newSession) return undefined;

    const newMemberIds = newMembers.filter(({ id }) => id !== newSession.user.id).map(({ id }) => id);
    if (newMemberIds.length === 0) return undefined;

    const upsertStatusUnsubscribable = $trpc.user.onUpsertStatus.subscribe(newMemberIds, {
      onData: ({ userId, ...userStatus }) => {
        statusMap.value.set(userId, userStatus);
      },
    });

    return () => {
      upsertStatusUnsubscribable.unsubscribe();
    };
  });
};
