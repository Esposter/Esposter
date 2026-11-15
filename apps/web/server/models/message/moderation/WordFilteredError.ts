// The one message-creation guard whose rejection is deterministic: the words are stored and the message text
// Is fixed, so a re-check re-reads exactly the same pair and blocks again — and the guard has already applied
// The room's automod action. Every path that can re-run the guard for the same message carries this marker so
// It burns the job instead of retrying, which is what keeps that action applied once per blocked message.
export class WordFilteredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WordFilteredError";
  }
}
