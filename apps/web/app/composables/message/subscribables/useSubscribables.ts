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
  useRoomCache();
  useRoomListEvents();
  useRoomSocket();
  useRoomUserSubscribables();
  useTypingEvents();
  useUserToRoomSubscribables();
  await Promise.all([useReadFriends()(), useUserSubscribables()]);
};
