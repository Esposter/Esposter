import type { MessageOperation } from "#shared/models/message/MessageOperation";
import type { MessageOperationPermission } from "#shared/models/message/MessageOperationPermission";
import type { MessageType } from "@esposter/db-schema";

import { MessageTypeOperationPermissionMap } from "#shared/services/message/MessageTypeOperationPermissionMap";

// Undefined means the message type does not support the operation at all. The map is declared `as const` so each
// Entry keeps its own literal shape; widening the looked-up entry here is what lets a caller ask a type about an
// Operation it never declares.
export const getMessageOperationPermission = (
  type: MessageType,
  operation: MessageOperation,
): MessageOperationPermission | undefined => {
  const operationPermissions: Partial<Record<MessageOperation, MessageOperationPermission>> =
    MessageTypeOperationPermissionMap[type];
  return operationPermissions[operation];
};
