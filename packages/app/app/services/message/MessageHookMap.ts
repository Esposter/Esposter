import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Editor } from "@tiptap/core";
import type { Promisable } from "type-fest";

import { Operation } from "@esposter/shared";

export interface MessageHookMap {
  [Operation.Create]: ((message: MessageEntity) => Promisable<void>)[];
  [Operation.Delete]: ((input: DeleteMessageInput) => Promisable<void>)[];
  ResetSend: ((editor: Editor) => Promisable<void>)[];
}

export const MessageHookMap: MessageHookMap = {
  [Operation.Create]: [],
  [Operation.Delete]: [],
  ResetSend: [],
};
