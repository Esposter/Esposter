export const useSubscribables = () => {
  useEmojiSubscribables();
  useFriendSubscribables();
  useMessageCache();
  useMessageSubscribables();
  usePushSubscription();
  useRoleSubscribables();
  useRoomSubscribables();
  useTypingSubscribables();
  useUserSubscribables();
  useVoiceSubscribables();
};
