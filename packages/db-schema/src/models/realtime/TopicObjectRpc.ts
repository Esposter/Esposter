// The RPC surface of a Topic object, one per topic and named for it, which the realtime Worker exports and the web
// Worker And the user objects call. It holds the users watching its topic and the columns each one reads, and a publish
// Reaches Each user whose columns it names once per short window however many writes landed in it
export interface TopicObjectRpc {
  // `columns` is what the write changed: undefined for a row-set change, which reaches every subscriber of the topic
  publish: (columns?: string[]) => Promise<void>;
  // `readAt` is when the subscriber's read began: a publish since then is told to the subscriber at once. `columns` is
  // What The subscriber's read references in the topic's table, undefined when it names every column
  subscribe: (userId: string, readAt: number, columns?: string[]) => Promise<void>;
  unsubscribe: (userId: string) => Promise<void>;
}
