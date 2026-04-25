export const useSubscribables = async () => {
  useEmojiSubscribables();
  await useFriendSubscribables();
  useMessageCache();
  useModerationSubscribables();
  useMessageSubscribables();
  usePushSubscription();
  useRoleSubscribables();
  useRoomSubscribables();
  await useTypingSubscribables();
  await useUserSubscribables();
  await useVoiceSubscribables();
};
