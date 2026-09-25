// What a mock throws for a member of the real client it does not reproduce. It names the member rather than
// Borrowing `InvalidOperationError`, whose `Operation` describes what the caller asked for — the caller asked for
// Something valid, and it is the mock that falls short.
export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`${name} is not implemented in the mock`);
    this.name = "NotImplementedError";
  }
}
