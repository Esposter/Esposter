import type { MessageEntity, StandardMessageEntity, WebhookMessageEntity } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { MESSAGE_ROWKEY_SORT_ITEM } from "#shared/services/pagination/constants";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { MessageIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MessageIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useDataStore } from "@/store/message/data";
import { useRoomStore } from "@/store/message/room";
import { CompositeKeyPropertyNames, getReverseTickedTimestamp, MessageType } from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

export const useReadMessages = () => {
  const route = useRoute();
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const dataStore = useDataStore();
  const { readItems, readMoreItems } = dataStore;
  const { hasMoreNewer, nextCursorNewer } = storeToRefs(dataStore);
  const readMembersByIds = useReadMembersByIds();
  const readAppUsers = useReadAppUsers();
  const readReplies = useReadReplies();
  const readFiles = useReadFiles();
  const readEmojis = useReadEmojis();
  const readMetadata = async (messages: MessageEntity[]) => {
    if (messages.length === 0) return;

    const webhookMessages: WebhookMessageEntity[] = [];
    const standardMessages: StandardMessageEntity[] = [];

    for (const message of messages)
      if (message.type === MessageType.Webhook) webhookMessages.push(message);
      else standardMessages.push(message);

    await Promise.all([
      readMembersByIds([...new Set(standardMessages.map(({ userId }) => userId))]),
      readAppUsers(webhookMessages.map(({ appUser }) => appUser.id)),
      readReplies([
        ...new Set(standardMessages.map(({ replyRowKey }) => replyRowKey).filter((value) => value !== undefined)),
      ]),
      readFiles(standardMessages.flatMap(({ files }) => files)),
      readEmojis(messages.map(({ rowKey }) => rowKey)),
    ]);
  };

  const readMessages = () => {
    const roomId = currentRoomId.value;
    if (!roomId)
      throw new InvalidOperationError(Operation.Read, readMessages.name, CompositeKeyPropertyNames.partitionKey);
    return readItems(
      async () => {
        const rowKey = route.params.rowKey as string | undefined;

        if (rowKey) {
          const messagesByRowKeys = await $trpc.message.readMessagesByRowKeys.query({ roomId, rowKeys: [rowKey] });
          if (messagesByRowKeys.length > 0) {
            const response = await $trpc.message.readMessages.query({
              cursor: serialize({ rowKey: takeOne(messagesByRowKeys).rowKey }, [MESSAGE_ROWKEY_SORT_ITEM]),
              isIncludeValue: true,
              roomId,
            });
            hasMoreNewer.value = true;
            nextCursorNewer.value = serialize({ rowKey: getReverseTickedTimestamp(rowKey) }, [
              MESSAGE_ROWKEY_SORT_ITEM,
            ]);
            return response;
          }
        }

        const response = await $trpc.message.readMessages.query({ roomId });
        hasMoreNewer.value = false;
        nextCursorNewer.value = undefined;
        return response;
      },
      ({ items }) => readMetadata(items),
      {
        cache: {
          read: (partitionKey) => readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey),
          write: (items, partitionKey) => writeIndexedDb(MessageIndexedDbStoreConfiguration, items, partitionKey),
        },
        onCacheRead: () => {
          hasMoreNewer.value = false;
          nextCursorNewer.value = undefined;
        },
        partitionKey: roomId,
      },
    );
  };

  const readMoreMessages = (onComplete: () => void) => {
    const roomId = currentRoomId.value;
    if (!roomId)
      throw new InvalidOperationError(Operation.Read, readMoreMessages.name, CompositeKeyPropertyNames.partitionKey);
    return readMoreItems(
      async (cursor) => {
        const response = await $trpc.message.readMessages.query({ cursor, roomId });
        await readMetadata(response.items);
        return response;
      },
      onComplete,
      {
        cache: {
          read: (partitionKey) => readIndexedDb(MessageIndexedDbStoreConfiguration, partitionKey),
          write: (items, partitionKey) => writeIndexedDb(MessageIndexedDbStoreConfiguration, items, partitionKey),
        },
        partitionKey: roomId,
      },
    );
  };

  const readMoreNewerMessages = async (onComplete: () => void) => {
    if (!currentRoomId.value) return;

    const { hasMore, items, nextCursor } = await $trpc.message.readMessages.query({
      cursor: nextCursorNewer.value,
      order: SortOrder.Asc,
      roomId: currentRoomId.value,
    });
    hasMoreNewer.value = hasMore;
    nextCursorNewer.value = nextCursor;

    const rowKeys = new Set(items.map((item) => item.rowKey));
    const newerItems: MessageEntity[] = [];
    const olderItems: MessageEntity[] = [];

    for (const item of dataStore.items)
      if (!rowKeys.has(item.rowKey))
        if (items.length > 0 && item.rowKey < takeOne(items).rowKey) newerItems.push(item);
        else olderItems.push(item);

    dataStore.items = [...newerItems, ...items, ...olderItems];
    await readMetadata(items);
    onComplete();
  };

  return { readMessages, readMoreMessages, readMoreNewerMessages };
};
