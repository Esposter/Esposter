import type { AzureEntity, AzureUpdateEntity } from "@/models/azure";
import { MessageEmojiMetadataEntity } from "@/models/azure/emoji";
import { MessageEntity, MessageMetadataTagEntity } from "@/models/azure/message";
import { AzureTable } from "@/models/azure/table";
import { getEntity, getTableClient, getTopNEntities } from "@/services/azure/table";
import { FETCH_LIMIT } from "@/utils/pagination";
import { odata } from "@azure/data-tables";

export const readEmojiMetadataTags = async (partitionKey: string, rowKey: string) => {
  const client = await getTableClient(AzureTable.Messages);
  const message = await getEntity(client, partitionKey, rowKey, MessageEntity);
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
  newEmojiMetadataEntity: AzureEntity<MessageEmojiMetadataEntity>,
  messageRowKey: string
) => {
  const [messageMetadataClient, messageClient, emojiMetadataTags] = await Promise.all([
    getTableClient(AzureTable.MessagesMetadata),
    getTableClient(AzureTable.Messages),
    readEmojiMetadataTags(newEmojiMetadataEntity.partitionKey, messageRowKey),
  ]);
  try {
    await Promise.all([
      messageMetadataClient.createEntity<AzureEntity<MessageEmojiMetadataEntity>>(newEmojiMetadataEntity),
      messageClient.updateEntity<AzureUpdateEntity<MessageEntity>>({
        partitionKey: newEmojiMetadataEntity.partitionKey,
        rowKey: messageRowKey,
        emojiMetadataTags: JSON.stringify([...emojiMetadataTags, { rowKey: messageRowKey }]),
      }),
    ]);
    return true;
  } catch {
    return false;
  }
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

  for (const emojiMetadataEntity of emojiMetadataEntities) {
    if (emojiMetadataEntity.emojiTag === updatedEmojiMetadataEntity.emojiTag) {
      try {
        await Promise.all([
          messageMetadataClient.updateEntity<AzureUpdateEntity<MessageEmojiMetadataEntity>>(updatedEmojiMetadataEntity),
          messageClient.updateEntity<AzureUpdateEntity<MessageEntity>>({
            partitionKey: updatedEmojiMetadataEntity.partitionKey,
            rowKey: messageRowKey,
            emojiMetadataTags: JSON.stringify(sortEmojiMetadataTags(emojiMetadataTags, emojiMetadataEntities)),
          }),
        ]);
        return true;
      } catch {
        return false;
      }
    }
  }

  return false;
};

export const deleteEmojiMetadataEntity = async (partitionKey: string, rowKey: string, messageRowKey: string) => {
  const messageClient = await getTableClient(AzureTable.Messages);
  const messageMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
  const emojiMetadataTags = await readEmojiMetadataTags(partitionKey, messageRowKey);

  try {
    await Promise.all([
      messageMetadataClient.deleteEntity(partitionKey, rowKey),
      messageClient.updateEntity<AzureUpdateEntity<MessageEntity>>({
        partitionKey,
        rowKey: messageRowKey,
        emojiMetadataTags: JSON.stringify(emojiMetadataTags.filter((e) => e.rowKey !== rowKey)),
      }),
    ]);
    return true;
  } catch {
    return false;
  }
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
