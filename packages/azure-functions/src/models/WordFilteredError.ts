// The one delivery guard whose rejection is deterministic: the words are stored and the message text is
// Fixed, so a redelivery re-reads exactly the same pair and blocks again. The handler tombstones the job
// Instead of asking Service Bus to retry it, which is also what keeps the automod action applied once.
export class WordFilteredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WordFilteredError";
  }
}
