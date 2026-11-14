import { checkIsServer } from "@esposter/shared";

export const useSubscribables = async () => {
  if (checkIsServer()) return;

  useCallSubscribables();
  useCreateTyping();
  useEmojiEvents();
  useMemberCache();
  useMessageCache();
  useMessageEvents();
  useModerationEvents();
  usePushSubscription();
  useRoleEvents();
  useRoomCache();
  useRoomEmojiEvents();
  useRoomListEvents();
  useRoomSocket();
  useTypingEvents();
  useUserToRoomSubscribables();
  await Promise.all([useFriendSubscribables(), useUserSubscribables()]);
};
