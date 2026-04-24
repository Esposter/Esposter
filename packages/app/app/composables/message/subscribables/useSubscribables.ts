export const useSubscribables = () => {
  useEmojiSubscribables();
  useFriendSubscribables();
  useMessageCache();
  useModerationSubscribables();
  useMessageSubscribables();
  usePushSubscription();
  useRoleSubscribables();
  useRoomSubscribables();
  useTypingSubscribables();
  useUserSubscribables();
  useVoiceSubscribables();
};
