import { useRoomStore } from "#src/store/message/room/index";
import { getSynchronizedFunction } from "@esposter/shared";

// The open room's topic is watched, since a person's name or image is published on the topic of each room they are in.
// Each publish re-reads the users that room shows, so a rename reaches the names on screen.
// The refresh reads that topic, so the watch it sets up is the one a read makes, from the time the read began.
// Opening a room re-reads the users it still holds too.
// A room that closes releases its watch by reading nothing under its key
export const useRoomUserSubscribables = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const refreshRoomUsers = useRefreshRoomUsers();
  const { executeQuery } = useMutation();
  // Latest wins per room: a publish that starts a newer refresh supersedes the one in flight, which then stores nothing
  const refreshRoomUsersInBackground = getSynchronizedFunction((roomId: string) =>
    executeQuery((checkIsStale) => refreshRoomUsers(roomId, checkIsStale), { key: roomId, onError: console.error }),
  );
  const releaseRoomUsers = getSynchronizedFunction((roomId: string) =>
    executeQuery(() => Promise.resolve(), { key: roomId }),
  );
  useOnlineSubscribable(
    currentRoomId,
    (roomId) => {
      if (!roomId) return undefined;

      refreshRoomUsersInBackground(roomId);
      return () => {
        releaseRoomUsers(roomId);
      };
    },
    getOnlineSubscribableContext(),
  );
};
