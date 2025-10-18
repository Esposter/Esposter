import type { MessageEntity } from "@esposter/db-schema";

import { useMemberStore } from "@/store/message/member";
import { MessageType } from "@esposter/db-schema";

export const useCreator = (message: MaybeRefOrGetter<MessageEntity>) => {
  const memberStore = useMemberStore();
  const { members } = storeToRefs(memberStore);
  const creator = computed(() => {
    const messageValue = toValue(message);
    return messageValue.type === MessageType.Webhook
      ? messageValue.appUser
      : members.value.find(({ id }) => id === messageValue.userId);
  });
  return creator;
};
