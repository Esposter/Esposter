export const readMemberMentionItems = async (query: string, roomId: string) => {
  const { $trpc } = useNuxtApp();
  const { items } = await $trpc.room.readMembers.query({ filter: query ? { name: query } : undefined, roomId });
  // A removed member's row is read back as a tombstone, and a mention names a member who is still in the room
  return items.filter(({ deletedAt }) => !deletedAt);
};
