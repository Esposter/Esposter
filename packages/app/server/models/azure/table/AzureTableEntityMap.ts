import type { MessageEntity } from "#shared/models/esbabbler/message/MessageEntity";
import type { MessageMetadataEntity } from "#shared/models/esbabbler/message/metadata/MessageMetadataEntity";
import type { AzureTable } from "@@/server/models/azure/table/AzureTable";
import type { InviteEntity } from "~~/shared/models/esbabbler/room/InviteEntity";

export interface AzureTableEntityMap {
  [AzureTable.Invites]: InviteEntity;
  [AzureTable.Messages]: MessageEntity;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity;
}
