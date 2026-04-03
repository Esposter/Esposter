import { useDirectMessageStore } from "@/store/message/room/directMessage";

export const useCreateDirectMessage = () => {
  const directMessageStore = useDirectMessageStore();
  const createDirectMessage = (userIds: string[]) => directMessageStore.createDirectMessage(userIds);
  return { createDirectMessage };
};
