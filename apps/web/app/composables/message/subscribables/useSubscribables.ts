import { checkIsServer } from "@esposter/shared";

export const useSubscribables = async () => {
  if (checkIsServer()) return;

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
  useRoomEmojiSubscribables();
  useRoomSubscribables();
  useUserToRoomSubscribables();
  await Promise.all([useFriendSubscribables(), useTypingSubscribables(), useUserSubscribables()]);
};
