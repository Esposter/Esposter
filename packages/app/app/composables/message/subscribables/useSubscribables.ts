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
  useUserToRoomSubscribables();
  await Promise.all([
    useFriendSubscribables(),
    useTypingSubscribables(),
    useUserSubscribables(),
    useCallSubscribables(),
  ]);
};
