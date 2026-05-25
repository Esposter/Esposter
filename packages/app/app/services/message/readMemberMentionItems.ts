import type { User } from "@esposter/db-schema";

export const readMemberMentionItems = async (query: string, roomId: string): Promise<User[]> => {
  const { $trpc } = useNuxtApp();
  const { items } = await $trpc.room.readMembers.query({ filter: query ? { name: query } : undefined, roomId });
  return items;
};
