import { getIsServer } from "@esposter/shared";

export const useSubscribables = async () => {
  if (getIsServer()) return;

  useCallSubscribables();
  useDirectMessageSubscribables();
  useEmojiSubscribables();
  useMemberCache();
  useMessageCache();
  useModerationSubscribables();
  useMessageSubscribables();
  usePushSubscription();
  useRoleSubscribables();
  useRoomCache();
  useRoomSubscribables();
  useUserToRoomSubscribables();
  await Promise.all([useFriendSubscribables(), useTypingSubscribables(), useUserSubscribables()]);
};
