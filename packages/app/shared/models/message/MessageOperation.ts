// The operations a message can support. Which of them a given message type actually supports, and who may
// Perform each one, are both declared by MessageTypeOperationPermissionMap.
export enum MessageOperation {
  Delete = "Delete",
  Pin = "Pin",
  Update = "Update",
  Vote = "Vote",
}
