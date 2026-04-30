import { getBookmarkRowKey } from "#shared/services/message/getBookmarkRowKey";
import { useBookmarkStore } from "@/store/message/bookmark";
import { useUserStore } from "@/store/message/user";
import { useAppUserStore } from "@/store/message/user/appUser";
import { MessageType } from "@esposter/db-schema";

export const useReadBookmarks = () => {
  const { $trpc } = useNuxtApp();
  const bookmarkStore = useBookmarkStore();
  const { bookmarkMessageMap } = storeToRefs(bookmarkStore);
  const { readItems, readMoreItems } = bookmarkStore;
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const { storeUsers } = userStore;
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);

  const isBookmarkMessageCached = (rowKey: string) => {
    const message = bookmarkMessageMap.value.get(rowKey);
    if (!message) return false;
    if (message.type === MessageType.Webhook) return appUserMap.value.has(message.appUser.id);
    return userMap.value.has(message.userId);
  };
  const readBookmarkMessages = async (rowKeys: string[]) => {
    const unreadRowKeys = rowKeys.filter((rowKey) => !isBookmarkMessageCached(rowKey));
    if (unreadRowKeys.length === 0) return;
    const { appUsers, messages, users } = await $trpc.bookmark.readBookmarkMessages.query({ rowKeys: unreadRowKeys });
    storeUsers(users);
    for (const appUser of appUsers) appUserMap.value.set(appUser.id, appUser);
    for (const message of messages)
      bookmarkMessageMap.value.set(getBookmarkRowKey(message.partitionKey, message.rowKey), message);
  };
  const readBookmarks = () =>
    readItems(
      () => $trpc.bookmark.readBookmarks.query({}),
      ({ items }) => readBookmarkMessages(items.map(({ rowKey }) => rowKey)),
    );
  const readMoreBookmarks = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const data = await $trpc.bookmark.readBookmarks.query({ cursor });
      await readBookmarkMessages(data.items.map(({ rowKey }) => rowKey));
      return data;
    }, onComplete);
  return { readBookmarks, readMoreBookmarks };
};
