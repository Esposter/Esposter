import { getBookmarkRowKey } from "#shared/services/message/getBookmarkRowKey";
import { useBookmarkStore } from "@/store/message/bookmark";
import { useAppUserStore } from "@/store/message/user/appUser";
import { useMemberStore } from "@/store/message/user/member";

export const useReadBookmarks = () => {
  const { $trpc } = useNuxtApp();
  const bookmarkStore = useBookmarkStore();
  const { bookmarkMessageMap } = storeToRefs(bookmarkStore);
  const { readItems, readMoreItems } = bookmarkStore;
  const memberStore = useMemberStore();
  const { memberMap } = storeToRefs(memberStore);
  const appUserStore = useAppUserStore();
  const { appUserMap } = storeToRefs(appUserStore);

  const readBookmarkMessages = async (rowKeys: string[]) => {
    if (rowKeys.length === 0) return;
    const { appUsers, messages, users } = await $trpc.bookmark.readBookmarkMessages.query({ rowKeys });
    for (const user of users) memberMap.value.set(user.id, user);
    for (const appUser of appUsers) appUserMap.value.set(appUser.id, appUser);
    for (const message of messages)
      bookmarkMessageMap.value.set(getBookmarkRowKey(message.partitionKey, message.rowKey), message);
  };
  const readBookmarks = () =>
    readItems(
      () => $trpc.bookmark.readBookmarks.query({}),
      async ({ items }) => readBookmarkMessages(items.map(({ rowKey }) => rowKey)),
    );
  const readMoreBookmarks = (onComplete: () => void) =>
    readMoreItems(async (cursor) => {
      const data = await $trpc.bookmark.readBookmarks.query({ cursor });
      await readBookmarkMessages(data.items.map(({ rowKey }) => rowKey));
      return data;
    }, onComplete);
  return { readBookmarks, readMoreBookmarks };
};
