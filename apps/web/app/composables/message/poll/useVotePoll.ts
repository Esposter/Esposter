import type { ClientMessage } from "#src/models/message/ClientMessage";

import { useDataStore } from "#src/store/message/data";

export const useVotePoll = async (message: () => ClientMessage, isPreview: boolean) => {
  const dataStore = useDataStore();
  const { checkIsVotePending, votePoll } = dataStore;
  const { data: session } = await useAuthSession();
  // Scoped to the poll bound right now rather than to anything this instance has in flight — `message` is a
  // Getter, so the surface can re-point at another poll, and a whole-instance flag would disable a radio group
  // Whose own vote landed long ago
  const isVoting = computed(() => checkIsVotePending(toValue(message)));
  // An empty option id withdraws the reader's vote, as the server takes it. Nothing is drawn before the room's answer,
  // Which is the poll it stores, so the poll on screen never shows a vote the room did not keep
  const vote = (optionId: string) => {
    if (!session.value?.user.id || isPreview) return;

    const messageValue = toValue(message);
    votePoll({ id: messageValue.id, optionId, roomId: messageValue.roomId });
  };
  return { isVoting, vote };
};
