import type { MessageEntity } from "@esposter/db-schema";
import type { Editor } from "@tiptap/core";
import type { Promisable } from "type-fest";

import { MessageOperation } from "#shared/models/message/MessageOperation";
import { MessageOperationPermission } from "#shared/models/message/MessageOperationPermission";
import { getMessageOperationPermission } from "#shared/services/message/getMessageOperationPermission";
import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { useMessageStore } from "@/store/message";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { Extension } from "@tiptap/vue-3";

// Send is passed in rather than read from the data store: the room composer and the thread pane's composer
// Both bind these shortcuts, and Enter has to reach the composer the editor belongs to. The list is passed in for
// The same reason: ArrowUp edits the last own message of the conversation the composer is in, not the room's
export const useKeyboardShortcutsExtension = async (
  send: (editor: Editor) => Promisable<void>,
  messages: MaybeRefOrGetter<readonly MessageEntity[]>,
) => {
  const { data: session } = await useAuthSession();
  const messageStore = useMessageStore();
  const { editingRowKey } = storeToRefs(messageStore);
  return new Extension({
    addKeyboardShortcuts() {
      return {
        ArrowUp: () => {
          if (!EMPTY_TEXT_REGEX.test(this.editor.getText())) return false;
          const userId = session.value?.user.id;
          if (!userId) return false;
          const lastOwnMessage = toValue(messages)
            .toSorted((firstMessage, secondMessage) => compareCreatedAt(secondMessage, firstMessage))
            .find(
              ({ deletedAt, type, userId: messageUserId }) =>
                !deletedAt &&
                getMessageOperationPermission(type, MessageOperation.Update) === MessageOperationPermission.Author &&
                messageUserId === userId,
            );
          if (!lastOwnMessage) return false;
          editingRowKey.value = lastOwnMessage.rowKey;
          return true;
        },
        Enter: () => {
          getSynchronizedFunction(() =>
            getResultAsync(async () => {
              await send(this.editor);
            }).match(noop, console.error),
          )();
          return true;
        },
      };
    },
  });
};
