import type { MessageEntity } from "@esposter/db-schema";

import { useMemberStore } from "@/store/message/user/member";
import { MessageType } from "@esposter/db-schema";
import { useAppUserStore } from "~/store/message/user/appUser";

export const useCreator = (message: MaybeRefOrGetter<MessageEntity | undefined>) => {
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const appUserStore = useAppUserStore();
  const { items } = storeToRefs(appUserStore);
  const creator = computed(() => {
    const messageValue = toValue(message);
    if (!messageValue) return undefined;

    if (messageValue.type === MessageType.Webhook) {
      const appUser = items.value.find(({ id }) => id === messageValue.appUser.id);
      return appUser ? { ...appUser, ...messageValue.appUser } : undefined;
    } else return members.value.find(({ id }) => id === messageValue.userId);
  });
  return creator;
};
