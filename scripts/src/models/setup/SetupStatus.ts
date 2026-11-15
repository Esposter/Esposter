// What a step found or did.
// `ok` means it was already in place, and `done` means the command did it now.
// `needs you` names the command or link that closes it.
// `install` is the game client alone, and `info` reports a state the command does not judge.
export const SetupStatus = { Done: "done", Info: "info", Install: "install", NeedsYou: "needs you", Ok: "ok" } as const;
export type SetupStatus = (typeof SetupStatus)[keyof typeof SetupStatus];
