import { useRefreshRoomUsers } from "#src/composables/message/room/useRefreshRoomUsers";
import { setRoomUsers } from "#src/services/message/room/setRoomUsers";
import { useRoomStore } from "#src/store/message/room/index";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

// The open room's topic is watched, since a person's name or image is published on the topic of each room they are in.
// Each publish re-reads the users that room shows, so a rename reaches the names on screen.
// The refresh reads that topic, so the watch it sets up is the one a read makes, from the time the read began.
// Opening a room re-reads the users it still holds too.
// A room that closes releases its watch by starting an empty run, which aborts the refresh in flight
export const useRoomUserSubscribables = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const refreshRoomUsers = useRefreshRoomUsers();
  // Users have no version, so a refresh is local work in a run scope: the newest one applies, and one a newer one
  // Started is aborted before it commits
  const roomUsersRunScope = useRunScope();
  const refreshRoomUsersInBackground = getSynchronizedFunction((roomId: string) =>
    getResultAsync(() =>
      roomUsersRunScope.run(
        () => refreshRoomUsers(roomId),
        (users) => {
          setRoomUsers(roomId, users);
        },
      ),
    ).match(noop, console.error),
  );
  const releaseRoomUsers = getSynchronizedFunction(() => roomUsersRunScope.run(() => Promise.resolve([]), noop));
  useOnlineSubscribable(
    currentRoomId,
    (roomId) => {
      if (!roomId) return undefined;

      refreshRoomUsersInBackground(roomId);
      return () => {
        releaseRoomUsers();
      };
    },
    getOnlineSubscribableContext(),
  );
};
