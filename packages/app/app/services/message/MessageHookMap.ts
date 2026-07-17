import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEvents } from "#shared/models/message/events/MessageEvents";
import type { MessageEntity } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";
import type { Promisable } from "type-fest";

import { createHookRegistry } from "@/services/shared/createHookRegistry";
import { Operation } from "@esposter/shared";

export const MessageHookMap = {
  [Operation.Create]: createHookRegistry<(message: MessageEntity) => Promisable<void>>(),
  [Operation.Delete]: createHookRegistry<(input: DeleteMessageInput) => Promisable<void>>(),
  [Operation.Update]: createHookRegistry<(input: MessageEvents["updateMessage"][number]) => Promisable<void>>(),
  ResetSend: createHookRegistry<(editor?: Editor) => Promisable<void>>(),
};
