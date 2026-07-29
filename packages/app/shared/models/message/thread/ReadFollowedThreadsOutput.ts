import type { StandardMessageEntity } from "@esposter/db-schema";

export interface ReadFollowedThreadsOutput {
  // Follow state, including follows whose root message was deleted
  threadRootRowKeys: StandardMessageEntity["rowKey"][];
  // Display list for the Threads drawer, with deleted roots dropped
  threads: StandardMessageEntity[];
}
