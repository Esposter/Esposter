import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Editor } from "@tiptap/core";

import { Operation } from "@esposter/shared";

export interface MessageHookMap {
  [Operation.Create]: ((message: MessageEntity) => Promise<void> | void)[];
  [Operation.Delete]: ((input: DeleteMessageInput) => Promise<void> | void)[];
  ResetSend: ((editor: Editor) => Promise<void> | void)[];
}

export const MessageHookMap: MessageHookMap = {
  [Operation.Create]: [],
  [Operation.Delete]: [],
  ResetSend: [],
};
