// The RPC surface of a Topic object, one per topic and named for it, which the realtime Worker exports and the web Worker
// And the user objects call. It holds the users watching its topic, and a publish reaches each of their user objects once
// Per short window however many writes landed in it
export interface TopicObjectRpc {
  publish: () => Promise<void>;
  subscribe: (userId: string) => Promise<void>;
  unsubscribe: (userId: string) => Promise<void>;
}
