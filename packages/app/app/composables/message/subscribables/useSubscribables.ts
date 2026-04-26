export const useSubscribables = async () => {
  useEmojiSubscribables();
  useMessageCache();
  useModerationSubscribables();
  useMessageSubscribables();
  usePushSubscription();
  useRoleSubscribables();
  useRoomSubscribables();
  await Promise.all([
    useFriendSubscribables(),
    useTypingSubscribables(),
    useUserSubscribables(),
    useVoiceSubscribables(),
  ]);
};
