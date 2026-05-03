import { getIsServer } from "@esposter/shared";

export const useSubscribables = async () => {
  if (getIsServer()) return;

  useEmojiSubscribables();
  useMessageCache();
  useModerationSubscribables();
  useMessageSubscribables();
  usePushSubscription();
  useRoleSubscribables();
  useRoomSubscribables();
  await Promise.all([
    useFriendSubscribables(),
    useTypingSubscribables(),
    useUserSubscribables(),
    useVoiceSubscribables(),
  ]);
};
