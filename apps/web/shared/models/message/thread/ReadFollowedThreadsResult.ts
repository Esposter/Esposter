import type { RoomMessage } from "@esposter/db-schema";

export interface ReadFollowedThreadsResult {
  // Follow state, including follows whose root message was deleted
  threadRootIds: RoomMessage["id"][];
  // Display list for the Threads drawer, newest root first, with deleted roots dropped. Any message type can be a
  // Thread root, a webhook's included, so this is every message type rather than one of them
  threads: RoomMessage[];
}
