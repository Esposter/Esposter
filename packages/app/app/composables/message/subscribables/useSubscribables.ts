export const useSubscribables = () => {
  useEmojiSubscribables();
  useHuddleSubscribables();
  useMessageSubscribables();
  usePushSubscription();
  useRoomSubscribables();
  useTypingSubscribables();
  useUserSubscribables();
};
