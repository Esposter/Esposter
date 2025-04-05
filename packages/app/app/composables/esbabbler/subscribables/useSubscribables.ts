export const useSubscribables = async () => {
  useEmojiSubscribables();
  useMessageSubscribables();
  await useTypingSubscribables();
};
