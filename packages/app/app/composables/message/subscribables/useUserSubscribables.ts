import { authClient } from "@/services/auth/authClient";
import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { useMemberStore } from "@/store/message/user/member";
import { useStatusStore } from "@/store/message/user/status";

export const useUserSubscribables = async () => {
  const onlineSubscribableContext = getOnlineSubscribableContext();
  const { data: session } = await authClient.useSession(useFetch);
  const { $trpc } = useNuxtApp();
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const statusStore = useStatusStore();
  const { storeStatus } = statusStore;

  useOnlineSubscribable(
    [() => getIdsKey(members.value), session],
    ([memberIdsString, newSession]) => {
      if (!newSession) return undefined;

      const newMemberIds = memberIdsString.split(",").filter((id) => id && id !== newSession.user.id);
      if (newMemberIds.length === 0) return undefined;

      const upsertStatusUnsubscribable = $trpc.user.onUpsertStatus.subscribe(newMemberIds, {
        onData: ({ userId, ...userStatus }) => {
          storeStatus(userId, userStatus);
        },
      });

      return () => {
        upsertStatusUnsubscribable.unsubscribe();
      };
    },
    onlineSubscribableContext,
  );
};
