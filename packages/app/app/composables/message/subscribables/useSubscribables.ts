export const useSubscribables = () => {
  useEmojiSubscribables();
  useMessageCache();
  useMessageSubscribables();
  usePushSubscription();
  useRoomSubscribables();
  useTypingSubscribables();
  useUserSubscribables();
};
