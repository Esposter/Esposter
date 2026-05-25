import type { MessageHookMap as MessageHookMapType } from "@/models/message/MessageHookMap";

import { Operation } from "@esposter/shared";

export const MessageHookMap: MessageHookMapType = {
  [Operation.Create]: [],
  [Operation.Delete]: [],
  [Operation.Update]: [],
  ResetSend: [],
};
