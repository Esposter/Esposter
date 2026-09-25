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
  useTypingSubscribables();
  useUserToRoomSubscribables();
  await Promise.all([useFriendSubscribables(), useUserSubscribables()]);
};
