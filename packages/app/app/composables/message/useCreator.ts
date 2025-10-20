import type { MessageEntity } from "@esposter/db-schema";

import { useAppUserStore } from "@/store/message/user/appUser";
import { useMemberStore } from "@/store/message/user/member";
import { MessageType } from "@esposter/db-schema";

export const useCreator = (message: MaybeRefOrGetter<MessageEntity | undefined>) => {
  const memberStore = useMemberStore();
  const { memberMap } = storeToRefs(memberStore);
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);
  return computed(() => {
    const messageValue = toValue(message);
    if (!messageValue) return;

    if (messageValue.type === MessageType.Webhook) {
      const appUser = appUserMap.value.get(messageValue.appUser.id);
      return appUser ? { ...appUser, ...messageValue.appUser } : undefined;
    } else return memberMap.value.get(messageValue.userId);
  });
};
