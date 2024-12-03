import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { MessageMetadataEntity } from "#shared/models/db/message/metadata/MessageMetadataEntity";
import type { InviteEntity } from "#shared/models/db/room/InviteEntity";
import type { AzureTable } from "@@/server/models/azure/table/AzureTable";

export interface AzureTableEntityMap {
  [AzureTable.Invites]: InviteEntity;
  [AzureTable.Messages]: MessageEntity;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity;
}
