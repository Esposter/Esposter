export const readMemberMentionItems = async (query: string, roomId: string) => {
  const { $trpc } = useNuxtApp();
  const { items } = await $trpc.room.readMembers.query({ filter: query ? { name: query } : undefined, roomId });
  return items;
};
