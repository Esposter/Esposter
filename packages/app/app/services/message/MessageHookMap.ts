import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { MessageEntity } from "@esposter/db";
import type { Editor } from "@tiptap/core";
import type { Promisable } from "type-fest";

import { Operation } from "@esposter/shared";

export interface MessageHookMap {
  [Operation.Create]: ((message: MessageEntity) => Promisable<void>)[];
  [Operation.Delete]: ((input: DeleteMessageInput) => Promisable<void>)[];
  [Operation.Update]: ((input: MessageEvents["updateMessage"][number]) => Promisable<void>)[];
  ResetSend: ((editor: Editor) => Promisable<void>)[];
}

export const MessageHookMap: MessageHookMap = {
  [Operation.Create]: [],
  [Operation.Delete]: [],
  [Operation.Update]: [],
  ResetSend: [],
};
