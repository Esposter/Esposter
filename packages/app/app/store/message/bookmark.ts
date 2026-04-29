import type { BookmarkEntity, MessageEntity } from "@esposter/db-schema";

import { getBookmarkRowKey } from "#shared/services/message/getBookmarkRowKey";
import { useAppUserStore } from "@/store/message/user/appUser";
import { useMemberStore } from "@/store/message/user/member";
import { MessageType } from "@esposter/db-schema";

export const useBookmarkStore = defineStore("message/bookmark", () => {
  const { $trpc } = useNuxtApp();
  const memberStore = useMemberStore();
  const appUserStore = useAppUserStore();
  const { hasMore, items, readItems, readMoreItems } = useCursorPaginationData<BookmarkEntity>();
  const bookmarkMessageMap = ref(new Map<string, MessageEntity>());
  const displayItems = computed(() =>
    items.value.flatMap(({ rowKey }) => {
      const message = bookmarkMessageMap.value.get(rowKey);
      if (!message) return [];
      const creator =
        message.type === MessageType.Webhook
          ? appUserStore.appUserMap.get(message.appUser.id)
          : memberStore.memberMap.get(message.userId);
      if (!creator) return [];
      return [{ creator, message, rowKey }];
    }),
  );

  const isBookmarked = (roomId: string, messageRowKey: string) =>
    items.value.some(({ rowKey }) => rowKey === getBookmarkRowKey(roomId, messageRowKey));

  const createBookmark = async (roomId: string, messageRowKey: string) => {
    await $trpc.bookmark.createBookmark.mutate({ messageRowKey, roomId });
    items.value = [
      ...items.value,
      { partitionKey: "", rowKey: getBookmarkRowKey(roomId, messageRowKey) } as BookmarkEntity,
    ];
  };
  const deleteBookmark = async (roomId: string, messageRowKey: string) => {
    await $trpc.bookmark.deleteBookmark.mutate({ messageRowKey, roomId });
    items.value = items.value.filter(({ rowKey }) => rowKey !== getBookmarkRowKey(roomId, messageRowKey));
  };

  return {
    bookmarkMessageMap,
    createBookmark,
    deleteBookmark,
    displayItems,
    hasMore,
    isBookmarked,
    readItems,
    readMoreItems,
  };
});
