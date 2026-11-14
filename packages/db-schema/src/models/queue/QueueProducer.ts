// The one method a publisher calls on a queue binding. Stated here rather than taken from the Workers types, so the shared
// Schema package compiles without them and a test passes any object with a `send`
export interface QueueProducer<TBody> {
  send: (body: TBody) => Promise<unknown>;
}
