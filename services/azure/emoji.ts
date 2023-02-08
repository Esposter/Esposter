import { AzureUpdateEntity } from "@/models/azure";
import { MessageEntity } from "@/models/azure/message";
import { MessageEmojiMetadataEntity } from "@/models/azure/message/emoji";
import type { MessageMetadataTagEntity } from "@/models/azure/message/metadata";
import { AzureTable } from "@/models/azure/table";
import {
createEntity,
deleteEntity,
getEntity,
getTableClient,
getTopNEntities,
updateEntity
} from "@/services/azure/table";
import { FETCH_LIMIT } from "@/utils/pagination";
import { odata } from "@azure/data-tables";

export const readEmojiMetadataTags = async (partitionKey: string, rowKey: string) => {
  const client = await getTableClient(AzureTable.Messages);
  const message = await getEntity(client, MessageEntity, partitionKey, rowKey);
  return message.emojiMetadataTags;
};

export const readEmojiMetadataEntities = async (
  partitionKey: string,
  emojiMetadataTagEntities: MessageMetadataTagEntity[]
) => {
  const client = await getTableClient(AzureTable.MessagesMetadata);
  return getTopNEntities(client, FETCH_LIMIT, MessageEmojiMetadataEntity, {
    filter: `PartitionKey eq ${odata`${partitionKey}`} and (${emojiMetadataTagEntities
      .slice(0, FETCH_LIMIT)
      .map((e) => `RowKey eq ${odata`${e.rowKey}`}`)
      .join(" or ")})`,
  });
};

export const createEmojiMetadataEntity = async (
  newEmojiMetadataEntity: MessageEmojiMetadataEntity,
  messageRowKey: string
) => {
  const [messageMetadataClient, messageClient, emojiMetadataTags] = await Promise.all([
    getTableClient(AzureTable.MessagesMetadata),
    getTableClient(AzureTable.Messages),
    readEmojiMetadataTags(newEmojiMetadataEntity.partitionKey, messageRowKey),
  ]);
  const result = await createEntity<MessageEmojiMetadataEntity>(messageMetadataClient, newEmojiMetadataEntity);
  await updateEntity<MessageEntity>(messageClient, {
    partitionKey: newEmojiMetadataEntity.partitionKey,
    rowKey: messageRowKey,
    emojiMetadataTags: [...emojiMetadataTags, { rowKey: messageRowKey }],
  });
  return result;
};

export const updateEmojiMetadataEntity = async (
  updatedEmojiMetadataEntity: AzureUpdateEntity<MessageEmojiMetadataEntity>,
  messageRowKey: string
) => {
  const [messageMetadataClient, messageClient, emojiMetadataTags] = await Promise.all([
    getTableClient(AzureTable.MessagesMetadata),
    getTableClient(AzureTable.Messages),
    readEmojiMetadataTags(updatedEmojiMetadataEntity.partitionKey, messageRowKey),
  ]);
  const emojiMetadataEntities = await readEmojiMetadataEntities(
    updatedEmojiMetadataEntity.partitionKey,
    emojiMetadataTags
  );
  const result = await updateEntity<MessageEmojiMetadataEntity>(messageMetadataClient, updatedEmojiMetadataEntity);
  await updateEntity<MessageEntity>(messageClient, {
    partitionKey: updatedEmojiMetadataEntity.partitionKey,
    rowKey: messageRowKey,
    emojiMetadataTags: sortEmojiMetadataTags(emojiMetadataTags, emojiMetadataEntities),
  });
  return result;
};

export const deleteEmojiMetadataEntity = async (partitionKey: string, rowKey: string, messageRowKey: string) => {
  const messageClient = await getTableClient(AzureTable.Messages);
  const messageMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
  const emojiMetadataTags = await readEmojiMetadataTags(partitionKey, messageRowKey);
  const result = await deleteEntity(messageMetadataClient, partitionKey, rowKey);
  await updateEntity<MessageEntity>(messageClient, {
    partitionKey,
    rowKey: messageRowKey,
    emojiMetadataTags: emojiMetadataTags.filter((e) => e.rowKey !== rowKey),
  });
  return result;
};

// We'll sort this based on number of emojis from highest to lowest per update
// so that emojis will always be sorted from highest to lowest
const sortEmojiMetadataTags = (
  emojiMetadataTags: MessageMetadataTagEntity[],
  emojiMetadataEntities: MessageEmojiMetadataEntity[]
) => {
  const result = [...emojiMetadataTags];
  result.sort((a, b) => {
    const aMetadataEntity = emojiMetadataEntities.find((e) => e.rowKey === a.rowKey)!;
    const bMetadataEntity = emojiMetadataEntities.find((e) => e.rowKey === b.rowKey)!;
    return bMetadataEntity.userIds.length - aMetadataEntity.userIds.length;
  });
  return result;
};
