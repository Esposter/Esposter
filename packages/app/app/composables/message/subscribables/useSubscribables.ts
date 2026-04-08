export const useSubscribables = () => {
  useEmojiSubscribables();
  useFriendSubscribables();
  useMessageCache();
  useMessageSubscribables();
  usePushSubscription();
  useRoomSubscribables();
  useTypingSubscribables();
  useUserSubscribables();
};
