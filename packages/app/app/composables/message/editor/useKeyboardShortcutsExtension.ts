import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { useMessageStore } from "@/store/message";
import { useDataStore } from "@/store/message/data";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { MessageType } from "@esposter/db-schema";
import { Extension } from "@tiptap/vue-3";

export const useKeyboardShortcutsExtension = async () => {
  const { data: session } = await authClient.useSession(useFetch);
  const dataStore = useDataStore();
  const { items } = storeToRefs(dataStore);
  const { sendMessage } = dataStore;
  const messageStore = useMessageStore();
  const { editingRowKey } = storeToRefs(messageStore);
  return new Extension({
    addKeyboardShortcuts() {
      return {
        ArrowUp: () => {
          if (!EMPTY_TEXT_REGEX.test(this.editor.getText())) return false;
          const userId = session.value?.user.id;
          if (!userId) return false;
          const lastOwnMessage = items.value.find(
            ({ deletedAt, type, userId: messageUserId }) =>
              !deletedAt && type === MessageType.Message && messageUserId === userId,
          );
          if (!lastOwnMessage) return false;
          editingRowKey.value = lastOwnMessage.rowKey;
          return true;
        },
        Enter: () => {
          getSynchronizedFunction(() => sendMessage(this.editor))();
          return true;
        },
      };
    },
  });
};
