import type { AzureTable } from "@/server/models/azure/table/AzureTable";
import type { MessageEntity } from "@/shared/models/esbabbler/message";
import type { MessageMetadataEntity } from "@/shared/models/esbabbler/message/metadata";
import type { InviteEntity } from "@/shared/models/esbabbler/room/invite";

export interface AzureTableEntityMap {
  [AzureTable.Invites]: InviteEntity;
  [AzureTable.Messages]: MessageEntity;
  [AzureTable.MessagesMetadata]: MessageMetadataEntity;
}
