export const MessageHook = { CommitSend: "CommitSend", ResetSend: "ResetSend", RollbackSend: "RollbackSend" } as const;
export type MessageHook = (typeof MessageHook)[keyof typeof MessageHook];
