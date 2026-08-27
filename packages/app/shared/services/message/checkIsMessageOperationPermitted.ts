import { MessageOperationPermission } from "#shared/models/message/MessageOperationPermission";
import { exhaustiveGuard } from "@esposter/shared";

// An operation the message type does not support is permitted to nobody, so the absent permission is answered
// Here rather than at every call site. The server still distinguishes the two — an unsupported operation is a
// Bad request, an unpermitted one is unauthorized — by reading the permission before evaluating it.
export const checkIsMessageOperationPermitted = (
  permission: MessageOperationPermission | undefined,
  { hasManageMessages, isAuthor }: { hasManageMessages: boolean; isAuthor: boolean },
) => {
  if (!permission) return false;

  switch (permission) {
    case MessageOperationPermission.AnyMember:
      return true;
    case MessageOperationPermission.Author:
      return isAuthor || hasManageMessages;
    case MessageOperationPermission.ManageMessages:
      return hasManageMessages;
    default:
      return exhaustiveGuard(permission);
  }
};
