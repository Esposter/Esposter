import { useRoomStore } from "#src/store/message/room/index";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { getSynchronizedFunction } from "@esposter/shared";

// The open room's topic is watched, since a person's name or image is published on the topic of each room they are in.
// Each publish re-reads the users that room shows, so a rename reaches the names on screen. A publish made while the room
// Was not watched — closed, or the connection down — is missed, so opening the room re-reads the users it still holds too
export const useRoomUserSubscribables = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const connectionStore = useConnectionStore();
  const { watchTopics } = connectionStore;
  const refreshRoomUsers = useRefreshRoomUsers();
  const { executeQuery } = useMutation();
  // Latest wins per room: a publish that starts a newer refresh supersedes the one in flight, which then stores nothing
  const refreshRoomUsersInBackground = getSynchronizedFunction((roomId: string) =>
    executeQuery((checkIsStale) => refreshRoomUsers(roomId, checkIsStale), { key: roomId, onError: console.error }),
  );
  useOnlineSubscribable(
    currentRoomId,
    (roomId) => {
      if (!roomId) return undefined;

      refreshRoomUsersInBackground(roomId);
      return watchTopics([getTopic(TopicKind.Room, roomId)], () => {
        refreshRoomUsersInBackground(roomId);
      });
    },
    getOnlineSubscribableContext(),
  );
};
