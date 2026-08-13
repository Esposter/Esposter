import type { MessageEntity, StandardMessageEntity } from "@esposter/db-schema";

export interface ReadFollowedThreadsOutput {
  // Follow state, including follows whose root message was deleted
  threadRootRowKeys: StandardMessageEntity["rowKey"][];
  // Display list for the Threads drawer, newest root first, with deleted roots dropped. Any message type can
  // Be a thread root, a webhook's included, so this is the entity union rather than the standard entity alone
  threads: MessageEntity[];
}
