import type { RoomThread, ThreadFollowInMessage } from "@esposter/db-schema";

export interface ReadFollowedThreadsResult {
  // Every follow row the member holds in the room, with its version, unfollowed ones included, newest root first
  follows: ThreadFollowInMessage[];
  // Display list for the Threads drawer, newest root first, with deleted roots dropped. Any message type can be a
  // Thread root, a webhook's included, so this is every message type rather than one of them
  threads: RoomThread[];
}
