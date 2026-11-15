// The operations a message can support. Which of them a given message type actually supports, and who may
// Perform each one, are both declared by MessageTypeOperationPermissionMap.
export const MessageOperation = { Delete: "Delete", Pin: "Pin", Update: "Update", Vote: "Vote" } as const;
export type MessageOperation = (typeof MessageOperation)[keyof typeof MessageOperation];
