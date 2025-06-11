export const useSubscribables = () => {
  useEmojiSubscribables();
  useMessageSubscribables();
  useRoomSubscribables();
  useTypingSubscribables();
  useUserSubscribables();
};
