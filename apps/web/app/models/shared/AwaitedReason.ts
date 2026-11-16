// Why a write waits for the server's answer before the screen changes, the closed set a write that waits names. A
// Write fitting none of them is optimistic: what the reader sees next is a value only the server mints, an outcome
// Only the server decides, or a step that cannot be undone if the write is refused
export const AwaitedReason = {
  IrreversibleStep: "IrreversibleStep",
  ServerDecidedOutcome: "ServerDecidedOutcome",
  ServerIssuedValue: "ServerIssuedValue",
} as const;
export type AwaitedReason = (typeof AwaitedReason)[keyof typeof AwaitedReason];
